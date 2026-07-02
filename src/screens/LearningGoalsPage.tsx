import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ChevronRight, Sparkles, Plus, History, ChevronDown, Check } from 'lucide-react'
import { cn } from '@/components/ui/utils'
import { UBHeader } from '@/components/shell/UBHeader'
import { COURSES_AI, COURSES_OPEN_PM, COURSES_CUSTOM_PM, COURSES_CUSTOM_DESIGN, type Course } from '@/data/goal'
import { PERSONAL_COURSES, COURSE_INSTRUCTOR } from '@/screens/beta/personal/data'
import { CollapsibleNav } from '@/screens/beta/skills-profile/CollapsibleNav'

// ── Suggestion chips ────────────────────────────────────────────────────────
const CHIPS = ['Get promoted', 'Upskilling in generative AI', 'Learning new tools', 'Improve communication']

// ── Goal mock data (one card per post-beta scenario) ───────────────────────
interface GoalDef {
  id: string
  flowId: string
  /** Prototype scenario label shown beside the title (1. Fixed … 4. Custom). */
  category: string
  title: string
  deadline: string
  type: 'org' | 'personal'
  skills: string[]
  completed: number
  total: number
  course: Course
  courseProgress: number
  instructor: string
}

// Active goals shown by default, in presentation order.
const ACTIVE_GOALS: GoalDef[] = [
  {
    id: 'personal-e2e',
    flowId: 'personal-goal-e2e',
    category: '0. Personal',
    title: 'Upskilling in generative AI',
    deadline: 'June, 2026',
    type: 'personal',
    skills: ['Prompt-to-UI Prototyping', 'AI-powered Design Thinking', 'AI/ML Foundations'],
    completed: 0,
    total: 3,
    course: PERSONAL_COURSES[0],
    courseProgress: 45,
    instructor: COURSE_INSTRUCTOR['ai-design-thinking-fundamentals'],
  },
  {
    id: 'custom-pm',
    flowId: 'custom-pm',
    category: 'Custom-PM',
    title: 'Upskilling in Generative AI',
    deadline: 'August, 2026',
    type: 'org',
    skills: ['AI-Native Product Development', 'AI-Powered Prototyping', 'AI-Assisted Product Analytics'],
    completed: 0,
    total: 3,
    course: COURSES_CUSTOM_PM[0],
    courseProgress: 30,
    instructor: 'Dr. Diana McKinsey',
  },
  {
    id: 'custom-design',
    flowId: 'custom-design',
    category: 'Custom-Design',
    title: 'Upskilling in Generative AI',
    deadline: 'August, 2026',
    type: 'org',
    skills: ['Designing AI-Native Experiences', 'AI-Powered Prototyping', 'Generative AI for Visual Design'],
    completed: 0,
    total: 3,
    course: COURSES_CUSTOM_DESIGN[0],
    courseProgress: 15,
    instructor: 'Dr. Diana McKinsey',
  },
  {
    id: 'flex',
    flowId: 'flex-pm',
    category: '2. Flex',
    title: 'Upskilling in AI',
    deadline: 'August, 2026',
    type: 'org',
    skills: ['Prompting AI Effectively', 'Evaluating AI Outputs', 'Responsible AI Usage'],
    completed: 1,
    total: 3,
    course: COURSES_AI[0],
    courseProgress: 75,
    instructor: 'Dr. Diana McKinsey',
  },
]

// Archived goals — hidden by default, revealed via the Archived accordion.
const ARCHIVED_GOALS: GoalDef[] = [
  {
    id: 'fixed',
    flowId: 'fixed-pm',
    category: '1. Fixed',
    title: 'AI benchmark fluency',
    deadline: 'September, 2026',
    type: 'org',
    skills: ['Prompting AI Effectively', 'Evaluating AI Outputs', 'Responsible AI Usage'],
    completed: 0,
    total: 3,
    course: COURSES_AI[0],
    courseProgress: 0,
    instructor: 'Dr. Diana McKinsey',
  },
  {
    id: 'open',
    flowId: 'open-pm',
    category: '3. Open',
    title: 'Build AI expertise',
    deadline: 'October, 2026',
    type: 'personal',
    skills: ['Prompting AI Effectively', 'Evaluating AI Outputs', 'Responsible AI Usage'],
    completed: 0,
    total: 3,
    course: COURSES_OPEN_PM[0],
    courseProgress: 0,
    instructor: 'Dr. Diana McKinsey',
  },
]

// ── Sub-components ──────────────────────────────────────────────────────────

/** Circular progress ring used inside goal cards. */
function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const size = 48
  const stroke = 3
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = total ? completed / total : 0
  return (
    <span className="relative flex size-12 shrink-0 items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-purple-150)" strokeWidth={stroke} />
        {pct > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-purple-400)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct)}
          />
        )}
      </svg>
      <span className="text-xs font-medium text-ink tabular-nums">
        {completed}/{total}
      </span>
    </span>
  )
}

/** Green completion check shown in place of the progress ring once the goal is done. */
function CompleteCheck() {
  return (
    <span className="flex size-12 shrink-0 items-center justify-center">
      <span
        className="flex size-9 items-center justify-center rounded-round text-white shadow-sm"
        style={{ background: '#0e8a5f' }}
      >
        <Check className="size-5" strokeWidth={3} />
      </span>
    </span>
  )
}

/** Single goal card matching the Figma LectureProductCard structure. */
function GoalCard({ goal, complete = false }: { goal: GoalDef; complete?: boolean }) {
  const isOrg = goal.type === 'org'

  const courseMeta = `${goal.course.lectures} lectures · ${goal.course.duration}`

  // The resumable course card only shows once content is in progress.
  const p = goal.courseProgress
  const inProgress = p > 0
  // Progress bar: 0% neutral grey · 1–99% purple · 100% green.
  const barColor =
    p >= 100 ? 'var(--color-green-500)' : p > 0 ? 'var(--color-purple-400)' : 'var(--color-gray-300)'

  // Open the (already-built) video player for this course in a new tab.
  const openPlayer = () => {
    const base = import.meta.env.BASE_URL
    const isDesign = /design|prototyp|ux|ui/i.test(`${goal.course.skillTag} ${goal.course.title}`)
    const q = new URLSearchParams({
      title: goal.course.title,
      instructor: goal.instructor,
      tag: goal.course.skillTag,
      lectures: String(goal.course.lectures),
      kind: goal.course.kind ?? 'course',
      video: isDesign ? 'design' : 'programming',
    })
    window.open(`${base}${goal.flowId}/player?${q.toString()}`, '_blank', 'noopener')
  }

  return (
    <div className="flex flex-col gap-md rounded-xl bg-surface p-md">
      {/* Goal header row */}
      <div className="flex items-start gap-md">
        {complete ? <CompleteCheck /> : <ProgressRing completed={goal.completed} total={goal.total} />}
        <div className="flex flex-1 flex-col gap-xs">
          <div>
            <h3 className="text-lg font-medium leading-snug text-ink">
              {goal.title}
              <span className="ml-xs text-base font-normal text-ink-subdued">({goal.category})</span>
            </h3>
            <p className="text-sm text-ink-subdued">By the end of {goal.deadline}</p>
          </div>
          {/* Tags — single row, no wrap; show up to 2 skills + overflow */}
          <div className="flex items-center gap-xs overflow-hidden">
            <span
              className={
                isOrg
                  ? 'shrink-0 rounded-sm bg-surface-positive px-xs py-[3px] text-xs font-bold text-positive'
                  : 'shrink-0 rounded-sm px-xs py-[3px] text-xs font-bold text-ink'
              }
              style={isOrg ? undefined : { background: 'var(--color-orange-150)' }}
            >
              {isOrg ? 'Organization goal' : 'Personal goal'}
            </span>
            {goal.skills.slice(0, 2).map((s) => (
              <span key={s} className="shrink-0 max-w-[160px] truncate rounded-sm border border-line px-xs py-[3px] text-xs text-ink-subdued" title={s}>
                {s}
              </span>
            ))}
            {goal.skills.length > 2 && (
              <span className="shrink-0 rounded-sm border border-line px-xs py-[3px] text-xs text-ink-subdued">
                +{goal.skills.length - 2}
              </span>
            )}
          </div>
        </div>
        <Link
          to={`/${goal.flowId}`}
          className="ml-auto flex shrink-0 items-center gap-xxs text-sm font-bold text-brand hover:underline"
        >
          See details
          <ChevronRight className="size-4" strokeWidth={2.5} />
        </Link>
      </div>

      {/* Resumable course card — only when content is in progress; opens the player */}
      {inProgress && (
        <button
          type="button"
          onClick={openPlayer}
          className="ml-[72px] flex items-start gap-md rounded-lg border border-line-subdued p-md text-left transition-shadow hover:shadow-[var(--box-shadow-100)]"
        >
          <div className="relative size-12 shrink-0 overflow-hidden rounded-md">
            <img src={goal.course.image} alt="" className="size-full object-cover" />
            <span className="absolute inset-0 flex items-center justify-center bg-black/30">
              <svg viewBox="0 0 24 24" className="size-5 fill-white" aria-label="Resume">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </div>
          <div className="flex flex-1 flex-col gap-xs">
            <div className="flex flex-col gap-xxs">
              <p className="line-clamp-2 text-md font-medium leading-snug text-ink">{goal.course.title}</p>
              <p className="text-xs text-ink-subdued">{goal.instructor}</p>
            </div>
            <div className="flex flex-wrap gap-xs">
              <span className="rounded-sm border border-line px-xs py-[3px] text-xs text-ink-subdued">Course</span>
              <span className="rounded-sm border border-line px-xs py-[3px] text-xs text-ink-subdued">{courseMeta}</span>
            </div>
            <div className="mt-xxs flex items-center gap-sm">
              <div className="h-1.5 flex-1 overflow-hidden rounded-round bg-line-subdued">
                <div
                  className="h-full rounded-round"
                  style={{ width: `${p}%`, background: barColor }}
                />
              </div>
              <span className="text-xs tabular-nums text-ink-subdued">{p}%</span>
            </div>
          </div>
        </button>
      )}
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function LearningGoalsPage() {
  const [draft, setDraft] = useState('')
  const [navOpen, setNavOpen] = useState(true)
  const [archiveOpen, setArchiveOpen] = useState(false)
  const navigate = useNavigate()
  // Set only when arriving via the "See learning goals" button on the goal-complete
  // card — that goal's card then shows a green check instead of its progress ring.
  const location = useLocation()
  const completedGoalId = (location.state as { completedGoalId?: string } | null)?.completedGoalId

  // Submitting a goal from the chat entry kicks off the Personal goal flow,
  // seeding it with the entered goal so it skips its own setup screen.
  const submitGoal = () => {
    const goal = draft.trim()
    if (!goal) return
    navigate(`/personal-goal-e2e?goal=${encodeURIComponent(goal)}`)
  }

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <UBHeader />
      <div className="flex flex-1 overflow-hidden">
        <CollapsibleNav active="learning-goals" open={navOpen} onToggle={() => setNavOpen((o) => !o)} />

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-surface-pale px-xl py-lg">
          <div className="mx-auto max-w-[900px]">
            <h1 className="text-2xl font-bold text-ink">Learning goals</h1>

            {/* Goal creation input — multi-line chat style */}
            <div className="mt-md rounded-[32px] border border-line bg-surface shadow-[var(--box-shadow-100)]">
              <div className="px-[24px] pt-[14px]">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submitGoal()
                    }
                  }}
                  placeholder="Create a new goal. Tell me what you want to improve or achieve..."
                  rows={2}
                  className="w-full resize-none bg-transparent text-sm leading-relaxed text-ink outline-none placeholder:text-ink-subdued"
                />
              </div>
              <div className="flex items-center justify-between pb-[14px] pl-[8px] pr-[14px]">
                <button
                  className="flex size-8 items-center justify-center rounded-round text-ink-subdued hover:bg-surface-pale hover:text-ink"
                  aria-label="Attach"
                >
                  <Plus className="size-4" strokeWidth={2} />
                </button>
                <button
                  onClick={submitGoal}
                  aria-label="Create goal"
                  className="flex size-9 shrink-0 items-center justify-center rounded-round bg-brand text-on-brand hover:bg-brand-strong disabled:opacity-40"
                  disabled={!draft.trim()}
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-none stroke-current" strokeWidth={2.25} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Suggestion chips */}
            <div className="mt-sm flex flex-wrap gap-xs">
              {CHIPS.map((chip) => (
                <button
                  key={chip}
                  onClick={() => setDraft(`I want to focus on ${chip.toLowerCase()}`)}
                  className="flex items-center gap-xs rounded-round bg-surface-accent px-sm py-xs text-xs font-medium text-ink hover:bg-brand-pale"
                >
                  <Sparkles className="size-3.5 text-brand" strokeWidth={2} />
                  {chip}
                </button>
              ))}
            </div>

            {/* Goals list */}
            <div className="mt-lg flex flex-col gap-md">
              {ACTIVE_GOALS.map((g) => (
                <GoalCard key={g.id} goal={g} complete={g.id === completedGoalId} />
              ))}
            </div>

            {/* Archived goals — hidden by default, right-aligned ghost toggle */}
            <div className="mt-md flex flex-col items-end gap-md">
              <button
                onClick={() => setArchiveOpen((o) => !o)}
                className="flex items-center gap-xs rounded-md px-xs py-xxs text-sm font-medium text-ink-subdued transition-colors hover:text-ink"
                aria-expanded={archiveOpen}
              >
                <History className="size-4" strokeWidth={1.75} />
                Archived ({ARCHIVED_GOALS.length})
                <ChevronDown className={cn('size-4 transition-transform', archiveOpen ? 'rotate-180' : '')} strokeWidth={2} />
              </button>
              {archiveOpen && (
                <div className="flex w-full animate-altus-fadein flex-col gap-md">
                  {ARCHIVED_GOALS.map((g) => (
                    <GoalCard key={g.id} goal={g} />
                  ))}
                </div>
              )}
            </div>

            {/* Prototype helper */}
            <p className="mt-xl text-center text-xs text-ink-subdued">
              <Link to="/scenarios" className="hover:underline">View all scenario variants →</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
