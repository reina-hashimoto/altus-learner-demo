import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronDown, Clock, User, SlidersHorizontal, ListVideo, type LucideIcon } from 'lucide-react'
import { UBHeader } from '@/components/shell/UBHeader'
import { LeftRail } from '@/components/shell/LeftRail'
import { GoalHeader } from '@/features/goal/GoalHeader'
import { SkillsCard } from '@/features/goal/SkillsCard'
import { LearningPathCard } from '@/features/goal/LearningPathCard'
import { InfoModal } from '@/features/goal/InfoModal'
import { AssessmentModal } from '@/features/goal/AssessmentModal'
import { AltusPanel, type AltusMessage, type AltusView, type GoalReview } from '@/features/goal/altus/AltusPanel'
import { useChatThreads, makeSampleThreads } from '@/features/goal/altus/chatThreads'
import { UdemyIcon } from '@/components/icons/UdemyIcon'
import type { ProficiencySelections } from '@/features/goal/SkillProficiencyForm'
import { getFlow, defaultFlowId } from '@/flows/registry'
import {
  SKILLS_CUSTOM_PM,
  COURSES_CUSTOM_PM,
  SKILLS_CUSTOM_DESIGN,
  COURSES_CUSTOM_DESIGN,
  makeFlexExtras,
  type FlexExtraChoice,
  GOAL_META,
  type Skill,
  type Course,
} from '@/data/goal'
import { cn } from '@/components/ui/utils'

/**
 * Custom scenario (learner side). The goal, the role→skills mapping, and each
 * skill's target proficiency are ALL pre-assigned by the admin, so they're shown
 * on the left from the start. Altus then walks the learner through a short
 * confirmation conversation — role level → focus area → self-reported proficiency
 * — and finally summarizes everything before generating the learning path.
 *
 * Two variants, chosen by flow id: Custom-PM (Product Manager) and Custom-Design
 * (Product Designer). Same flow, role-appropriate skills.
 */

type Stage = 'intro' | 'roleLevel' | 'focus' | 'proficiency' | 'review' | 'confirming' | 'done'

const LEVEL_NAMES = ['Foundational', 'Intermediate', 'Established', 'Advanced']

interface Variant {
  role: string
  skills: Skill[]
  courses: Course[]
  /** Example focus areas offered when asking what to concentrate on. */
  focusExamples: string
}

const VARIANTS: Record<string, Variant> = {
  'custom-pm': {
    role: 'Product Manager',
    skills: SKILLS_CUSTOM_PM,
    courses: COURSES_CUSTOM_PM,
    focusExamples: 'prototyping AI features, product analytics, or building AI-native products',
  },
  'custom-design': {
    role: 'Product Designer',
    skills: SKILLS_CUSTOM_DESIGN,
    courses: COURSES_CUSTOM_DESIGN,
    focusExamples: 'AI-native UX, AI-powered prototyping, or generative visual design',
  },
}

const GOAL_TITLE = 'Upskilling in Generative AI'
/** Id of the thread that carries the scripted, flow-driven conversation. */
const MAIN_THREAD_ID = 'main'
const FROM_LABEL = 'From CPO, John D.'
const TARGET_DATE = 'August 31, 2026'
const DONE_MESSAGE =
  'Here is your personalized learning path designed to help close your skill gaps and reach your goal 🎉'
const DONE_OPTIONS = ['Update weekly study time', 'Update current role', 'Update current proficiency', 'Refine learning path']

// ── Weekly study-time parsing (shared shape with GoalPage) ──────────────────
const MIN_WEEKLY_MINUTES = 30
const MAX_WEEKLY_MINUTES = 20 * 60

function parseTargetMinutes(text: string): number | null {
  const t = text.toLowerCase()
  let m = t.match(/to\s+(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|時間)/)
  if (m) return Math.round(parseFloat(m[1]) * 60)
  m = t.match(/to\s+(\d+)\s*(?:minutes?|mins?|分)/)
  if (m) return parseInt(m[1], 10)
  if (/half\s*(?:an?\s*)?hour|30\s*(?:minutes?|mins?|分)/.test(t)) return 30
  const hrs = [...t.matchAll(/(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|時間)/g)]
  if (hrs.length) return Math.round(parseFloat(hrs[hrs.length - 1][1]) * 60)
  const mins = [...t.matchAll(/(\d+)\s*(?:minutes?|mins?|分)/g)]
  if (mins.length) return parseInt(mins[mins.length - 1][1], 10)
  return null
}

function formatWeeklyTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h} hour${h > 1 ? 's' : ''}`)
  if (m > 0) parts.push(`${m} minutes`)
  if (parts.length === 0) parts.push('0 minutes')
  return `${parts.join(' ')}/week`
}

const roundToHalfHour = (minutes: number) => Math.round(minutes / 30) * 30

// ── Edit menu (top-right dropdown) — 4 items, each kicks off a chat edit ─────
const EDIT_ITEMS: { label: string; icon: LucideIcon }[] = [
  { label: 'Update weekly study time', icon: Clock },
  { label: 'Update current role', icon: User },
  { label: 'Update current proficiency', icon: SlidersHorizontal },
  { label: 'Refine learning path', icon: ListVideo },
]

function EditMenu({ onSelect }: { onSelect: (label: string) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-xs rounded-md border border-line bg-surface px-md py-xs text-sm font-bold text-ink transition-colors hover:bg-surface-pale"
      >
        Edit
        <ChevronDown className={cn('size-4 transition-transform', open ? 'rotate-180' : '')} strokeWidth={2} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-xs w-[260px] overflow-hidden rounded-md border border-line-subdued bg-surface py-xs shadow-[0_2px_8px_rgba(140,134,147,0.16),0_4px_16px_rgba(140,134,147,0.12)]">
            {EDIT_ITEMS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => {
                  setOpen(false)
                  onSelect(label)
                }}
                className="flex w-full items-center gap-sm px-md py-xs text-left text-sm text-ink transition-colors hover:bg-surface-pale"
              >
                <Icon className="size-4 shrink-0 text-ink-subdued" strokeWidth={1.75} />
                {label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

const bandOf = (v: number) => Math.min(Math.floor(v / 50), 3)

/**
 * Seniority shifts both the estimated current skill (more senior → presumed more
 * skilled) and the target proficiency (more senior → higher expectations). Deltas
 * are on the 0–200 chart scale; "Mid-level"/unspecified is the baseline (0).
 */
const LEVEL_ADJUST: Record<string, { est: number; tgt: number }> = {
  Junior: { est: -20, tgt: -38 },
  'Mid-level': { est: 0, tgt: 0 },
  Senior: { est: 45, tgt: 25 },
  Lead: { est: 62, tgt: 38 },
  Staff: { est: 70, tgt: 42 },
  Principal: { est: 90, tgt: 52 },
  Director: { est: 95, tgt: 55 },
}

const clampScore = (v: number) => Math.max(10, Math.min(195, v))

/** Shift each skill's estimated + target by the current role level. */
function adjustSkillsForLevel(skills: Skill[], level: string | null): Skill[] {
  const adj = level ? LEVEL_ADJUST[level] : undefined
  if (!adj) return skills
  return skills.map((s) => ({
    ...s,
    estimated: clampScore(s.estimated + adj.est),
    target: clampScore(s.target + adj.tgt),
  }))
}

/** Map a seniority word in free text to a canonical level label, or null. */
function parseLevel(text: string): string | null {
  const t = text.toLowerCase()
  if (/\bprincipal\b/.test(t)) return 'Principal'
  if (/\bstaff\b/.test(t)) return 'Staff'
  if (/\b(senior|sr\.?)\b/.test(t)) return 'Senior'
  if (/\blead\b/.test(t)) return 'Lead'
  if (/\b(mid[-\s]?level|mid|intermediate)\b/.test(t)) return 'Mid-level'
  if (/\b(junior|jr\.?|entry[-\s]?level|associate|new grad)\b/.test(t)) return 'Junior'
  if (/\b(director|head)\b/.test(t)) return 'Director'
  return null
}

/** Whether the learner declined to name a specific focus area. */
function declinedFocus(text: string): boolean {
  return /\b(no|nope|not really|nothing|none|everything|all of|anything|whatever|not sure|don'?t know|balanced|no preference)\b/i.test(
    text.trim(),
  )
}

/** Strip conversational lead-ins from a focus reply to get the topic itself. */
function cleanFocus(text: string): string {
  return text
    .replace(/^(i'?d?\s*(really\s*)?(want|like|love|prefer)\s*to\s*)?/i, '')
    .replace(/^(focus(ing)?\s*(on|in|more on)?\s*)/i, '')
    .replace(/^(concentrate\s*(on)?\s*)/i, '')
    .replace(/^(get\s*better\s*at\s*)/i, '')
    .replace(/[.?!]+$/g, '')
    .trim()
}

export default function CustomGoalFlow() {
  const { flowId } = useParams()
  const flow = getFlow(flowId) ?? getFlow(defaultFlowId)!
  const variant = VARIANTS[flow.id] ?? VARIANTS['custom-pm']

  const introMessages: AltusMessage[] = [
    {
      id: 'intro-0',
      role: 'assistant',
      text: `Your organization has assigned you the goal “${GOAL_TITLE}” by Aug 31, 2026.`,
    },
    {
      id: 'intro-1',
      role: 'assistant',
      text: `Based on your role mapping as a ${variant.role}, we've already identified the key skills and target proficiency levels for this goal — you can review them on the left.`,
    },
    {
      id: 'intro-2',
      role: 'assistant',
      text: `To personalize your plan, I have a couple of quick questions. First, you're mapped as a ${variant.role} — does that still fit, and what level are you (for example, junior, mid, or senior)?`,
    },
  ]

  const [stage, setStage] = useState<Stage>('intro')
  const [messages, setMessages] = useState<AltusMessage[]>([])
  const [introPhase, setIntroPhase] = useState(0)
  // `proficiency` is the live form draft; `committedProficiency` is what's applied
  // to the chart. Re-editing keeps committed values visible (no Estimated regression).
  const [proficiency, setProficiency] = useState<ProficiencySelections>({})
  const [committedProficiency, setCommittedProficiency] = useState<ProficiencySelections>({})
  const [reviewRole, setReviewRole] = useState(variant.role)
  // Role seniority (Senior, Staff, …); shifts estimated + target skill scores.
  const [level, setLevel] = useState<string | null>(null)
  const [focusArea, setFocusArea] = useState<string | null>(null)
  const [weeklyTime, setWeeklyTime] = useState('1 hour/week')
  // A pending edit awaiting the learner's next reply (from the Edit menu).
  const [pendingEdit, setPendingEdit] = useState<null | 'weekly' | 'role' | 'extras'>(null)
  // Role Play / Hands-on Lab practice appended when the learner asks to refine the path.
  const [flexExtras, setFlexExtras] = useState<Course[]>([])
  const [replyPending, setReplyPending] = useState(false)
  const idRef = useRef(0)
  const nextId = () => `m${++idRef.current}`

  // Chat-thread history (design "1b") — namespaced per persona variant. The
  // scripted conversation lives in the "main" thread; sample threads exist to
  // demo switch/rename/delete/expiry.
  const chats = useChatThreads(
    () => [
      { id: MAIN_THREAD_ID, title: GOAL_TITLE, messages: [], createdAt: Date.now(), updatedAt: Date.now() },
      ...makeSampleThreads(),
    ],
    `altus.threads.${flow.id}`,
    MAIN_THREAD_ID,
  )
  const [historyOpen, setHistoryOpen] = useState(false)
  const onMainThread = chats.activeId === MAIN_THREAD_ID

  // Write the live, scripted conversation through into the store so it
  // persists/sorts/expires like any other thread.
  useEffect(() => {
    chats.setThreadMessages(MAIN_THREAD_ID, messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages])

  const skills = adjustSkillsForLevel(variant.skills, level)
  const courses = variant.courses

  // Drip the intro messages in one by one, then open the role-level question.
  useEffect(() => {
    if (introPhase >= introMessages.length) {
      if (stage === 'intro') setStage('roleLevel')
      return
    }
    const delay = introPhase === 0 ? 800 : 900
    const t = setTimeout(() => {
      setMessages((prev) => [...prev, introMessages[introPhase]])
      setIntroPhase((p) => p + 1)
    }, delay)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introPhase])

  // Path reveal (skeleton until the goal is confirmed).
  const [pathContentReady, setPathContentReady] = useState(false)
  const [pathAnimated, setPathAnimated] = useState(false)
  const [pathShimmer, setPathShimmer] = useState(false)
  const revealPath = () => {
    setPathContentReady(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setPathAnimated(true)))
  }

  // Review card + submit transient states.
  const [reviewLoading] = useState(false)
  const [updatingSkills, setUpdatingSkills] = useState(false)
  const [levelDefsOpen, setLevelDefsOpen] = useState(false)

  // Assessment modal + verification (available once the path exists).
  const [assessmentSkill, setAssessmentSkill] = useState<Skill | null>(null)
  const [verifiedSkillIds, setVerifiedSkillIds] = useState<Set<string>>(new Set())
  const [verifiedScores, setVerifiedScores] = useState<Record<string, number>>({})
  const [celebrateSkillId, setCelebrateSkillId] = useState<string | null>(null)
  // "Make it official" assessment nudge — dismissed once via "Got it".
  const [assessTipDismissed, setAssessTipDismissed] = useState(false)

  const done = stage === 'done'
  // Once anything is committed, the chart shows self-reported data — and keeps it
  // visible while the form is re-opened for editing (Issue-1 fix).
  const hasCommitted = Object.keys(committedProficiency).length > 0

  // Per-skill bar mode: assessed → self-reported (purple), skipped → estimated (orange).
  const perSkillMode: Record<string, 'estimated' | 'selfReported'> | undefined = hasCommitted
    ? Object.fromEntries(skills.map((s) => [s.id, committedProficiency[s.id] !== undefined ? 'selfReported' : 'estimated']))
    : undefined

  const skillsForChart = hasCommitted
    ? skills.map((s) => {
        const levelIdx = committedProficiency[s.id]
        return levelIdx !== undefined ? { ...s, selfReported: levelIdx * 50 + 25 } : s
      })
    : skills

  // The generated path shows one course per target skill, plus any hands-on
  // practice the learner asked Altus to add.
  const displayedCourses = [...courses, ...flexExtras]

  // A skill's current level uses the strongest signal available:
  // verified assessment > self-reported > estimated. Practice is only recommended
  // for skills that haven't yet reached their target proficiency.
  const currentBand = (s: Skill) => {
    if (verifiedScores[s.id] !== undefined) return bandOf(verifiedScores[s.id])
    if (committedProficiency[s.id] !== undefined) return committedProficiency[s.id]
    return bandOf(s.estimated)
  }
  const reachedTarget = (s: Skill) => currentBand(s) >= bandOf(s.target)
  // Assessment result for a skill — set to clearly clear its (level-adjusted) target.
  const assessScoreFor = (s: Skill) => Math.min(195, s.target + 15)

  // Skills that reached target via self-report (not yet verified) → Assess button
  // turns primary + a one-time "make it official" tooltip until acknowledged.
  const primaryAssessIds = new Set(
    done
      ? skills
          .filter((s) => !verifiedSkillIds.has(s.id) && committedProficiency[s.id] !== undefined && committedProficiency[s.id] >= bandOf(s.target))
          .map((s) => s.id)
      : [],
  )

  const assistantReply = (text: string) =>
    setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text }])

  const replyAfterThinking = (text: string, before?: () => void, delay = 1400) => {
    setReplyPending(true)
    window.setTimeout(() => {
      setReplyPending(false)
      before?.()
      assistantReply(text)
    }, delay)
  }

  // ── Conversation ──────────────────────────────────────────────────────────

  const askFocus = () =>
    `Now, “${GOAL_TITLE}” is a broad goal — is there anything in particular you'd like to focus on? For example, ${variant.focusExamples}.`

  const handleRoleLevel = (text: string) => {
    const parsed = parseLevel(text)
    const role = parsed ? `${parsed} ${variant.role}` : variant.role
    setReviewRole(role)
    setLevel(parsed)
    let ack: string
    const shift = parsed ? LEVEL_ADJUST[parsed]?.tgt ?? 0 : 0
    if (parsed && shift !== 0) {
      const verb = shift > 0 ? 'raised' : 'lowered'
      ack = `Great — I'll note you as a ${role}. I've ${verb} the target proficiency and your estimated starting levels to match — take a look on the left.`
    } else if (parsed) {
      ack = `Great — I'll note you as a ${role}.`
    } else {
      ack = `Got it — I'll keep you as a ${variant.role}.`
    }
    replyAfterThinking(`${ack} ${askFocus()}`)
    setStage('focus')
  }

  const handleFocus = (text: string) => {
    let focus: string
    let lead: string
    if (declinedFocus(text)) {
      focus = 'A balanced foundation across all skills'
      lead = "No problem — I'll keep it balanced across all of your target skills."
    } else {
      focus = cleanFocus(text) || text.trim()
      lead = `Perfect — I'll emphasize ${focus} in your path.`
    }
    setFocusArea(focus)
    replyAfterThinking(
      `${lead} Lastly, let's confirm your current proficiency for each skill so I can tailor the depth of your learning path.`,
      undefined,
    )
    setStage('proficiency')
  }

  // ── Post-path edits (Edit menu + free-text follow-ups) ──────────────────────
  // Mirrors the Personal-flow edit logic: post the item, ask what/how, then apply.

  const confirmTail = () => (stage === 'review' ? " Confirm when you're ready." : '')

  /** Update the level (role seniority) → re-shift estimated + target on the left. */
  const applyRoleLevel = (text: string) => {
    setPendingEdit(null)
    const parsed = parseLevel(text)
    if (!parsed) {
      replyAfterThinking(
        `You're mapped as a ${variant.role} — what level should I set? For example, junior, mid, or senior.`,
        () => setPendingEdit('role'),
      )
      return
    }
    const role = `${parsed} ${variant.role}`
    const shift = LEVEL_ADJUST[parsed]?.tgt ?? 0
    const detail =
      shift !== 0
        ? ` I've ${shift > 0 ? 'raised' : 'lowered'} the target proficiency and your estimated starting levels to match — take a look on the left.`
        : ''
    replyAfterThinking(`Got it — updated your current role to ${role}.${detail}${confirmTail()}`, () => {
      setReviewRole(role)
      setLevel(parsed)
    })
  }

  /** Update the weekly study time (validated, 30-min granularity). */
  const applyWeekly = (text: string) => {
    const minutes = parseTargetMinutes(text)
    if (minutes === null) {
      replyAfterThinking('How many hours per week would you like to commit to this goal?', () => setPendingEdit('weekly'))
      return
    }
    setPendingEdit(null)
    if (minutes < MIN_WEEKLY_MINUTES) {
      replyAfterThinking("That's a little too low to make meaningful progress. Let's keep it at least 30 minutes/week — how about 1 hour/week?", () => setPendingEdit('weekly'))
      return
    }
    if (minutes > MAX_WEEKLY_MINUTES) {
      replyAfterThinking(`${formatWeeklyTime(minutes)} isn't very realistic to sustain. Let's pick something up to about 20 hours/week.`, () => setPendingEdit('weekly'))
      return
    }
    const rounded = formatWeeklyTime(roundToHalfHour(minutes))
    replyAfterThinking(`Updated your weekly study time to ${rounded}.${confirmTail()}`, () => setWeeklyTime(rounded))
  }

  // Skills still below target (verified > self-reported > estimated) — the only
  // ones that get a practice recommendation.
  const skillsNeedingPractice = () => skills.filter((s) => !reachedTarget(s))

  /** Ask which hands-on practice to add (role play / lab / both). */
  const askExtras = () => {
    if (flexExtras.length > 0) {
      replyAfterThinking('Your path already includes hands-on practice for the skills you\'re still building. Let me know if you want to swap in anything else.')
      return
    }
    if (skillsNeedingPractice().length === 0) {
      replyAfterThinking("You've already reached the target proficiency for every skill in this goal, so there's no extra practice to add — nice work! 🎉")
      return
    }
    replyAfterThinking(
      'Good call — practicing by doing sticks better. For the skills you\'re still building toward, I can add a role play, a hands-on lab, or both. Which would you prefer?',
      () => setPendingEdit('extras'),
    )
  }

  /** Resolve the practice choice → append Role Play / Lab cards to the path. */
  const applyExtras = (text: string) => {
    const t = text.toLowerCase()
    if (/\b(never\s*mind|nevermind|cancel|forget|no\s*thanks|nothing|none|stop)\b/i.test(t)) {
      setPendingEdit(null)
      replyAfterThinking("No problem — I've left your learning path as it is. Let me know if you change your mind.")
      return
    }
    const wantsRP = /role\s*play|roleplay|ロールプレイ/i.test(t)
    const wantsLab = /hands[-\s]?on|\blabs?\b|ハンズオン|ラボ/i.test(t)
    const wantsBoth = /\bboth\b|two|either|any|両方|全部/i.test(t) || (wantsRP && wantsLab)
    const choice: FlexExtraChoice | null = wantsBoth ? 'both' : wantsRP ? 'roleplay' : wantsLab ? 'lab' : null
    if (!choice) {
      replyAfterThinking("Sorry, I didn't catch that. Would you like a role play, a hands-on lab, or both?", () => setPendingEdit('extras'))
      return
    }
    setPendingEdit(null)
    const eligible = skillsNeedingPractice()
    if (eligible.length === 0) {
      replyAfterThinking("Actually, you've already reached the target proficiency for every skill — no extra practice needed. Nice work! 🎉")
      return
    }
    const label = choice === 'both' ? 'a role play and a hands-on lab' : choice === 'roleplay' ? 'a role play' : 'a hands-on lab'
    const scope = eligible.length < skills.length ? " for the skills you haven't reached yet" : ' for each skill'
    replyAfterThinking(`Done — I've added ${label}${scope} to your learning path.`, () =>
      setFlexExtras(makeFlexExtras(eligible, choice)),
    )
  }

  // Free-text follow-up after the path exists — auto-detect intent.
  const handleFollowUp = (text: string) => {
    const t = text.toLowerCase()
    if (/skill|proficiency|level\b|self[-\s]?report|re-?assess/.test(t) && !/role/.test(t)) {
      replyAfterThinking(
        "Sure — let's revisit your skill proficiency. Update any levels below and continue, and I'll reflect the changes.",
        () => setStage('proficiency'),
      )
      return
    }
    if (/role\s*play|hands[-\s]?on|\blabs?\b|practice|refine|more\s+(interactive|hands|practice)|ロールプレイ|ハンズオン|ラボ|練習/.test(t)) {
      askExtras()
      return
    }
    if (/study\s*time|per\s*week|a\s*week|weekly|hours?\b|hrs?\b|minutes?\b|mins?\b|時間|週/.test(t)) {
      applyWeekly(text)
      return
    }
    if (/role|title|position|senior|junior|mid|staff|principal|lead|director/.test(t) || parseLevel(text)) {
      applyRoleLevel(text)
      return
    }
    replyAfterThinking(
      'I can update your weekly study time, current role, or skill proficiency, or refine your learning path with more hands-on practice. What would you like to change?',
    )
  }

  // Edit-menu selection: post the item as a message, then guide the change.
  const onEditSelect = (label: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: label }])
    if (/proficiency/i.test(label)) {
      replyAfterThinking(
        "Sure — let's revisit your skill proficiency. Update any levels below and continue, and I'll reflect the changes.",
        () => setStage('proficiency'),
      )
    } else if (/weekly study time/i.test(label)) {
      replyAfterThinking('How many hours per week would you like to commit to this goal?', () => setPendingEdit('weekly'))
    } else if (/current role/i.test(label)) {
      replyAfterThinking(
        `You're mapped as a ${variant.role} — what level should I set? For example, junior, mid, or senior.`,
        () => setPendingEdit('role'),
      )
    } else if (/refine learning path/i.test(label)) {
      askExtras()
    }
  }

  // ── Player (new tab) — video courses open the content player ────────────────
  const openPlayer = (course: Course) => {
    const base = import.meta.env.BASE_URL
    const isDesignTopic = /design|prototyp|visual|\bux\b|\bui\b/i.test(`${course.skillTag} ${course.title}`)
    const q = new URLSearchParams({
      title: course.title,
      instructor: course.instructor ?? 'Dr. Diana McKinsey',
      tag: course.skillTag,
      lectures: String(course.lectures || 12),
      kind: course.kind ?? 'course',
      video: isDesignTopic ? 'design' : 'programming',
    })
    window.open(`${base}${flow.id}/player?${q.toString()}`, '_blank', 'noopener')
  }

  const handleSend = (text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }])
    if (pendingEdit === 'weekly') applyWeekly(text)
    else if (pendingEdit === 'role') applyRoleLevel(text)
    else if (pendingEdit === 'extras') applyExtras(text)
    else if (stage === 'roleLevel') handleRoleLevel(text)
    else if (stage === 'focus') handleFocus(text)
    else if (stage === 'done' || stage === 'review') handleFollowUp(text)
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

  const handleProficiencySubmit = () => {
    const loadingId = nextId()
    setUpdatingSkills(true)
    setMessages((prev) => [...prev, { id: loadingId, role: 'assistant', text: 'Updating skills…', spinnerPill: true }])
    window.setTimeout(() => {
      setUpdatingSkills(false)
      setMessages((prev) =>
        prev.map((m) =>
          m.id === loadingId ? { ...m, spinnerPill: false, pill: true, text: 'Skill proficiency updated' } : m,
        ),
      )
      // Apply the freshly-entered levels and re-arm the assessment nudge.
      setCommittedProficiency(proficiency)
      setAssessTipDismissed(false)
      setStage('review')
    }, 1600)
  }

  const handleConfirm = () => {
    setStage('confirming')
    setPathShimmer(true)
    const loadingId = nextId()
    setMessages((prev) => [
      ...prev,
      { id: loadingId, role: 'assistant', text: 'Confirming goal — generating your learning path…', spinnerPill: true },
    ])
    window.setTimeout(() => {
      revealPath()
      setMessages((prev) => {
        const updated = prev.map((m) =>
          m.id === loadingId ? { ...m, spinnerPill: false, pill: true, text: 'Learning path created' } : m,
        )
        return [...updated, { id: nextId(), role: 'assistant', text: DONE_MESSAGE, options: DONE_OPTIONS }]
      })
      setStage('done')
    }, 1800)
  }

  const completeAssessment = () => {
    const s = assessmentSkill
    setAssessmentSkill(null)
    if (!s) return
    const score = assessScoreFor(s)
    setVerifiedScores((prev) => ({ ...prev, [s.id]: score }))
    setVerifiedSkillIds((prev) => new Set([...prev, s.id]))
    setCelebrateSkillId(s.id)
    window.setTimeout(() => setCelebrateSkillId(null), 2200)
    // Assessment result came in later — if this skill now meets its target, drop
    // any practice we'd previously recommended for it.
    if (bandOf(score) >= bandOf(s.target)) {
      setFlexExtras((prev) => prev.filter((c) => c.skillTag !== s.name))
    }
  }

  // "Review your goal" card — shows every decided value before path generation.
  const goalReview: GoalReview | null =
    stage === 'review'
      ? {
          goal: GOAL_TITLE,
          role: reviewRole,
          focus: focusArea ?? undefined,
          targetDate: TARGET_DATE,
          weeklyTime,
          skills: skills.map((s) => {
            const levelIdx = proficiency[s.id]
            const bandIdx = levelIdx !== undefined ? levelIdx : bandOf(s.estimated)
            return {
              name: s.name,
              level: LEVEL_NAMES[bandIdx],
              target: LEVEL_NAMES[bandOf(s.target)],
              source: levelIdx !== undefined ? 'Self-reported' : 'Estimated',
            }
          }),
        }
      : null

  // ── Panel (resize + collapse), mirrors GoalPage ─────────────────────────────
  const [panelOpen, setPanelOpen] = useState(true)
  const [panelView, setPanelView] = useState<AltusView>('altus')
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
      const delta = dragRef.current.startX - e.clientX
      setPanelWidth(Math.min(PANEL_MAX, Math.max(PANEL_MIN, dragRef.current.startW + delta)))
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

  const thinking = introPhase < introMessages.length || replyPending

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <UBHeader />
      <div className="flex flex-1 overflow-hidden">
        <LeftRail />
        <div className="flex flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-y-auto bg-surface-pale px-lg py-md">
            <div className="mx-auto flex max-w-[860px] flex-col gap-md">
              <div className="flex items-start justify-between gap-md">
                <div className="min-w-0 flex-1">
                  <GoalHeader
                    title={GOAL_TITLE}
                    fromLabel={FROM_LABEL}
                    weeklyTime={weeklyTime !== '1 hour/week' ? weeklyTime : undefined}
                  />
                </div>
                {done && <EditMenu onSelect={onEditSelect} />}
              </div>

              {/* Skills + targets are pre-assigned — shown from the start (no skeleton). */}
              <SkillsCard
                skills={skillsForChart}
                role={reviewRole}
                mode="estimated"
                perSkillMode={perSkillMode}
                showRole
                targetStyle="range"
                onAssess={(skillId) => {
                  const s = skills.find((x) => x.id === skillId)
                  if (s) setAssessmentSkill(s)
                }}
                verifiedSkillIds={verifiedSkillIds}
                verifiedScores={verifiedScores}
                celebrateSkillId={celebrateSkillId}
                primaryAssessIds={primaryAssessIds}
                assessOnboardingOpen={primaryAssessIds.size > 0 && !assessTipDismissed}
                onDismissAssessOnboarding={() => setAssessTipDismissed(true)}
                hideAssessBanner={!done}
              />

              {/* Learning path — skeleton until the goal is confirmed. */}
              <div
                className={cn(
                  pathContentReady && 'transition-all duration-500 ease-in',
                  pathContentReady && !pathAnimated && 'translate-y-2 opacity-0',
                )}
              >
                <LearningPathCard
                  courses={displayedCourses}
                  skeleton={!pathContentReady}
                  staticSkeleton={!pathShimmer}
                  onCourseClick={pathContentReady ? openPlayer : undefined}
                />
              </div>
            </div>
          </div>

          {panelOpen && (
            <div
              onMouseDown={onResizeStart}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize Altus panel"
              className="group relative w-2 shrink-0 cursor-col-resize bg-surface-pale"
            >
              <span
                className={cn(
                  'pointer-events-none absolute left-1/2 top-1/2 h-8 w-1 -translate-x-1/2 -translate-y-1/2 rounded-round transition-colors',
                  dragging ? 'bg-brand' : 'bg-ink-subdued/25 group-hover:bg-ink-subdued/50',
                )}
              />
            </div>
          )}

          <div
            className={cn('shrink-0 overflow-hidden', !dragging && 'transition-[width] duration-300 ease-in-out')}
            style={{ width: panelOpen ? panelWidth : 0 }}
          >
            <div className="h-full" style={{ width: panelWidth }}>
              <AltusPanel
                messages={onMainThread ? messages : chats.activeThread?.messages ?? []}
                thinking={onMainThread && thinking}
                showProficiencyForm={onMainThread && stage === 'proficiency' && !updatingSkills}
                goalReview={onMainThread ? goalReview : null}
                goalReviewLoading={reviewLoading}
                onConfirm={handleConfirm}
                skills={skills}
                proficiency={proficiency}
                chips={[]}
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
                onChip={() => {}}
                view={panelView}
                onViewChange={setPanelView}
                onCollapse={() => setPanelOpen(false)}
                onOpenLevelDefs={() => setLevelDefsOpen(true)}
                trendsSkills={skills.map((s) => s.name)}
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

      {!panelOpen && (
        <div className="fixed right-6 top-[96px] z-50">
          <div
            className="flex items-center gap-0 rounded-round p-1 shadow-lg"
            style={{ background: 'rgba(200, 202, 225, 0.6)', backdropFilter: 'blur(8px)' }}
          >
            <button
              onClick={() => {
                setPanelView('altus')
                setPanelOpen(true)
              }}
              aria-label="Open Altus"
              className={cn(
                'flex items-center justify-center rounded-round p-2 transition-colors',
                panelView === 'altus' ? 'bg-surface text-ink shadow-sm' : 'text-ink-subdued hover:text-ink',
              )}
            >
              <UdemyIcon name="sparkles" size={18} />
            </button>
            <button
              onClick={() => {
                setPanelView('your-week')
                setPanelOpen(true)
              }}
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
        </div>
      </InfoModal>

      {assessmentSkill && (
        <AssessmentModal
          skill={assessmentSkill}
          score={assessScoreFor(assessmentSkill)}
          goal={{
            title: GOAL_TITLE,
            deadline: GOAL_META.dueDate,
            skills: skills.map((s) => s.name),
            isOrg: true,
            completed: verifiedSkillIds.size + 1,
            total: skills.length,
          }}
          onClose={() => setAssessmentSkill(null)}
          onComplete={completeAssessment}
        />
      )}
    </div>
  )
}
