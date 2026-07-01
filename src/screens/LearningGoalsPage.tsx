import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronRight, Sparkles, Flag, Lightbulb, FolderClosed, AlarmClock, Plus } from 'lucide-react'
import { UBHeader } from '@/components/shell/UBHeader'
import { COURSES_AI, COURSES_OPEN_PM, COURSES_CUSTOM_PM, type Course } from '@/data/goal'
import { cn } from '@/components/ui/utils'

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

const GOALS: GoalDef[] = [
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
  {
    id: 'custom-pm',
    flowId: 'custom-pm',
    category: '4. Custom',
    title: 'Upskilling in Generative AI',
    deadline: 'August, 2026',
    type: 'org',
    skills: ['AI-Native Product Development', 'AI-Powered Prototyping', 'AI-Assisted Product Analytics'],
    completed: 0,
    total: 3,
    course: COURSES_CUSTOM_PM[0],
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

/** Single goal card matching the Figma LectureProductCard structure. */
function GoalCard({ goal }: { goal: GoalDef }) {
  const isOrg = goal.type === 'org'

  const courseMeta = `${goal.course.lectures} lectures · ${goal.course.duration}`

  // Progress bar colour: 0% neutral grey · 1–99% purple · 100% green.
  const p = goal.courseProgress
  const barColor = p <= 0 ? 'var(--color-gray-300)' : p >= 100 ? 'var(--color-green-500)' : 'var(--color-purple-400)'

  return (
    <div className="rounded-xl bg-surface">
      {/* Goal header row */}
      <div className="flex items-start gap-md p-md">
        <ProgressRing completed={goal.completed} total={goal.total} />
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

      {/* Next course row */}
      <div className="flex items-start gap-sm border-t border-line-subdued px-md py-sm">
        <div className="relative size-12 shrink-0 overflow-hidden rounded-md">
          <img src={goal.course.image} alt="" className="size-full object-cover" />
          <span className="absolute inset-0 flex items-center justify-center bg-black/30">
            <svg viewBox="0 0 24 24" className="size-5 fill-white">
              <path d="M8 5v14l11-7z" />
            </svg>
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-xxs">
          <p className="line-clamp-2 text-sm font-medium leading-snug text-ink">{goal.course.title}</p>
          <p className="text-xs text-ink-subdued">{goal.instructor}</p>
          <p className="text-xs text-ink-subdued">
            Course &nbsp;·&nbsp; {courseMeta}
          </p>
          <div className="mt-xxs flex items-center gap-xs">
            <div className="h-1.5 flex-1 overflow-hidden rounded-round bg-ink/10">
              <div
                className="h-full rounded-round"
                style={{ width: `${goal.courseProgress}%`, background: barColor }}
              />
            </div>
            <span className="text-xs tabular-nums text-ink">{goal.courseProgress}%</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Left-sidebar My Learning navigation. */
function MyLearningSidebar() {
  const [libraryOpen, setLibraryOpen] = useState(true)

  return (
    <aside className="flex w-[280px] shrink-0 flex-col border-r border-line-subdued bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-md py-md">
        <h2 className="text-lg font-bold text-ink">My learning</h2>
        <Link
          to="/"
          className="flex size-8 items-center justify-center rounded-md text-ink-subdued hover:bg-surface-pale hover:text-ink"
          aria-label="Back"
        >
          <ArrowLeft className="size-5" strokeWidth={2} />
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex flex-col">
        {/* Learning goals — active */}
        <Link
          to="/learning-goals"
          className="relative flex items-center gap-sm py-sm pl-md pr-md text-sm font-bold text-ink bg-surface-accent"
        >
          <span className="absolute left-0 top-0 h-full w-[3px] rounded-r-sm bg-brand" />
          <Flag className="size-5 text-brand" strokeWidth={1.75} />
          Learning goals
        </Link>

        {/* Skills profile */}
        <button className="flex items-center gap-sm py-sm pl-md pr-md text-sm font-medium text-ink-subdued hover:bg-surface-pale hover:text-ink">
          <Lightbulb className="size-5" strokeWidth={1.75} />
          Skills profile
        </button>

        {/* Library — collapsible */}
        <button
          onClick={() => setLibraryOpen((o) => !o)}
          className="flex items-center gap-sm py-sm pl-md pr-md text-sm font-medium text-ink-subdued hover:bg-surface-pale hover:text-ink"
        >
          <FolderClosed className="size-5" strokeWidth={1.75} />
          <span className="flex-1 text-left">Library</span>
          <ChevronDown
            className={cn('size-4 transition-transform', libraryOpen ? 'rotate-0' : '-rotate-90')}
            strokeWidth={2}
          />
        </button>

        {libraryOpen && (
          <div className="flex flex-col">
            {['Courses', 'Learning paths', 'Certifications', 'Assessments', 'Labs'].map((item) => (
              <button
                key={item}
                className="py-xs pl-[52px] pr-md text-left text-sm text-ink-subdued hover:bg-surface-pale hover:text-ink"
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {/* Reminders */}
        <button className="flex items-center gap-sm py-sm pl-md pr-md text-sm font-medium text-ink-subdued hover:bg-surface-pale hover:text-ink">
          <AlarmClock className="size-5" strokeWidth={1.75} />
          Reminders
        </button>
      </nav>
    </aside>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function LearningGoalsPage() {
  const [draft, setDraft] = useState('')

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <UBHeader />
      <div className="flex flex-1 overflow-hidden">
        <MyLearningSidebar />

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
              {GOALS.map((g) => (
                <GoalCard key={g.id} goal={g} />
              ))}
            </div>

            {/* Prototype helper */}
            <p className="mt-xl text-center text-xs text-ink-subdued">
              <Link to="/" className="hover:underline">View all scenario variants →</Link>
            </p>
          </div>
        </main>
      </div>
    </div>
  )
}
