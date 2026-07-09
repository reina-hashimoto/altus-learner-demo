import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UBHeader } from '@/components/shell/UBHeader'
import { LeftRail } from '@/components/shell/LeftRail'
import { GoalHeader } from '@/features/goal/GoalHeader'
import { SkillsCard } from '@/features/goal/SkillsCard'
import { LearningPathCard } from '@/features/goal/LearningPathCard'
import { InfoModal } from '@/features/goal/InfoModal'
import { AssessmentModal } from '@/features/goal/AssessmentModal'
import { AltusPanel, type AltusMessage, type AltusView, type GoalReview } from '@/features/goal/altus/AltusPanel'
import { useChatThreads, makeSampleThreads } from '@/features/goal/altus/chatThreads'
import { ArchiveSection } from '@/features/goal/ArchiveSection'
import { CongratsCard } from '@/features/goal/CongratsCard'
import { Confetti } from '@/screens/beta/personal/Confetti'
import { UdemyIcon } from '@/components/icons/UdemyIcon'
import type { ProficiencySelections } from '@/features/goal/SkillProficiencyForm'
import { getFlow, defaultFlowId } from '@/flows/registry'
import { getFlowConfig, type ChipDef } from '@/flows/config'
import { SKILLS_CUSTOM_DS, COURSES_CUSTOM_DS, makeFlexExtras, type FlexExtraChoice, GOAL_META, type Skill, type Course } from '@/data/goal'
import { cn } from '@/components/ui/utils'

// 'review' = showing Review Your Goal card, 'confirming' = spinner + brief wait
type Stage = 'intro' | 'proficiency' | 'review' | 'confirming' | 'done'

/** Id of the thread that carries the scripted, flow-driven conversation. */
const MAIN_THREAD_ID = 'main'

const LEVEL_NAMES = ['Foundational', 'Intermediate', 'Established', 'Advanced']

// How long the course cards glow (spin) while their lecture counts load in.
// The grey loading bar shows for this whole window; the number updates when it ends.
const GLOW_MS = 4000

// Per-skill offsets (by chart position) added to a skill's target for the earned
// assessment score, so verified skills land ABOVE target but at varied points
// instead of all showing the same default (148).
const EARNED_OFFSETS = [16, 34, 24, 42, 12, 30]
function earnedScore(target: number, idx: number): number {
  return Math.min(target + EARNED_OFFSETS[((idx % EARNED_OFFSETS.length) + EARNED_OFFSETS.length) % EARNED_OFFSETS.length], 196)
}

// Maps a post-beta flow id to its Learning-goals card id, so the goal-complete
// CTA can mark the right card done (green check) on return.
const FLOW_GOAL_CARD_ID: Record<string, string> = {
  'flex-pm': 'flex',
  'fixed-pm': 'fixed',
  'open-pm': 'open',
}

// ── Review-stage chat helpers ──────────────────────────────────────────────

/** Realistic weekly commitment bounds (minutes). */
const MIN_WEEKLY_MINUTES = 30
const MAX_WEEKLY_MINUTES = 20 * 60 // 20h/week

/** Words that identify a job-title / role phrase. */
const ROLE_KEYWORDS =
  /\b(data|scientist|product|manager|analyst|engineer|designer|developer|lead|staff|senior|principal|director|architect|researcher|pm|ds|vp|head|owner|specialist|consultant)\b/i

function titleCase(s: string): string {
  return s
    .toLowerCase()
    .replace(/\b([a-z])/g, (c) => c.toUpperCase())
    // keep common acronyms upper
    .replace(/\b(Ai|Ml|Ux|Ui|Api|Qa)\b/g, (m) => m.toUpperCase())
}

/** Extract the requested weekly commitment in minutes, or null if none found. */
function parseTargetMinutes(text: string): number | null {
  const t = text.toLowerCase()
  // Value stated after "to" (e.g. "from 1 hour to 2 hours") wins.
  let m = t.match(/to\s+(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|時間)/)
  if (m) return Math.round(parseFloat(m[1]) * 60)
  m = t.match(/to\s+(\d+)\s*(?:minutes?|mins?|分)/)
  if (m) return parseInt(m[1], 10)
  if (/half\s*(?:an?\s*)?hour|30\s*(?:minutes?|mins?|分)/.test(t)) return 30
  // Otherwise the last quantity mentioned.
  const hrs = [...t.matchAll(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|時間)/g)]
  if (hrs.length) return Math.round(parseFloat(hrs[hrs.length - 1][1]) * 60)
  const mins = [...t.matchAll(/(\d+)\s*(?:minutes?|mins?|分)/g)]
  if (mins.length) return parseInt(mins[mins.length - 1][1], 10)
  return null
}

/** Format minutes as e.g. "1 hour 30 minutes/week" (30-minute granularity). */
function formatWeeklyTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h} hour${h > 1 ? 's' : ''}`)
  if (m > 0) parts.push(`${m} minutes`)
  if (parts.length === 0) parts.push('0 minutes')
  return `${parts.join(' ')}/week`
}

/** Round minutes to the nearest 30-minute increment (ties round up). */
function roundToHalfHour(minutes: number): number {
  return Math.round(minutes / 30) * 30
}

/** Chat message shown when courses are dropped because their skill already met target. */
function reachedTargetMessage(skillNames: string[]): string {
  const list =
    skillNames.length <= 1
      ? skillNames[0] ?? 'a skill'
      : `${skillNames.slice(0, -1).join(', ')} and ${skillNames.slice(-1)}`
  const plural = skillNames.length > 1
  return `You've already reached the target proficiency for ${list}, so I've removed the related ${plural ? 'courses' : 'course'} from your learning path. To make it official, take the Udemy assessment to verify your level.`
}

/**
 * Rough "is this keyboard-mashing / not real words" check, used to tailor the
 * out-of-scope reply. Treats empty/symbol-only input and long vowel-less latin
 * runs as gibberish; anything with CJK characters is assumed to be real text.
 */
function looksLikeGibberish(text: string): boolean {
  const meaningful = text.replace(/[^a-zA-Z぀-ヿ一-鿿0-9]/g, '')
  if (meaningful.length === 0) return true
  if (/[぀-ヿ一-鿿]/.test(text)) return false
  const latin = text.toLowerCase().replace(/[^a-z]/g, '')
  if (latin.length < 4) return false
  // Real words carry vowels; keyboard-mashing ("asdfghjkl", "qwrtzxcvb") barely does.
  const vowels = (latin.match(/[aeiou]/g) || []).length
  return vowels / latin.length < 0.2
}

export default function GoalPage() {
  const { flowId } = useParams()
  const navigate = useNavigate()
  const flow = getFlow(flowId) ?? getFlow(defaultFlowId)!
  const config = getFlowConfig(flow.scenarioId ?? 'fixed', flow.persona ?? 'product-manager')
  // Flex scenario gets the Personal-flow polish: range target-proficiency band,
  // richer assessment choreography, and a confetti + goal-complete check once every
  // skill is verified. Other scenarios keep their original behaviour.
  const isFlex = flow.scenarioId === 'flex'

  const introMessages: AltusMessage[] = config.intro.map((text, i) => ({
    id: `intro-${i}`,
    role: 'assistant',
    text,
  }))

  const [stage, setStage] = useState<Stage>('intro')
  const [messages, setMessages] = useState<AltusMessage[]>([])
  const [introPhase, setIntroPhase] = useState(0)

  // Chat-thread history (design "1b") — namespaced per flow so each scenario
  // keeps its own thread list. The scripted conversation above lives in the
  // "main" thread; sample threads exist to demo switch/rename/delete/expiry.
  const chats = useChatThreads(
    () => [
      { id: MAIN_THREAD_ID, title: config.goalTitle, messages: [], createdAt: Date.now(), updatedAt: Date.now() },
      ...makeSampleThreads(),
    ],
    `altus.threads.${flow.id}`,
  )
  const [historyOpen, setHistoryOpen] = useState(false)
  const onMainThread = chats.activeId === MAIN_THREAD_ID

  // Write the live, scripted conversation through into the store so it
  // persists/sorts/expires like any other thread.
  useEffect(() => {
    chats.setThreadMessages(MAIN_THREAD_ID, messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])
  // `proficiency` is the live form draft; `committedProficiency` is what's actually
  // applied to the chart. Re-editing keeps the committed values on screen (no
  // regression to Estimated) until the form is submitted again.
  const [proficiency, setProficiency] = useState<ProficiencySelections>({})
  const [committedProficiency, setCommittedProficiency] = useState<ProficiencySelections>({})
  const [userRole, setUserRole] = useState('')
  const idRef = useRef(0)
  const nextId = () => `m${++idRef.current}`

  // Drip intro messages in one by one with a typing indicator between each.
  useEffect(() => {
    if (introPhase >= introMessages.length) return
    const delay = introPhase === 0 ? 800 : 700
    const t = setTimeout(() => {
      setMessages((prev) => [...prev, introMessages[introPhase]])
      setIntroPhase((p) => p + 1)
    }, delay)
    return () => clearTimeout(t)
  // introMessages is stable (derived from config which doesn't change during mount)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introPhase])

  // Progressive reveal animation states for the left panel cards.
  // For custom (staticPlaceholder): skills start hidden, path starts hidden.
  // For other scenarios: both start visible (no animation needed).
  const [skillsContentReady, setSkillsContentReady] = useState(config.skillsKnown)
  const [skillsAnimated, setSkillsAnimated] = useState(config.skillsKnown)
  const [pathContentReady, setPathContentReady] = useState(config.pathMode !== 'empty')
  const [pathAnimated, setPathAnimated] = useState(config.pathMode !== 'empty')

  // Custom scenario: skeleton shimmer phase (between role entry and chart reveal).
  const [skillsShimmer, setSkillsShimmer] = useState(false)
  // Custom scenario: path skeleton shimmers while the path is being generated.
  const [pathShimmer, setPathShimmer] = useState(false)
  // Level definitions info modal (opened from the proficiency form).
  const [levelDefsOpen, setLevelDefsOpen] = useState(false)
  // Custom scenario: trigger bar width animation on first chart render.
  const [skillsBarsAnimating, setSkillsBarsAnimating] = useState(false)
  // Typing indicator while waiting between role entry and proficiency form.
  const [loadingProficiency, setLoadingProficiency] = useState(false)
  // Hides the proficiency form while the spinner pill is transitioning to check pill.
  const [updatingSkills, setUpdatingSkills] = useState(false)
  // Active skills/courses — start from config but swap to DS set when role is DS.
  const [activeSkills, setActiveSkills] = useState<Skill[]>(config.skills)
  const [activeCourses, setActiveCourses] = useState<Course[]>(config.courses)

  // Flex: course cards currently re-optimizing (glow + lecture-count loading).
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set())
  // Flex: cards that just finished updating — their meta briefly bolds to highlight the change.
  const [justUpdatedIds, setJustUpdatedIds] = useState<Set<string>>(new Set())
  // Flex: Role Play / Hands-on Lab extras appended after the learner requests them.
  const [flexExtras, setFlexExtras] = useState<Course[]>([])
  // Flex: after the "fewer videos" request, trim every video course to its optimized length.
  const [videoTrimmed, setVideoTrimmed] = useState(false)
  // Flex: courses playing the collapse/fade exit (skill already met the target).
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  // Flex: courses fully removed from the path (filtered out after the exit animation).
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  // Flex: skills that reached target via self-report — their Assess button turns primary.
  const [primaryAssessIds, setPrimaryAssessIds] = useState<Set<string>>(new Set())
  // Flex: the onboarding tooltip is shown whenever a reached-target skill exists and it
  // hasn't been dismissed. Once the learner clicks "Got it", it never shows again.
  const [assessOnboardingDismissed, setAssessOnboardingDismissed] = useState(false)
  // Skill whose Udemy assessment popup is open (null = closed).
  const [assessmentSkill, setAssessmentSkill] = useState<Skill | null>(null)
  // Skills officially verified via a Udemy assessment — bar turns dark green + Retake.
  const [verifiedSkillIds, setVerifiedSkillIds] = useState<Set<string>>(new Set())
  // Per-skill earned assessment score (0–200), varied above each skill's target.
  const [verifiedScores, setVerifiedScores] = useState<Record<string, number>>({})
  // Skill to briefly celebrate near its chart row after verification.
  const [celebrateSkillId, setCelebrateSkillId] = useState<string | null>(null)
  // Full-screen confetti + green completion check, fired once every skill is verified.
  const [confettiOn, setConfettiOn] = useState(false)
  const [goalComplete, setGoalComplete] = useState(false)

  // Mutable goal review fields — updated via chat in the 'review' stage.
  const [weeklyTime, setWeeklyTime] = useState('1 hour/week')
  const [reviewRole, setReviewRole] = useState('')
  // Shows skeleton loading state in the review card while it's regenerating.
  const [reviewLoading, setReviewLoading] = useState(false)
  // "Altus is thinking" indicator while a review-stage reply is being prepared.
  const [reviewThinking, setReviewThinking] = useState(false)
  // True after Altus proposes a rounded weekly time, awaiting the user's yes/no.
  const [awaitingRoundConfirm, setAwaitingRoundConfirm] = useState(false)
  // Flex: true after Altus asks which hands-on practice to add (role play / lab / both).
  const [awaitingExtrasChoice, setAwaitingExtrasChoice] = useState(false)
  // Flex: collapsible "previously studied" archive of items dropped once their skill reached target.
  const [archiveOpen, setArchiveOpen] = useState(false)

  const revealSkills = () => {
    setSkillsShimmer(false)
    setSkillsBarsAnimating(true)
    setSkillsContentReady(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setSkillsAnimated(true)))
  }

  const revealPath = () => {
    setPathContentReady(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setPathAnimated(true)))
  }

  const done = stage === 'done'

  // Once anything has been committed, the chart shows self-reported data — and keeps
  // showing it while the form is re-opened for editing (drives Issue-1 fix).
  const hasCommitted = Object.keys(committedProficiency).length > 0

  // Per-skill overrides: assessed skills → selfReported (purple), skipped → estimated (orange).
  const perSkillMode: Record<string, 'estimated' | 'selfReported'> | undefined = hasCommitted
    ? Object.fromEntries(activeSkills.map((s) => [s.id, committedProficiency[s.id] !== undefined ? 'selfReported' : 'estimated']))
    : undefined

  // Populate selfReported values from the committed level selections (levelIdx → band centre).
  const skillsForChart = hasCommitted
    ? activeSkills.map((s) => {
        const levelIdx = committedProficiency[s.id]
        return levelIdx !== undefined ? { ...s, selfReported: levelIdx * 50 + 25 } : s
      })
    : activeSkills

  // Skeleton states.
  const skillsSkeleton = !skillsContentReady
  const pathSkeleton = !pathContentReady

  // Skills whose self-reported level meets or exceeds the target — exclude their courses from the path.
  const masteredSkillNames: Set<string> = hasCommitted
    ? new Set(
        activeSkills
          .filter((s) => {
            const levelIdx = committedProficiency[s.id]
            if (levelIdx === undefined) return false
            const selfCenter = levelIdx * 50 + 25
            const targetCenter = Math.min(Math.floor(s.target / 50), 3) * 50 + 25
            return selfCenter >= targetCenter
          })
          .map((s) => s.name),
      )
    : new Set()

  // Flex skill classification vs the learner's self-report:
  //  reached   → self-report met/exceeded the target  → course removed from the path
  //  improved  → rose above the estimate but < target  → fewer lectures (optimized)
  //  regressed → fell below the estimate               → more lectures (expanded)
  //  same/skipped → unchanged
  const skillByTag = (tag: string) => activeSkills.find((s) => s.name === tag)
  const bandOf = (v: number) => Math.min(Math.floor(v / 50), 3)
  type SkillState = 'reached' | 'improved' | 'regressed' | 'same'
  const flexSkillState = (s: Skill): SkillState => {
    const lvl = committedProficiency[s.id]
    if (lvl === undefined) return 'same'
    if (lvl >= bandOf(s.target)) return 'reached'
    if (lvl > bandOf(s.estimated)) return 'improved'
    if (lvl < bandOf(s.estimated)) return 'regressed'
    return 'same'
  }

  const flexAdjustCourse = (c: Course): Course => {
    if ((c.kind ?? 'course') !== 'course') return c
    if (videoTrimmed && c.optimized) return { ...c, ...c.optimized }
    const s = skillByTag(c.skillTag)
    if (!s) return c
    const state = flexSkillState(s)
    if (state === 'improved' && c.optimized) return { ...c, ...c.optimized }
    if (state === 'regressed' && c.expanded) return { ...c, ...c.expanded }
    return c // 'same' or 'reached' → base lectures ('reached' is removed elsewhere)
  }

  // Skills that reached target (self-report) and the course ids they map to.
  const reachedSkillIds = new Set(
    config.optimizeBySkill ? activeSkills.filter((s) => flexSkillState(s) === 'reached').map((s) => s.id) : [],
  )
  const reachedCourseIds = new Set(
    activeCourses
      .filter((c) => (c.kind ?? 'course') === 'course' && reachedSkillIds.has(skillByTag(c.skillTag)?.id ?? ''))
      .map((c) => c.id),
  )
  // Skills that have met their target — via self-report OR a verified assessment.
  // Practice (role play / lab) is only recommended for skills NOT yet in this set.
  const reachedForPracticeIds = new Set<string>([...reachedSkillIds, ...verifiedSkillIds])

  // Reached-target-but-unverified skills → Assess button turns primary + a one-time
  // "make it official" tooltip. Derived synchronously the moment the goal reaches
  // 'done', so the primary state appears within ~1s of confirming — it no longer
  // waits on Flex's multi-second path-optimization glow. (Flex still sets its own
  // primaryAssessIds during that choreography; we union it in so nothing regresses.)
  const reachedUnverifiedIds = new Set(
    done ? activeSkills.filter((s) => flexSkillState(s) === 'reached' && !verifiedSkillIds.has(s.id)).map((s) => s.id) : [],
  )
  const effectivePrimaryAssessIds = new Set<string>([...reachedUnverifiedIds, ...primaryAssessIds])

  const displayedCourses = (() => {
    if (config.optimizeBySkill) {
      // Keep every course/extra except those fully removed; adjust lectures + append extras.
      return [
        ...activeCourses.filter((c) => !removedIds.has(c.id)).map(flexAdjustCourse),
        ...flexExtras.filter((e) => !removedIds.has(e.id)),
      ]
    }
    // Other scenarios: mastered skills drop out of the path entirely.
    return activeCourses.filter((c) => !masteredSkillNames.has(c.skillTag))
  })()

  // Flex: items removed because their skill reached target — shown in the archive.
  const archivedItems = config.optimizeBySkill
    ? [...activeCourses, ...flexExtras].filter((c) => removedIds.has(c.id))
    : []

  // Reset the flex re-optimization state so a re-submitted self-report rebuilds the
  // path from scratch (dropped courses return, primary Assess buttons revert, etc.).
  // The onboarding tooltip is not re-shown once dismissed.
  const resetFlexOptimization = () => {
    setAnimatingIds(new Set())
    setJustUpdatedIds(new Set())
    setRemovingIds(new Set())
    setRemovedIds(new Set())
    setPrimaryAssessIds(new Set()) // clearing this also hides the onboarding tooltip
  }

  // Assessment passed: mark the skill verified (dark-green bar + Retake), celebrate near
  // its chart row, and drop any remaining course for that skill from the learning path.
  const completeAssessment = () => {
    const s = assessmentSkill
    setAssessmentSkill(null)
    if (!s) return
    setVerifiedSkillIds((prev) => new Set([...prev, s.id]))
    // Record the earned score (varied, above target) so the bar isn't a flat 148.
    setVerifiedScores((prev) => ({
      ...prev,
      [s.id]: earnedScore(s.target, Math.max(activeSkills.findIndex((sk) => sk.id === s.id), 0)),
    }))
    setPrimaryAssessIds((prev) => {
      const next = new Set(prev)
      next.delete(s.id)
      return next
    })
    // A verified skill has met its target, so drop its video course AND any
    // practice (role play / lab) we'd added for it — no extra work needed.
    const courseIds = [...activeCourses, ...flexExtras]
      .filter((c) => c.skillTag === s.name && !removedIds.has(c.id))
      .map((c) => c.id)

    if (!isFlex) {
      // Original behaviour for non-flex scenarios: drop courses + celebrate immediately.
      if (courseIds.length) {
        setRemovingIds(new Set(courseIds))
        window.setTimeout(() => {
          setRemovedIds((prev) => new Set([...prev, ...courseIds]))
          setRemovingIds(new Set())
        }, 650)
      }
      setCelebrateSkillId(s.id)
      window.setTimeout(() => setCelebrateSkillId(null), 2200)
      return
    }

    // Flex: Personal-flow choreography. Celebrate near the bar shortly after the
    // modal closes, then drop any remaining course(s) for this skill (keep extras).
    window.setTimeout(() => {
      setCelebrateSkillId(s.id)
      window.setTimeout(() => setCelebrateSkillId(null), 1600)
    }, 750)
    if (courseIds.length) {
      window.setTimeout(() => {
        setRemovingIds(new Set(courseIds))
        window.setTimeout(() => {
          setRemovedIds((prev) => new Set([...prev, ...courseIds]))
          setRemovingIds(new Set())
        }, 650)
      }, 900)
    }
    // When the final skill is verified, celebrate the whole goal: mark it complete
    // (green check + Congrats card) at the same moment the confetti starts falling,
    // then stop the confetti once it's rained down.
    const willAllBeVerified = activeSkills.every((sk) => sk.id === s.id || verifiedSkillIds.has(sk.id))
    if (willAllBeVerified) {
      window.setTimeout(() => {
        setConfettiOn(true)
        setGoalComplete(true)
        window.setTimeout(() => setConfettiOn(false), 3800)
      }, 1700)
    }
  }

  // Glow the given cards (spin + grey loading bar) for GLOW_MS, then reveal the
  // updated counts and briefly bold their meta line to spotlight what changed.
  const runGlow = (ids: Set<string>) => {
    if (!ids.size) return
    setAnimatingIds(ids)
    window.setTimeout(() => {
      setAnimatingIds(new Set())
      setJustUpdatedIds(ids)
      window.setTimeout(() => setJustUpdatedIds(new Set()), 2000)
    }, GLOW_MS)
  }

  // Flex: when the path first reaches 'done', glow the affected cards. Courses whose
  // skill only improved get their lecture count re-optimized (loading bar → bold reveal);
  // courses whose skill already met the target glow, then collapse out of the path.
  useEffect(() => {
    if (stage !== 'done' || !config.optimizeBySkill) return
    const optimizeIds = new Set(
      activeCourses
        .filter((c) => (c.kind ?? 'course') === 'course' && !removedIds.has(c.id) && flexAdjustCourse(c).lectures !== c.lectures)
        .map((c) => c.id),
    )
    // Reached-target skills drop their course AND any generated role play / lab.
    const reachedExtraIds = new Set(
      flexExtras.filter((e) => reachedSkillIds.has(skillByTag(e.skillTag)?.id ?? '')).map((e) => e.id),
    )
    const reachedItemIds = new Set([...reachedCourseIds, ...reachedExtraIds])
    const glowIds = new Set([...optimizeIds, ...reachedItemIds])
    if (!glowIds.size) return
    setAnimatingIds(glowIds)
    window.setTimeout(() => {
      setAnimatingIds(new Set())
      if (optimizeIds.size) {
        setJustUpdatedIds(optimizeIds)
        window.setTimeout(() => setJustUpdatedIds(new Set()), 2000)
      }
      if (reachedItemIds.size) {
        setRemovingIds(new Set(reachedItemIds)) // start the collapse/fade exit → archive
        const reachedNames = activeSkills.filter((s) => reachedSkillIds.has(s.id)).map((s) => s.name)
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'assistant', text: reachedTargetMessage(reachedNames) },
        ])
        window.setTimeout(() => {
          setRemovedIds((prev) => new Set([...prev, ...reachedItemIds]))
          setRemovingIds(new Set())
          setPrimaryAssessIds(new Set(reachedSkillIds)) // Assess → primary (also drives the tooltip)
        }, 650)
      }
    }, GLOW_MS)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage])

  // "Review your goal" card data — only shown in 'review' stage for custom scenario.
  const goalReview: GoalReview | null =
    config.showGoalConfirmation && stage === 'review'
      ? {
          role: reviewRole || userRole || config.role,
          targetDate: 'August 31, 2026',
          weeklyTime,
          skills: activeSkills.map((s) => {
            const levelIdx = committedProficiency[s.id]
            const bandIdx = levelIdx !== undefined ? levelIdx : Math.min(Math.floor(s.estimated / 50), 3)
            return {
              name: s.name,
              level: LEVEL_NAMES[bandIdx],
              source: levelIdx !== undefined ? 'Self-reported' : 'Estimated',
            }
          }),
        }
      : null

  const isDsRole = (input: string) =>
    /data\s*scientist|データサイエンティスト|\bds\b/i.test(input)

  /**
   * Map a free-text role entry to a canonical Title-Case role.
   * Accepts synonyms, abbreviations, and common typos for the two supported
   * roles; returns null when the input is too far off to interpret.
   */
  const normalizeRole = (input: string): string | null => {
    const s = input.toLowerCase().trim()
    const compact = s.replace(/[^a-z]/g, '')
    // Japanese
    if (/データ\s*サイエンティスト/.test(input)) return 'Data Scientist'
    if (/プロダクト\s*マネー?ジャー?/.test(input)) return 'Product Manager'
    // Data Scientist — abbreviation, or "data" + a "scien…" stem (covers typos)
    if (/\bds\b/.test(s) || (s.includes('data') && /scien/.test(s)) || compact.includes('datascien'))
      return 'Data Scientist'
    // Product Manager — abbreviation, or "product" + a manager stem (covers typos)
    if (/\bpm\b/.test(s) || (s.includes('product') && /(manag|mgr|mngr)/.test(s)) || compact.includes('productmanag'))
      return 'Product Manager'
    return null
  }

  const startProficiency = (role?: string) => {
    if (stage !== 'intro') return

    // Add user's role message immediately.
    if (role) setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: role }])

    // If a DS role is entered on the custom scenario, swap to DS skills/courses.
    if (config.staticPlaceholder && role && isDsRole(role)) {
      setActiveSkills(SKILLS_CUSTOM_DS)
      setActiveCourses(COURSES_CUSTOM_DS)
    }

    // For custom: switch skeleton from static → shimmer, show typing indicator while "loading skills".
    if (config.staticPlaceholder) setSkillsShimmer(true)
    setLoadingProficiency(true)

    // Custom gets 2 s of shimmer loading; other scenarios get a brief thinking pause.
    const delay = config.staticPlaceholder ? 2000 : 800
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text: config.proficiencyPrompt }])
      if (config.staticPlaceholder) revealSkills()
      setLoadingProficiency(false)
      setStage('proficiency')
    }, delay)
  }

  const isRoleRelated = (input: string) => {
    const words = config.role.toLowerCase().split(' ')
    const lower = input.toLowerCase()
    return words.some((w) => lower.includes(w))
  }

  const assistantReply = (text: string) =>
    setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text }])

  /**
   * Reply after a brief "Altus is thinking" pause so the response feels
   * considered rather than instant. `before` runs just before the message
   * appears (e.g. to apply a state change alongside the reply).
   */
  const replyAfterThinking = (text: string, before?: () => void, delay = 1500) => {
    setReviewThinking(true)
    window.setTimeout(() => {
      setReviewThinking(false)
      before?.()
      assistantReply(text)
    }, delay)
  }

  /** Apply a new weekly study time with the review-card skeleton loading state. */
  const applyWeeklyTime = (newTime: string, message: string) => {
    setReviewLoading(true)
    window.setTimeout(() => {
      setWeeklyTime(newTime)
      setReviewLoading(false)
      assistantReply(message)
    }, 1200)
  }

  // Flex: open the content player for a suggested course in a new tab (like the
  // Personal flow). Video courses play the topic clip; role plays / labs pass their
  // kind so the player renders the right experience.
  const openPlayer = (course: Course) => {
    const base = import.meta.env.BASE_URL
    const isDesignTopic = /design|prototyp|ux|ui/i.test(`${course.skillTag} ${course.title}`)
    const q = new URLSearchParams({
      title: course.title,
      tag: course.skillTag,
      lectures: String(course.lectures || 12),
      kind: course.kind ?? 'course',
      video: isDesignTopic ? 'design' : 'programming',
    })
    window.open(`${base}${flowId}/player?${q.toString()}`, '_blank', 'noopener')
  }

  /**
   * Handle a change request while the "Review your goal" card is shown.
   * Only weekly study time, current role, and skill proficiency can change;
   * the target timeline is a hard requirement set by the assigner. Anything
   * else is politely declined.
   */
  const handleReviewRequest = (text: string) => {
    const t = text.toLowerCase()
    // After the goal is confirmed (done stage) there's no Confirm step, so
    // success replies drop the "confirm when you're ready" phrasing.
    const isDone = stage === 'done'

    // 0) Resolving a pending "shall I round it?" proposal.
    if (awaitingRoundConfirm) {
      setAwaitingRoundConfirm(false)
      const isNo = /\b(no|nope|nah|don'?t|do not|rather not|keep|simple|1\s*hour|one\s*hour)\b|嫌|やめ|いや/i.test(t)
      const isYes = /\b(yes|yep|yeah|sure|ok|okay|sounds good|works|good|great|perfect|fine|please do)\b|はい|いい/i.test(t)
      if (isNo) {
        applyWeeklyTime(
          '1 hour/week',
          "No problem — I'll keep it at 1 hour/week so it's easy to remember. And studying more than your weekly target is always a great thing, so feel free to go beyond it whenever you can! 🎉",
        )
        return
      }
      if (isYes) {
        assistantReply("Great — I'll keep that. Confirm when you're ready.")
        return
      }
      // Anything else: fall through and treat as a fresh request.
    }

    // 0.5) Flex: resolving a pending "role play, lab, or both?" question.
    if (awaitingExtrasChoice) {
      // Explicit bail-out.
      if (/\b(never\s*mind|nevermind|cancel|forget|no\s*thanks|nothing|none|stop)\b|やめ|なし|いい(です)?|結構/i.test(t)) {
        setAwaitingExtrasChoice(false)
        replyAfterThinking('No problem — I\'ve left your learning path as it is. Let me know if you change your mind.')
        return
      }
      const wantsRP = /role\s*play|roleplay|ロールプレイ/i.test(t)
      const wantsLab = /hands[-\s]?on|\blabs?\b|ハンズオン|ラボ/i.test(t)
      const wantsBoth = /\bboth\b|two|either|any|一緒|両方|りょうほう|どっち?も|全部|ぜんぶ/i.test(t) || (wantsRP && wantsLab)
      const choice: FlexExtraChoice | null = wantsBoth ? 'both' : wantsRP ? 'roleplay' : wantsLab ? 'lab' : null
      if (!choice) {
        replyAfterThinking("Sorry, I didn't catch that. Would you like a role play, a hands-on lab, or both?")
        return
      }
      setAwaitingExtrasChoice(false)
      // Skills already at target (self-report OR verified assessment) get no extra
      // content — same rule as courses.
      const eligibleSkills = activeSkills.filter((s) => !reachedForPracticeIds.has(s.id))
      if (eligibleSkills.length === 0) {
        replyAfterThinking("You've already reached the target proficiency for every skill in this goal, so there's no extra practice to add — nice work! 🎉")
        return
      }
      const extras = makeFlexExtras(eligibleSkills, choice)
      // Video courses that will actually shrink once trimmed to their optimized length.
      const toGlow = new Set(
        activeCourses
          .filter((c) => (c.kind ?? 'course') === 'course' && c.optimized && flexAdjustCourse(c).lectures > c.optimized.lectures)
          .map((c) => c.id),
      )
      const label =
        choice === 'both' ? 'a role play and a hands-on lab' : choice === 'roleplay' ? 'a role play' : 'a hands-on lab'
      const scope = eligibleSkills.length < activeSkills.length ? " for the skills you haven't reached yet" : ' for each skill'
      replyAfterThinking(
        `Done — I've trimmed some of the video lectures and added ${label}${scope} to your path.`,
        () => {
          setVideoTrimmed(true)
          setFlexExtras(extras)
          runGlow(toGlow)
        },
      )
      return
    }

    // 1) Target timeline — hard requirement, not changeable.
    const isTimeline =
      /deadline|due\s*date|target\s*date|time\s*line|timeline|completion\s*date|extend|push\s*(back|out)|more\s*time\b|期限|締切|締め切り|納期|期日/.test(t)
    if (isTimeline) {
      replyAfterThinking(
        `The target date is set by ${config.fromLabel?.replace(/^From\s+/, '') ?? 'your organization'} as a requirement for this goal, so it can't be changed. I can still adjust your weekly study time, role, or skill proficiency.`,
      )
      return
    }

    // 2) Weekly study time — increase or decrease within a realistic range.
    const mentionsTime =
      /study\s*time|per\s*week|a\s*week|weekly|hours?\b|hrs?\b|minutes?\b|mins?\b|時間|分|週|勉強|学習/.test(t)
    if (mentionsTime) {
      const minutes = parseTargetMinutes(text)
      if (minutes === null) {
        replyAfterThinking('How many hours per week would you like to commit to this goal?')
        return
      }
      if (minutes < MIN_WEEKLY_MINUTES) {
        replyAfterThinking(
          `That's a little too low to make meaningful progress. Let's keep it at 1 hour/week, or share a more realistic time (at least 30 minutes/week).`,
        )
        return
      }
      if (minutes > MAX_WEEKLY_MINUTES) {
        replyAfterThinking(
          `${formatWeeklyTime(minutes)} isn't very realistic to sustain. Let's keep it at 1 hour/week, or pick something more manageable (up to about 20 hours/week).`,
        )
        return
      }
      const rounded = roundToHalfHour(minutes)
      if (minutes % 30 === 0) {
        // Already on a 30-minute increment — apply directly.
        applyWeeklyTime(
          formatWeeklyTime(rounded),
          isDone
            ? `Done — your weekly study time is now ${formatWeeklyTime(rounded)}.`
            : `Updated your weekly study time to ${formatWeeklyTime(rounded)}. Does this look right? Confirm when you're ready.`,
        )
      } else {
        // Odd value — round to the nearest 30 minutes and propose it.
        setAwaitingRoundConfirm(true)
        applyWeeklyTime(
          formatWeeklyTime(rounded),
          `${minutes} minutes is a little uneven, so I've rounded it to ${formatWeeklyTime(rounded)}. Does that work for you? If you'd rather keep it simple, I can set it back to 1 hour/week.`,
        )
      }
      return
    }

    // 3) Skill proficiency — re-open the self-report module with prior selections.
    const mentionsSkill =
      /skill|proficiency|level|self[-\s]?report|re-?assess|reassess|スキル|レベル|習熟|自己評価/.test(t)
    if (mentionsSkill) {
      replyAfterThinking(
        "Sure — let's revisit your skill proficiency. Update any levels below and continue, and I'll reflect the changes in your goal.",
        () => setStage('proficiency'),
      )
      return
    }

    // 3.4) Flex: "too many videos — add role play / hands-on labs".
    const wantsInteractive =
      /role\s*play|hands[-\s]?on|\blabs?\b|too\s+many\s+(video|lecture)|fewer\s+(video|lecture)|less\s+video|more\s+(interactive|practice|hands|role)|ロールプレイ|ハンズオン|ラボ/.test(t)
    if (config.optimizeBySkill && wantsInteractive) {
      if (flexExtras.length > 0) {
        replyAfterThinking(
          'Your path already includes hands-on practice for each skill. Let me know if you want to swap in anything else.',
        )
        return
      }
      // Ask what to add rather than assuming — the follow-up is resolved above (0.5).
      setAwaitingExtrasChoice(true)
      replyAfterThinking(
        'Good call — practicing by doing sticks better. Would you like me to add a role play, a hands-on lab, or both for each skill?',
      )
      return
    }

    // 3.5) Refine learning path — offered as an option in the final message.
    const mentionsPath =
      /learning\s*path|refine|\bpath\b|swap\s+(a|the|out)?\s*course|add\s+(a|more)?\s*courses?|remove\s+(a)?\s*course|different\s+courses?|adjust\s+(the\s+)?(courses?|path)|curriculum|パス|コースを/.test(t)
    if (mentionsPath) {
      if (flexExtras.length > 0) {
        replyAfterThinking(
          'Your path already includes hands-on practice for each skill. Let me know if you want to swap in anything else.',
        )
        return
      }
      // Funnel a generic "refine my path" into the concrete practice option.
      setAwaitingExtrasChoice(true)
      replyAfterThinking(
        'Sure — I can fine-tune your learning path. For more practice I can trim the video lectures and add hands-on work for each skill. Would you like a role play, a hands-on lab, or both?',
      )
      return
    }

    // 4) Current role — accept a corrected job title; re-prompt if unrelated.
    const mentionsRole = /\brole\b|title|position|\bjob\b|職種|役職/.test(t)
    const clean = text
      .replace(/^(no,?\s*|actually,?\s*|sorry,?\s*)+/i, '')
      .replace(/\b(can|could|would)\s+you\s+/i, '')
      .replace(/\bplease\b/i, '')
      .replace(/\bi'?m\s+(actually\s+)?an?\s+/i, '')
      .replace(/\bi\s+(actually\s+)?(am|meant|wanted)\s+(to\s+(say|be)\s+)?/i, '')
      .replace(/\b(change|update|set|fix|correct|make)\s+(my\s+)?(current\s+)?(role|title|position|job)?\s*(it\s+)?(to|as|is|should\s+be)?\s*/i, '')
      .replace(/\bmy\s+(current\s+)?(role|title|position|job)\s+(is|should\s+be)\s*/i, '')
      .replace(/["'.?!]+$/g, '')
      .trim()
    const looksLikeRole = clean.length > 0 && clean.length < 60 && ROLE_KEYWORDS.test(clean)
    if (mentionsRole || looksLikeRole) {
      if (looksLikeRole) {
        const display = titleCase(clean)
        replyAfterThinking(
          isDone
            ? `Got it — I've updated your current role to ${display}.`
            : `Got it — updated your current role to ${display}. Review the changes below and confirm when you're ready.`,
          () => setReviewRole(display),
        )
      } else {
        replyAfterThinking(
          "That doesn't look like a role I recognize. Could you share your job title? For example, Data Scientist or Staff Data Scientist.",
        )
      }
      return
    }

    // 5) Out of scope — tailor the reply to *why* we couldn't act on it.
    // Flex can also refine the learning path; other scenarios cannot.
    const canDo = isFlex
      ? 'your weekly study time, current role, skill proficiency, or refine your learning path'
      : `your weekly study time, current role, or skill proficiency${isDone ? '' : ' before you confirm'}`
    if (looksLikeGibberish(text)) {
      replyAfterThinking(
        `Sorry, I didn't quite catch that. Could you rephrase? I can adjust ${canDo}.`,
      )
      return
    }
    replyAfterThinking(
      `That's a bit outside what I can help with for this goal. I can adjust ${canDo} — what would you like to change?`,
    )
  }

  const handleSend = (text: string) => {
    if (stage === 'intro') {
      const normalized = normalizeRole(text)
      // Accept when we can map the input to a canonical role, or (non-custom) when
      // it loosely matches the scenario's expected role. Display the canonical name.
      const accepted = normalized !== null || (!config.showGoalConfirmation && isRoleRelated(text))
      if (accepted) {
        const display = normalized ?? config.role
        setUserRole(display)
        startProficiency(display)
      } else {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'user', text },
          {
            id: nextId(),
            role: 'assistant',
            text: "I'm not sure I understood that. Could you tell me your current role? For example, Product Manager or Data Scientist.",
          },
        ])
      }
    } else if (stage === 'review' || stage === 'done') {
      // Review card and the final done message both offer the same adjustments
      // (weekly study time, role, proficiency, learning path).
      setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }])
      handleReviewRequest(text)
    } else {
      setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }])
    }
  }

  // Sample/side threads don't run the scripted flow — just echo a light reply.
  const onSend = (text: string) => {
    if (!onMainThread) {
      chats.appendToActive({ id: nextId(), role: 'user', text })
      window.setTimeout(
        () => chats.appendToActive({ id: nextId(), role: 'assistant', text: "Thanks — I'll take a look and get back to you here." }),
        600,
      )
      return
    }
    handleSend(text)
  }

  const handleChip = (chip: ChipDef['id']) => {
    if (chip === 'role') startProficiency(config.role)
    else if (chip === 'assessment') startProficiency()
    else if (chip === 'study-time') {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', text: 'Change study time' },
        { id: nextId(), role: 'assistant', text: 'Sure — how many hours per week can you commit?' },
      ])
    }
  }

  const handleProficiencySubmit = () => {
    // Flex: clear any prior re-optimization so the path rebuilds from the new levels.
    if (config.optimizeBySkill) resetFlexOptimization()
    const loadingId = nextId()
    setUpdatingSkills(true)
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: 'assistant', text: 'Updating skills…', spinnerPill: true },
    ])

    window.setTimeout(() => {
      setUpdatingSkills(false)
      // Apply the freshly-entered levels to the chart, and re-arm the assessment
      // nudge so a newly reached-target skill lights up its Assess button + tooltip.
      setCommittedProficiency(proficiency)
      setAssessOnboardingDismissed(false)
      if (config.showGoalConfirmation) {
        // Custom: spinner → check pill, then reveal the Review your goal card.
        setMessages((prev) =>
          prev.map((m) =>
            m.id === loadingId
              ? { ...m, spinnerPill: false, pill: true, text: 'Skill proficiency updated' }
              : m,
          ),
        )
        setStage('review')
      } else {
        // Open scenario: no path exists yet — Altus builds it now, so reveal it.
        if (config.pathMode === 'empty') revealPath()
        // Flex glow animation is triggered by a stage→'done' effect (reads final state).
        // Other scenarios: spinner → check pill + done message.
        setMessages((prev) => {
          const updated = prev.map((m) =>
            m.id === loadingId
              ? { ...m, spinnerPill: false, pill: true, text: 'Skill proficiency updated' }
              : m,
          )
          return [
            ...updated,
            {
              id: nextId(),
              role: 'assistant',
              text: config.doneMessage,
              options: config.doneStyle === 'personalized' ? config.doneOptions : undefined,
            },
          ]
        })
        setStage('done')
      }
    }, 1000)
  }

  const handleConfirm = () => {
    setStage('confirming')
    setPathShimmer(true) // animate the path skeleton while Altus generates it
    const loadingId = nextId()
    setMessages((prev) => [
      ...prev,
      {
        id: loadingId,
        role: 'assistant',
        text: 'Confirming goal — generating your learning path…',
        spinnerPill: true,
      },
    ])
    window.setTimeout(() => {
      revealPath()
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === loadingId
            ? { ...m, spinnerPill: false, pill: true, text: 'Learning path created' }
            : m,
        )
        return [
          ...updated,
          {
            id: nextId(),
            role: 'assistant',
            text: config.doneMessage,
            options: config.doneOptions.length ? config.doneOptions : undefined,
          },
        ]
      })
      setStage('done')
    }, 1800)
  }

  const [panelOpen, setPanelOpen] = useState(true)
  const [panelView, setPanelView] = useState<AltusView>('altus')

  // Resizable Altus panel — 500px is the minimum; drag the handle to widen.
  const PANEL_MIN = 500
  const PANEL_MAX = 760
  const [panelWidth, setPanelWidth] = useState(PANEL_MIN)
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startW: number } | null>(null)

  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startW: panelWidth }
    setDragging(true)
  }

  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      // Dragging left (clientX decreases) widens the panel.
      const delta = dragRef.current.startX - e.clientX
      const next = Math.min(PANEL_MAX, Math.max(PANEL_MIN, dragRef.current.startW + delta))
      setPanelWidth(next)
    }
    const onUp = () => {
      dragRef.current = null
      setDragging(false)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [dragging])

  // Whether the left-panel card animations are active (custom scenario only).
  const animateLeft = !!config.staticPlaceholder

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <UBHeader />
      <div className="flex flex-1 overflow-hidden">
        <LeftRail />
        {/* Figma 7021:27603: content area 856px, Altus panel ~480px */}
        <div className="flex flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-y-auto bg-surface-pale px-lg py-md">
            <div className="mx-auto flex max-w-[860px] flex-col gap-md">
              <GoalHeader title={config.goalTitle} fromLabel={config.fromLabel} complete={goalComplete} />

              {/* Skills card with optional ease-in reveal for custom scenario */}
              <div
                className={cn(
                  animateLeft && skillsContentReady && 'transition-all duration-500 ease-in',
                  animateLeft && skillsContentReady && !skillsAnimated && 'translate-y-2 opacity-0',
                )}
              >
                <SkillsCard
                  skills={skillsForChart}
                  role={reviewRole || userRole || config.role}
                  mode="estimated"
                  perSkillMode={perSkillMode}
                  skeleton={skillsSkeleton}
                  staticSkeleton={config.staticPlaceholder && !skillsShimmer}
                  animateBars={skillsBarsAnimating}
                  showRole={stage !== 'intro'}
                  onAssess={(skillId) => {
                    const s = activeSkills.find((x) => x.id === skillId)
                    if (s) setAssessmentSkill(s)
                  }}
                  onTakeAssessment={() => startProficiency()}
                  primaryAssessIds={effectivePrimaryAssessIds}
                  verifiedSkillIds={verifiedSkillIds}
                  verifiedScores={verifiedScores}
                  celebrateSkillId={celebrateSkillId}
                  assessOnboardingOpen={effectivePrimaryAssessIds.size > 0 && !assessOnboardingDismissed}
                  onDismissAssessOnboarding={() => setAssessOnboardingDismissed(true)}
                  targetStyle={isFlex ? 'range' : undefined}
                />
              </div>

              {/* Learning path card with optional ease-in reveal for custom scenario */}
              <div
                className={cn(
                  animateLeft && pathContentReady && 'transition-all duration-500 ease-in',
                  animateLeft && pathContentReady && !pathAnimated && 'translate-y-2 opacity-0',
                )}
              >
                {goalComplete && displayedCourses.length === 0 ? (
                  <CongratsCard
                    onSeeGoals={() =>
                      navigate('/learning-goals', {
                        state: { completedGoalId: FLOW_GOAL_CARD_ID[flowId ?? ''] },
                      })
                    }
                  />
                ) : (
                  <LearningPathCard
                    courses={displayedCourses}
                    skeleton={pathSkeleton}
                    staticSkeleton={config.staticPlaceholder && !pathShimmer}
                    curated={config.pathMode === 'fixed'}
                    animatingIds={animatingIds}
                    justUpdatedIds={justUpdatedIds}
                    removingIds={removingIds}
                    reachedIds={reachedCourseIds}
                    onCourseClick={isFlex ? openPlayer : undefined}
                  />
                )}
              </div>

              {/* Flex: collapsible archive of items dropped once their skill reached target */}
              {isFlex && archivedItems.length > 0 && (
                <ArchiveSection
                  courses={archivedItems}
                  open={archiveOpen}
                  onToggle={() => setArchiveOpen((o) => !o)}
                  onCourseClick={openPlayer}
                  badgeLabel="Reached target"
                />
              )}
            </div>
          </div>

          {/* Drag handle — resize the Altus panel (hidden when collapsed) */}
          {panelOpen && (
            <div
              onMouseDown={onResizeStart}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize Altus panel"
              className="group relative w-2 shrink-0 cursor-col-resize bg-surface-pale"
            >
              {/* Minimal grip — subtle by default, brand on hover/drag */}
              <span
                className={cn(
                  'pointer-events-none absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-round transition-colors',
                  dragging ? 'bg-brand' : 'bg-ink-subdued/25 group-hover:bg-ink-subdued/50',
                )}
              />
            </div>
          )}

          {/* Panel wrapper — animates width on collapse, resizes live while dragging */}
          <div
            className={cn(
              'shrink-0 overflow-hidden',
              !dragging && 'transition-[width] duration-300 ease-in-out',
            )}
            style={{ width: panelOpen ? panelWidth : 0 }}
          >
            <div className="h-full" style={{ width: panelWidth }}>
              <AltusPanel
                messages={onMainThread ? messages : chats.activeThread?.messages ?? []}
                thinking={onMainThread && (stage === ('thinking' as Stage) || introPhase < introMessages.length || loadingProficiency || reviewThinking)}
                showProficiencyForm={onMainThread && stage === 'proficiency' && !updatingSkills}
                goalReview={onMainThread ? goalReview : null}
                goalReviewLoading={reviewLoading}
                onConfirm={handleConfirm}
                skills={activeSkills}
                proficiency={proficiency}
                chips={onMainThread ? config.chips : []}
                onProficiencyChange={(skillId, levelIndex) =>
                  setProficiency((p) => {
                    if (levelIndex === null) {
                      const next = { ...p }
                      delete next[skillId]
                      return next
                    }
                    return { ...p, [skillId]: levelIndex }
                  })
                }
                onProficiencySubmit={handleProficiencySubmit}
                onSend={onSend}
                onChip={handleChip}
                view={panelView}
                onViewChange={setPanelView}
                onCollapse={() => setPanelOpen(false)}
                onOpenLevelDefs={() => setLevelDefsOpen(true)}
                trendsSkills={activeSkills.map((s) => s.name)}
                historyOpen={historyOpen}
                onToggleHistory={() => setHistoryOpen((o) => !o)}
                threads={chats.threads}
                activeThreadId={chats.activeId}
                onSelectThread={chats.select}
                onNewThread={() => {
                  chats.create()
                  setHistoryOpen(false)
                }}
                onRenameThread={chats.rename}
                onDeleteThread={chats.remove}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating pill — visible when panel is collapsed */}
      {!panelOpen && (
        <div className="fixed right-6 top-[96px] z-50">
          <div
            className="flex items-center gap-0 rounded-round p-1 shadow-lg"
            style={{ background: 'rgba(200, 202, 225, 0.6)', backdropFilter: 'blur(8px)' }}
          >
            <button
              onClick={() => { setPanelView('altus'); setPanelOpen(true) }}
              aria-label="Open Altus"
              className={cn(
                'flex items-center justify-center rounded-round p-2 transition-colors',
                panelView === 'altus' ? 'bg-surface text-ink shadow-sm' : 'text-ink-subdued hover:text-ink',
              )}
            >
              <UdemyIcon name="sparkles" size={18} />
            </button>
            <button
              onClick={() => { setPanelView('your-week'); setPanelOpen(true) }}
              aria-label="Open Your week"
              className={cn(
                'flex items-center justify-center rounded-round p-2 transition-colors',
                panelView === 'your-week' ? 'bg-surface text-ink shadow-sm' : 'text-ink-subdued hover:text-ink',
              )}
            >
              <UdemyIcon name="trending-graph" size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Info modal — "Level definitions" from the proficiency form */}
      <InfoModal open={levelDefsOpen} title="Level definitions" onClose={() => setLevelDefsOpen(false)}>
        <div className="flex flex-col gap-md">
          {[
            ['Foundational:', 'Understands basic concepts and can complete simple tasks with guidance. May still be developing confidence applying the skill in real-world situations.'],
            ['Intermediate:', 'Can apply the skill independently in common workflows and day-to-day tasks. Comfortable using the skill in familiar scenarios.'],
            ['Established:', 'Demonstrates strong practical knowledge and can confidently handle more complex tasks and scenarios with limited guidance.'],
            ['Advanced:', 'Applies the skill strategically across complex situations, solves difficult problems, and demonstrates deep expertise in the subject area.'],
          ].map(([label, desc]) => (
            <p key={label} className="text-md leading-relaxed text-ink">
              <span className="font-bold">{label}</span> <span className="text-ink-subdued">{desc}</span>
            </p>
          ))}
          <p className="mt-xs text-md leading-relaxed text-ink-subdued">
            Want to learn more about how proficiency levels are evaluated?{' '}
            <a href="#" className="font-medium text-link hover:underline">
              Learn more
            </a>
          </p>
        </div>
      </InfoModal>

      {/* Udemy assessment — full-screen popup over the dashboard */}
      {assessmentSkill && (
        <AssessmentModal
          skill={assessmentSkill}
          score={earnedScore(assessmentSkill.target, Math.max(activeSkills.findIndex((sk) => sk.id === assessmentSkill.id), 0))}
          goal={{
            title: config.goalTitle,
            deadline: GOAL_META.dueDate,
            skills: activeSkills.map((s) => s.name),
            isOrg: !!config.fromLabel,
            completed: verifiedSkillIds.size + 1,
            total: activeSkills.length,
          }}
          onClose={() => setAssessmentSkill(null)}
          onComplete={completeAssessment}
        />
      )}

      {/* Full-screen celebration once every skill is verified */}
      {confettiOn && <Confetti />}
    </div>
  )
}
