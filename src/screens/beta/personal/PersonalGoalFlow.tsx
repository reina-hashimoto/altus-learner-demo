import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronDown, Check, History, Flag, CalendarDays, Clock, User, SlidersHorizontal, ListVideo } from 'lucide-react'
import { UBHeader } from '@/components/shell/UBHeader'
import { LeftRail } from '@/components/shell/LeftRail'
import { UdemyIcon } from '@/components/icons/UdemyIcon'
import { SkillsCard } from '@/features/goal/SkillsCard'
import { LearningPathCard } from '@/features/goal/LearningPathCard'
import { InfoModal } from '@/features/goal/InfoModal'
import { AssessmentModal } from '@/features/goal/AssessmentModal'
import { AltusPanel, type AltusMessage, type AltusView, type GoalReview } from '@/features/goal/altus/AltusPanel'
import type { ProficiencySelections } from '@/features/goal/SkillProficiencyForm'
import type { Skill, Course } from '@/data/goal'
import { cn } from '@/components/ui/utils'
import { SetupScreen } from './SetupScreen'
import { PersonalGoalHeader } from './PersonalGoalHeader'
import { Confetti } from './Confetti'
import {
  PERSONAL_SKILLS,
  PERSONAL_COURSES,
  PERSONAL_GOAL,
  PERSONAL_EARNED_SCORES,
  COURSE_INSTRUCTOR,
  INSTRUCTOR_SWAPS,
} from './data'

/**
 * Personal goal E2E flow — rebuilt on the polished flex-pm components.
 *
 * The learner sets their own goal on a home screen, then a two-column
 * goal-detail page runs a scripted Altus conversation
 * (role → timeline → self-report → review). The left panel stays empty until the
 * goal is CONFIRMED — only then do Skills to develop + the Learning path appear
 * (the path animates in via a build loading bar, then shows its final four items
 * at once) and the Altus panel shrinks. Post-build, the learner can open course
 * players, swap an instructor (dashboard-only update), and take assessments;
 * verifying every skill empties the path and fires a central confetti burst.
 */

const LEVEL_NAMES = ['Foundational', 'Intermediate', 'Established', 'Advanced']
const GLOW_MS = 4000
const BUILD_MS = 3000 // learning-path loading bar duration
const PANEL_WIDE = 680
const PANEL_MIN = 480
const PANEL_MAX = 760

const MIN_WEEKLY_MINUTES = 30
const MAX_WEEKLY_MINUTES = 20 * 60

type Stage = 'intro' | 'deadline' | 'proficiency' | 'review' | 'confirming' | 'done'

// ── Text helpers ─────────────────────────────────────────────────────────────

/**
 * Map free text to Product Manager / Product Designer, preserving a seniority
 * qualifier (Sr., Senior, Staff, Principal, Lead, Jr.). Returns null if no role.
 */
function canonicalRole(input: string): string | null {
  const s = input.toLowerCase()
  const compact = s.replace(/[^a-z]/g, '')
  let base: string | null = null
  if (/\bpd\b/.test(s) || (s.includes('product') && /design/.test(s)) || /design(er)?/.test(s) || compact.includes('productdesign'))
    base = 'Product Designer'
  else if (/\bpm\b/.test(s) || (s.includes('product') && /(manag|mgr|mngr)/.test(s)) || compact.includes('productmanag') || /manager/.test(s))
    base = 'Product Manager'
  if (!base) return null
  let seniority = ''
  if (/\bsr\b|\bsnr\b|senior|シニア/.test(s)) seniority = 'Senior '
  else if (/\bstaff\b/.test(s)) seniority = 'Staff '
  else if (/\bprincipal\b/.test(s)) seniority = 'Principal '
  else if (/\blead\b/.test(s)) seniority = 'Lead '
  else if (/\bjr\b|\bjnr\b|junior/.test(s)) seniority = 'Junior '
  return seniority + base
}

function parseTargetMinutes(text: string): number | null {
  const t = text.toLowerCase()
  const to = t.match(/to\s+(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|時間)/)
  if (to) return Math.round(parseFloat(to[1]) * 60)
  if (/half\s*(an?\s*)?hour|30\s*(minutes?|mins?|分)/.test(t)) return 30
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
  if (!parts.length) parts.push('0 minutes')
  return `${parts.join(' ')}/week`
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MONTH_KEYS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec']
const MONTHS = /(january|february|march|april|may|june|july|august|september|october|november|december|jan|feb|mar|apr|jun|jul|aug|sep|sept|oct|nov|dec)/i

function addDays(d: Date, n: number): Date {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
function addMonths(d: Date, n: number): Date {
  const x = new Date(d)
  x.setMonth(x.getMonth() + n)
  return x
}
/** "September 30, 2026" */
function formatFullDate(d: Date): string {
  return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`
}
/** Whole days from today (midnight) until d. */
function daysUntil(d: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const t = new Date(d)
  t.setHours(0, 0, 0, 0)
  return Math.round((t.getTime() - today.getTime()) / 86400000)
}

/**
 * Interpret a target-timeline phrase into an actual date (relative to today).
 * < ~3 weeks out is treated as unrealistic.
 */
function parseDeadline(text: string): { date: Date | null; realistic: boolean } {
  const t = text.toLowerCase()
  const today = new Date()
  let date: Date | null = null
  if (/tomorrow|today|by\s+tonight|end\s+of\s+(the\s+)?day/.test(t)) {
    date = addDays(today, 1)
  } else {
    const num = t.match(/(\d+(?:\.\d+)?)\s*(day|week|month|year|min|hour)/)
    if (num) {
      const n = parseFloat(num[1])
      const unit = num[2]
      if (unit.startsWith('year')) date = addMonths(today, Math.round(n * 12))
      else if (unit.startsWith('month')) date = addMonths(today, Math.round(n))
      else if (unit.startsWith('week')) date = addDays(today, Math.round(n * 7))
      else if (unit.startsWith('day')) date = addDays(today, Math.round(n))
      else date = addDays(today, 1) // minutes/hours → effectively "today"
    } else if (/next\s+week/.test(t)) {
      date = addDays(today, 7)
    } else if (/next\s+month/.test(t)) {
      date = addMonths(today, 1)
    } else {
      const mo = t.match(MONTHS)
      if (mo) {
        const key = mo[0].slice(0, 3)
        const monthIdx = MONTH_KEYS.indexOf(key)
        const yearMatch = t.match(/\b(20\d{2})\b/)
        let year = yearMatch ? parseInt(yearMatch[1], 10) : today.getFullYear()
        // No explicit year and the month already passed → assume next year.
        if (!yearMatch && monthIdx < today.getMonth()) year += 1
        date = new Date(year, monthIdx + 1, 0) // last day of that month
      }
    }
  }
  return { date, realistic: date ? daysUntil(date) >= 21 : false }
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PersonalGoalFlow() {
  const { flowId } = useParams()

  const [screen, setScreen] = useState<'setup' | 'detail'>('setup')
  const [stage, setStage] = useState<Stage>('intro')
  const [goalText, setGoalText] = useState('')
  const idRef = useRef(0)
  const nextId = () => `m${++idRef.current}`

  const [messages, setMessages] = useState<AltusMessage[]>([])
  const [proficiency, setProficiency] = useState<ProficiencySelections>({})
  const [userRole, setUserRole] = useState('Product Designer')
  const [weeklyTime, setWeeklyTime] = useState(PERSONAL_GOAL.defaultWeekly)
  const [targetDate, setTargetDate] = useState<Date | null>(null)

  // Left-panel reveal — everything stays skeleton until the goal is confirmed.
  const [contentReady, setContentReady] = useState(false) // header + skills chart
  const [pathBuilding, setPathBuilding] = useState(false) // LP loading bar showing
  const [pathReady, setPathReady] = useState(false) // final 4 items shown
  const [skillsBarsAnimating, setSkillsBarsAnimating] = useState(false)
  const [showAssessTip, setShowAssessTip] = useState(false)
  const [assessTipDismissed, setAssessTipDismissed] = useState(false)

  // Thinking indicators.
  const [thinking, setThinking] = useState(false)
  const [reviewThinking, setReviewThinking] = useState(false)
  const [reviewLoading, setReviewLoading] = useState(false)
  const [updatingSkills, setUpdatingSkills] = useState(false)
  const [awaitingDeadlineSuggestion, setAwaitingDeadlineSuggestion] = useState(false)

  // Path / assessment state.
  const activeCourses = PERSONAL_COURSES
  const [courseOverrides, setCourseOverrides] = useState<Record<string, Course>>({})
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set())
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set())
  const [verifiedSkillIds, setVerifiedSkillIds] = useState<Set<string>>(new Set())
  const [verifiedScores, setVerifiedScores] = useState<Record<string, number>>({})
  const [celebrateSkillId, setCelebrateSkillId] = useState<string | null>(null)
  const [assessmentSkill, setAssessmentSkill] = useState<Skill | null>(null)

  const [levelDefsOpen, setLevelDefsOpen] = useState(false)
  const [confettiOn, setConfettiOn] = useState(false)
  const [allComplete, setAllComplete] = useState(false)
  const [showGoalCheck, setShowGoalCheck] = useState(false) // green title check, after confetti
  const [archiveOpen, setArchiveOpen] = useState(false)
  const [view, setView] = useState<AltusView>('altus')

  // Resizable Altus panel (matches flex/custom). Starts wide; shrinks on confirm.
  const [panelWidth, setPanelWidth] = useState(PANEL_WIDE)
  const [panelOpen, setPanelOpen] = useState(true) // shrink-panel button collapses it
  const [dragging, setDragging] = useState(false)
  const dragRef = useRef<{ startX: number; startW: number } | null>(null)

  const skills = PERSONAL_SKILLS
  const bandOf = (v: number) => Math.min(Math.floor(v / 50), 3)

  // Intro drip: show the entered goal (collapsible), then greet + ask role.
  useEffect(() => {
    if (screen !== 'detail' || messages.length > 0) return
    const summary = goalText.trim() || 'Upskilling in generative AI'
    const t1 = setTimeout(() => setMessages([{ id: nextId(), role: 'user', text: summary, collapsible: true }]), 300)
    const t2 = setTimeout(() => setMessages((p) => [...p, { id: nextId(), role: 'assistant', text: 'Great goal! Let’s tailor a plan to you.' }]), 900)
    const t3 = setTimeout(() => setMessages((p) => [...p, { id: nextId(), role: 'assistant', text: "What's your current role?" }]), 1700)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen])

  const assistantReply = (text: string) => setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text }])
  const replyAfterThinking = (text: string, before?: () => void, delay = 1200) => {
    setReviewThinking(true)
    window.setTimeout(() => {
      setReviewThinking(false)
      before?.()
      assistantReply(text)
    }, delay)
  }

  // Panel drag-resize.
  const onResizeStart = (e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { startX: e.clientX, startW: panelWidth }
    setDragging(true)
  }
  useEffect(() => {
    if (!dragging) return
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const delta = dragRef.current.startX - e.clientX // drag left widens
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

  // ── Self-report reflection (flex logic) — only meaningful once revealed ──
  const isPostConfirm = stage === 'confirming' || stage === 'done'
  const perSkillMode: Record<string, 'estimated' | 'selfReported'> | undefined = isPostConfirm
    ? Object.fromEntries(skills.map((s) => [s.id, proficiency[s.id] !== undefined ? 'selfReported' : 'estimated']))
    : undefined
  const skillsForChart = isPostConfirm
    ? skills.map((s) => {
        const lvl = proficiency[s.id]
        return lvl !== undefined ? { ...s, selfReported: lvl * 50 + 25 } : s
      })
    : skills

  const displayedCourses = activeCourses.filter((c) => !removedIds.has(c.id)).map((c) => courseOverrides[c.id] ?? c)
  const remainingVideoCount = displayedCourses.filter((c) => (c.kind ?? 'course') === 'course').length
  // Removed courses aren't deleted — they move to the collapsible archive.
  const archivedCourses = activeCourses.filter((c) => removedIds.has(c.id)).map((c) => courseOverrides[c.id] ?? c)

  // ── Conversation: role → deadline → proficiency ──
  const goToProficiency = () => {
    setStage('proficiency')
    setThinking(true)
    window.setTimeout(() => {
      setThinking(false)
      assistantReply('Here are the key skills for this goal. Select the proficiency level that best matches your current skill level for each.')
    }, 900)
  }

  const startDeadline = (role: string) => {
    setUserRole(role)
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: role }])
    setStage('deadline')
    setThinking(true)
    window.setTimeout(() => {
      setThinking(false)
      assistantReply('Thanks! By when would you like to achieve this goal?')
    }, 1000)
  }

  // Suggested realistic target when the learner asks for something too soon: ~2 months out.
  const suggestedDate = () => addMonths(new Date(), 2)

  const handleDeadline = (text: string) => {
    if (awaitingDeadlineSuggestion) {
      const yes = /\b(yes|yep|yeah|sure|ok|okay|sounds good|works|please|do it|go ahead)\b|はい|いい|お願い/i.test(text)
      const parsed = parseDeadline(text)
      if (yes && !parsed.date) {
        setAwaitingDeadlineSuggestion(false)
        const d = suggestedDate()
        setTargetDate(d)
        replyAfterThinking(`Perfect — I've set your target to ${formatFullDate(d)}.`, undefined, 900)
        window.setTimeout(goToProficiency, 1600)
        return
      }
      if (parsed.date && parsed.realistic) {
        setAwaitingDeadlineSuggestion(false)
        setTargetDate(parsed.date)
        replyAfterThinking(`Sounds good — I've set your target to ${formatFullDate(parsed.date)}.`, undefined, 900)
        window.setTimeout(goToProficiency, 1600)
        return
      }
      replyAfterThinking(`That's still a bit tight for building these skills. Shall I set it to around ${formatFullDate(suggestedDate())}?`)
      return
    }

    const parsed = parseDeadline(text)
    if (parsed.date && !parsed.realistic) {
      setAwaitingDeadlineSuggestion(true)
      replyAfterThinking(
        `That's not really enough time to build these three skills to your target level. For a goal like this, around a couple of months is realistic. Shall I set your target to ${formatFullDate(suggestedDate())}? Or tell me a timeframe that works for you.`,
      )
      return
    }
    if (!parsed.date) {
      replyAfterThinking('Got it — when would you like to reach this goal? For example, "in 2 months" or "by September 2026".')
      return
    }
    setTargetDate(parsed.date)
    replyAfterThinking(`Great — targeting ${formatFullDate(parsed.date)}.`, undefined, 900)
    window.setTimeout(goToProficiency, 1600)
  }

  // ── Review edits ──
  const applyWeeklyTime = (newTime: string, message: string) => {
    setReviewLoading(true)
    window.setTimeout(() => {
      setWeeklyTime(newTime)
      setReviewLoading(false)
      assistantReply(message)
    }, 1100)
  }

  const handleReviewRequest = (text: string) => {
    const t = text.toLowerCase()
    // Before confirming, nudge toward Confirm; after (done), just acknowledge.
    const confirmTail = stage === 'review' ? " Confirm when you're ready." : ''
    if (/study\s*time|per\s*week|a\s*week|weekly|hours?\b|hrs?\b|minutes?\b|mins?\b|時間|分|週|勉強|学習/.test(t)) {
      const minutes = parseTargetMinutes(text)
      if (minutes === null) {
        replyAfterThinking('How many hours per week would you like to commit to this goal?')
        return
      }
      if (minutes < MIN_WEEKLY_MINUTES) {
        replyAfterThinking("That's a little too low to make meaningful progress. Let's keep it at least 30 minutes/week — how about 1 hour/week?")
        return
      }
      if (minutes > MAX_WEEKLY_MINUTES) {
        replyAfterThinking(`${formatWeeklyTime(minutes)} isn't very realistic to sustain. Let's pick something up to about 20 hours/week.`)
        return
      }
      applyWeeklyTime(formatWeeklyTime(minutes), `Updated your weekly study time to ${formatWeeklyTime(minutes)}.${confirmTail}`)
      return
    }
    if (/deadline|due\s*date|target\s*date|time\s*line|timeline|by\s+\w+|month|week|day|期限|締切|日/.test(t)) {
      const parsed = parseDeadline(text)
      if (parsed.date && !parsed.realistic) {
        replyAfterThinking(`${formatFullDate(parsed.date)} isn't quite enough time for these skills. I'd suggest around ${formatFullDate(suggestedDate())}. Want me to set that?`)
        return
      }
      if (!parsed.date) {
        replyAfterThinking('When would you like to reach this goal? For example, "in 3 months" or "by September 2026".')
        return
      }
      setReviewLoading(true)
      window.setTimeout(() => {
        setTargetDate(parsed.date)
        setReviewLoading(false)
        assistantReply(`Updated your target date to ${formatFullDate(parsed.date as Date)}.${confirmTail}`)
      }, 1100)
      return
    }
    const normalized = canonicalRole(text)
    if (/role|title|position|職種|役職/.test(t) || normalized) {
      if (normalized) {
        replyAfterThinking(`Got it — updated your current role to ${normalized}.${confirmTail}`, () => setUserRole(normalized))
      } else {
        replyAfterThinking("That doesn't look like a role I recognize. Could you share your job title? For example, Product Designer or Product Manager.")
      }
      return
    }
    if (/skill|proficiency|level|self[-\s]?report|re-?assess|スキル|レベル|習熟|自己評価/.test(t)) {
      replyAfterThinking("Sure — let's revisit your skill proficiency. Update any levels below and continue, and I'll reflect the changes.", () => setStage('proficiency'))
      return
    }
    replyAfterThinking(
      "Sorry, I didn't quite catch that. I can update your current role, target date, weekly study time, or skill proficiency — could you rephrase what you'd like to change? For example, \"change my weekly study time to 2 hours\" or \"I'm a Product Manager\".",
    )
  }

  // ── Composer ──
  const handleSend = (text: string) => {
    if (stage === 'intro') {
      const normalized = canonicalRole(text)
      if (normalized) startDeadline(normalized)
      else
        setMessages((prev) => [
          ...prev,
          { id: nextId(), role: 'user', text },
          { id: nextId(), role: 'assistant', text: "I'm not sure I caught that. What's your current role? For example, Product Designer or Product Manager." },
        ])
      return
    }
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }])
    if (stage === 'deadline') handleDeadline(text)
    else if (stage === 'review') handleReviewRequest(text)
    else if (stage === 'done') handleDoneRequest(text)
  }

  const handleProficiencyChange = (skillId: string, levelIndex: number | null) =>
    setProficiency((p) => {
      if (levelIndex === null) {
        const next = { ...p }
        delete next[skillId]
        return next
      }
      return { ...p, [skillId]: levelIndex }
    })

  const handleProficiencySubmit = () => {
    const loadingId = nextId()
    setUpdatingSkills(true)
    setMessages((prev) => [...prev, { id: loadingId, role: 'assistant', text: 'Updating skills…', spinnerPill: true }])
    window.setTimeout(() => {
      setUpdatingSkills(false)
      setMessages((prev) => prev.map((m) => (m.id === loadingId ? { ...m, spinnerPill: false, pill: true, text: 'Skill proficiency updated' } : m)))
      setStage('review')
    }, 1600)
  }

  // Confirm → reveal header + skills + shrink panel; LP shows a loading bar for a
  // few seconds, then the final four items appear at once + the assess nudge.
  const handleConfirm = () => {
    setStage('confirming')
    setContentReady(true)
    setSkillsBarsAnimating(true)
    setPanelWidth(PANEL_MIN)
    setPathBuilding(true)
    const loadingId = nextId()
    setMessages((prev) => [...prev, { id: loadingId, role: 'assistant', text: 'Confirming goal — generating your learning path…', spinnerPill: true }])
    window.setTimeout(() => {
      setPathBuilding(false)
      setPathReady(true)
      setMessages((prev) => {
        const updated = prev.map((m) => (m.id === loadingId ? { ...m, spinnerPill: false, pill: true, text: 'Learning path created' } : m))
        return [
          ...updated,
          {
            id: nextId(),
            role: 'assistant',
            text: 'Here is your personalized learning path designed to help close your skill gaps and reach your goal 🎉',
            options: ['Edit goal', 'Change timeline', 'Update role', 'Update proficiency', 'Refine learning path'],
          },
        ]
      })
      setStage('done')
      window.setTimeout(() => setShowAssessTip(true), 500)
    }, BUILD_MS)
  }

  // ── Player (new tab) ──
  const swappedCourseIds = Object.values(INSTRUCTOR_SWAPS).map((c) => c.id)
  const openPlayer = (course: Course) => {
    const base = import.meta.env.BASE_URL
    // Swapped-in (replaced) courses play the alternate clip so the content
    // visibly changes; original courses keep the topic-based clip.
    const isDesignTopic = /design|prototyp|ux|ui/i.test(`${course.skillTag} ${course.title}`)
    const video = swappedCourseIds.includes(course.id) ? 'programming' : isDesignTopic ? 'design' : 'programming'
    const q = new URLSearchParams({
      title: course.title,
      instructor: course.instructor ?? COURSE_INSTRUCTOR[course.id] ?? 'Instructor',
      tag: course.skillTag,
      lectures: String(course.lectures || 12),
      kind: course.kind ?? 'course',
      video,
    })
    window.open(`${base}${flowId}/player?${q.toString()}`, '_blank', 'noopener')
  }

  // ── Instructor / course swap — glow + content loading, dashboard-only update ──
  // Precise so it never shadows weekly-time / role / date edits.
  const WANTS_SWAP =
    /instructor|teacher|teaching\s*style|another\s+(instructor|teacher|course|one)|different\s+(instructor|teacher|course|style|person)|someone\s+else|swap|replace|change\s+(the\s+|this\s+)?course|different\s+course|refine\s+(the\s+)?(learning\s+)?path|don'?t\s+like|not\s+a\s+fan|講師|先生|教え方|別の(人|コース|講師)/i

  const swapInstructor = () => {
    const base = activeCourses.find((c) => INSTRUCTOR_SWAPS[c.id] && !removedIds.has(c.id) && !courseOverrides[c.id])
    if (!base) {
      replyAfterThinking("Tell me which course you'd like a different instructor for and I'll find an alternative on the same topic.")
      return
    }
    const replacement = INSTRUCTOR_SWAPS[base.id]
    replyAfterThinking(
      `Got it — not every teaching style clicks. I'm finding a different instructor for “${replacement.skillTag}” and updating your learning path…`,
      () => setAnimatingIds(new Set([base.id])),
      900,
    )
    window.setTimeout(() => {
      setCourseOverrides((prev) => ({ ...prev, [base.id]: replacement }))
      setAnimatingIds(new Set())
      assistantReply(`Done! I've swapped in “${replacement.title}” by ${replacement.instructor} on the same topic. Open it from your path whenever you'd like to try this style.`)
    }, 900 + GLOW_MS)
  }

  const handleDoneRequest = (text: string) => {
    if (WANTS_SWAP.test(text)) {
      swapInstructor()
      return
    }
    // Everything else routes through the same edit handler (weekly time, target
    // date, role, proficiency), which reflects valid changes or asks to rephrase.
    handleReviewRequest(text)
  }

  // ── Edit menu (top-right dropdown) — post the item, then ask what & how ──
  const onEditSelect = (label: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: label }])
    if (/proficiency/i.test(label)) {
      replyAfterThinking("Sure — let's revisit your skill proficiency. Update any levels below and continue, and I'll reflect the changes.", () => setStage('proficiency'))
      return
    }
    replyAfterThinking('Sure — what would you like to change, and how?')
  }

  // ── Assessment ──
  const completeAssessment = () => {
    const s = assessmentSkill
    setAssessmentSkill(null)
    if (!s) return
    const score = PERSONAL_EARNED_SCORES[s.id] ?? 148
    setVerifiedScores((prev) => ({ ...prev, [s.id]: score }))
    setVerifiedSkillIds((prev) => new Set([...prev, s.id]))
    window.setTimeout(() => {
      setCelebrateSkillId(s.id)
      window.setTimeout(() => setCelebrateSkillId(null), 1600)
    }, 750)
    const courseIds = activeCourses.filter((c) => c.skillTag === s.name && !removedIds.has(c.id)).map((c) => c.id)
    if (courseIds.length) {
      window.setTimeout(() => {
        setRemovingIds(new Set(courseIds))
        window.setTimeout(() => {
          setRemovedIds((prev) => new Set([...prev, ...courseIds]))
          setRemovingIds(new Set())
        }, 650)
      }, 900)
    }
    const willAllBeVerified = skills.every((sk) => sk.id === s.id || verifiedSkillIds.has(sk.id))
    if (willAllBeVerified) {
      window.setTimeout(() => {
        setAllComplete(true)
        setConfettiOn(true)
        // When the confetti finishes, pop the green check + sparkle beside the title.
        window.setTimeout(() => {
          setConfettiOn(false)
          setShowGoalCheck(true)
        }, 3800)
      }, 1700)
    }
  }

  const onAssess = (skillId: string) => {
    const s = skills.find((x) => x.id === skillId)
    if (s) setAssessmentSkill(s)
  }

  // ── Derived header / date labels ──
  const targetDateDisplay = targetDate ? formatFullDate(targetDate) : PERSONAL_GOAL.targetDate
  const dueDateLabel = targetDate ? `By ${formatFullDate(targetDate)}` : PERSONAL_GOAL.dueDate
  const daysLeftLabel = targetDate ? `${Math.max(0, daysUntil(targetDate))} more days` : PERSONAL_GOAL.daysLeft
  // Full date the goal was completed (shown in the header once all skills are verified).
  const completedLabel = showGoalCheck ? formatFullDate(new Date()) : null

  // ── Goal review card ──
  const goalReview: GoalReview | null =
    stage === 'review'
      ? {
          role: userRole,
          targetDate: targetDateDisplay,
          weeklyTime,
          skills: skills.map((s) => {
            const lvl = proficiency[s.id]
            const bandIdx = lvl !== undefined ? lvl : bandOf(s.estimated)
            return { name: s.name, level: LEVEL_NAMES[bandIdx], source: lvl !== undefined ? 'Self-reported' : 'Estimated' }
          }),
        }
      : null

  if (screen === 'setup') return <SetupScreen onSubmit={(g) => { setGoalText(g); setScreen('detail') }} />

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <UBHeader />
      <div className="flex flex-1 overflow-hidden">
        <LeftRail />
        <div className="flex flex-1 overflow-hidden">
          {/* Left content */}
          <div className="min-w-0 flex-1 overflow-y-auto bg-surface-pale px-lg py-md">
            <div className="mx-auto flex max-w-[860px] flex-col gap-md">
              <div className="flex items-start justify-between gap-md">
                <div className="min-w-0 flex-1">
                  <PersonalGoalHeader
                    skeleton={!contentReady}
                    weeklyTime={weeklyTime}
                    role={userRole}
                    dueDate={dueDateLabel}
                    daysLeft={daysLeftLabel}
                    completedLabel={completedLabel}
                    complete={showGoalCheck}
                  />
                </div>
                {pathReady && <EditMenu onSelect={onEditSelect} disabled={allComplete} />}
              </div>

              <SkillsCard
                skills={skillsForChart}
                role={userRole}
                mode="estimated"
                perSkillMode={perSkillMode}
                skeleton={!contentReady}
                staticSkeleton={!contentReady}
                animateBars={skillsBarsAnimating}
                showRole={contentReady}
                onAssess={onAssess}
                onTakeAssessment={() => {}}
                verifiedSkillIds={verifiedSkillIds}
                verifiedScores={verifiedScores}
                celebrateSkillId={celebrateSkillId}
                targetStyle="range"
                hideAssessBanner={allComplete}
                assessOnboardingOpen={showAssessTip && !assessTipDismissed}
                onDismissAssessOnboarding={() => setAssessTipDismissed(true)}
              />

              {allComplete && remainingVideoCount === 0 ? (
                <CongratsCard />
              ) : (
                <LearningPathCard
                  courses={pathReady ? displayedCourses : []}
                  skeleton={!pathReady}
                  // Static (no shimmer) before Confirm; animated gray shimmer while building.
                  staticSkeleton={!pathBuilding}
                  animatingIds={animatingIds}
                  removingIds={removingIds}
                  fullReloadIds={animatingIds}
                  onCourseClick={pathReady ? openPlayer : undefined}
                />
              )}

              {pathReady && archivedCourses.length > 0 && (
                <ArchiveSection
                  courses={archivedCourses}
                  open={archiveOpen}
                  onToggle={() => setArchiveOpen((o) => !o)}
                  onCourseClick={openPlayer}
                />
              )}
            </div>
          </div>

          {/* Drag handle — gray vertical line + grip (resize the Altus panel) */}
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

          {/* Altus panel — starts wide, shrinks to min on confirm; collapses to 0 on shrink-panel */}
          <div
            className={cn('shrink-0 overflow-hidden', !dragging && 'transition-[width] duration-300 ease-in-out')}
            style={{ width: panelOpen ? panelWidth : 0 }}
          >
            <div className="h-full" style={{ width: panelWidth }}>
              <AltusPanel
                messages={messages}
                thinking={thinking || reviewThinking}
                showProficiencyForm={stage === 'proficiency' && !updatingSkills}
                goalReview={goalReview}
                goalReviewLoading={reviewLoading}
                onConfirm={handleConfirm}
                skills={skills}
                proficiency={proficiency}
                chips={[]}
                onProficiencyChange={handleProficiencyChange}
                onProficiencySubmit={handleProficiencySubmit}
                onSend={handleSend}
                onChip={() => {}}
                view={view}
                onViewChange={setView}
                onCollapse={() => setPanelOpen(false)}
                onOpenLevelDefs={() => setLevelDefsOpen(true)}
                trendsSkills={skills.map((s) => s.name)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floating pill — reopen the Altus panel after it's collapsed */}
      {!panelOpen && (
        <div className="fixed right-6 top-[96px] z-50">
          <button
            onClick={() => setPanelOpen(true)}
            aria-label="Open Altus"
            className="flex items-center justify-center rounded-round p-2 shadow-lg"
            style={{ background: 'rgba(200, 202, 225, 0.6)', backdropFilter: 'blur(8px)' }}
          >
            <UdemyIcon name="sparkles" size={20} />
          </button>
        </div>
      )}

      <InfoModal open={levelDefsOpen} title="Level definitions" onClose={() => setLevelDefsOpen(false)}>
        <div className="flex flex-col gap-md">
          {[
            ['Foundational:', 'Understands basic concepts and can complete simple tasks with guidance.'],
            ['Intermediate:', 'Can apply the skill independently in common workflows and day-to-day tasks.'],
            ['Established:', 'Demonstrates strong practical knowledge and can confidently handle complex tasks with limited guidance.'],
            ['Advanced:', 'Applies the skill strategically across complex situations and demonstrates deep expertise.'],
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
          score={PERSONAL_EARNED_SCORES[assessmentSkill.id] ?? 148}
          goal={{
            title: PERSONAL_GOAL.title,
            deadline: dueDateLabel,
            skills: skills.map((s) => s.name),
            isOrg: false,
            completed: verifiedSkillIds.size + 1,
            total: skills.length,
          }}
          onClose={() => setAssessmentSkill(null)}
          onComplete={completeAssessment}
        />
      )}

      {confettiOn && <Confetti />}
    </div>
  )
}

/** Top-right "Edit" dropdown (Figma Quick menu) — each item kicks off a chat edit. */
const EDIT_ITEMS: { label: string; icon: typeof Flag }[] = [
  { label: 'Edit goal', icon: Flag },
  { label: 'Change timeline', icon: CalendarDays },
  { label: 'Update weekly study time', icon: Clock },
  { label: 'Update current role', icon: User },
  { label: 'Update current proficiency', icon: SlidersHorizontal },
  { label: 'Refine learning path', icon: ListVideo },
]

function EditMenu({ onSelect, disabled }: { onSelect: (label: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative shrink-0">
      <button
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-xs rounded-md border border-line bg-surface px-md py-xs text-sm font-bold text-ink transition-colors',
          disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-surface-pale',
        )}
      >
        Edit
        <ChevronDown className={cn('size-4 transition-transform', open ? 'rotate-180' : '')} strokeWidth={2} />
      </button>
      {open && !disabled && (
        <>
          {/* click-away layer */}
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

/**
 * Collapsible archive of courses removed from the active path (e.g. once their
 * skill is verified). Default closed; sits below the path / congrats card.
 */
function ArchiveSection({
  courses,
  open,
  onToggle,
  onCourseClick,
}: {
  courses: Course[]
  open: boolean
  onToggle: () => void
  onCourseClick: (course: Course) => void
}) {
  return (
    <div className="-mt-sm flex flex-col items-end gap-xs">
      <button
        onClick={onToggle}
        className="flex items-center gap-xs px-xs py-xxs text-sm font-medium text-ink-subdued transition-colors hover:text-ink"
      >
        <History className="size-4" strokeWidth={1.75} />
        Show previously studied courses ({courses.length})
        <ChevronDown className={cn('size-4 transition-transform', open ? 'rotate-180' : '')} strokeWidth={2} />
      </button>

      {open && (
        <section className="w-full animate-altus-fadein rounded-lg bg-surface p-lg">
          <h2 className="mb-md text-lg font-medium text-ink">Previously studied</h2>
          <div className="flex flex-col gap-sm">
            {courses.map((c) => (
              <button
                key={c.id}
                onClick={() => onCourseClick(c)}
                className="flex items-center gap-sm rounded-lg border border-line-subdued p-sm text-left transition-shadow hover:shadow-[var(--box-shadow-100)]"
              >
                <img src={c.image} alt="" className="size-12 shrink-0 rounded-md object-cover" />
                <div className="flex min-w-0 flex-1 flex-col gap-xxs">
                  <h3 className="truncate text-md font-medium leading-tight text-ink">{c.title}</h3>
                  <p className="truncate text-xs text-ink-subdued">
                    {c.metaText ?? `Course • ${c.lectures} lectures • ${c.duration}${c.instructor ? ` • ${c.instructor}` : ''}`}
                  </p>
                  <span className="inline-flex w-fit items-center rounded-sm bg-[var(--color-purple-150)] px-xs py-xxs text-xs font-bold text-ink">
                    {c.skillTag}
                  </span>
                </div>
                <span
                  className="flex shrink-0 items-center gap-xxs rounded-sm px-xs py-xxs text-xs font-bold text-white"
                  style={{ background: '#0e8a5f' }}
                >
                  <Check className="size-3" strokeWidth={3} /> Verified
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

/** Shown in the learning-path slot once every skill has reached target. */
function CongratsCard() {
  return (
    <section className="flex flex-col items-center gap-sm rounded-lg bg-surface p-xl text-center">
      <span className="text-4xl">🎉</span>
      <h2 className="text-xl font-bold text-ink">Goal complete — congratulations!</h2>
      <p className="max-w-[420px] text-sm text-ink-subdued">
        You've reached the target proficiency for every skill in this goal. Your learning path is all done. Keep the
        momentum going by setting a new goal or exploring advanced topics.
      </p>
    </section>
  )
}
