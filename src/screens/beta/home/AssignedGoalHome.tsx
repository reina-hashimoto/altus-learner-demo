import { Flag, Flame, Play, FlaskConical, ClipboardCheck } from 'lucide-react'
import { UBHeader } from '@/components/shell/UBHeader'
import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui/utils'

/**
 * Udemy Business homepage entry for an admin-assigned goal (Figma "Desktop-142").
 * Shows the org-assigned goal banner (parameterized per scenario) plus the
 * standing "Start a weekly streak" and "Weekly challenge" cards. Clicking
 * "View the plan" enters the goal's dashboard flow.
 */
export interface AssignedGoalHomeProps {
  /** Who assigned the goal, e.g. "CPO, John D." */
  assigner: string
  /** The assigned goal title, e.g. "Upskilling in Generative AI". */
  goalTitle: string
  /** Deadline phrase, e.g. "the end of August, 2026". */
  dueLabel: string
  onViewPlan: () => void
}

const CATEGORIES = [
  'Development',
  'Business',
  'IT & software',
  'Office productivity',
  'Personal development',
  'Design',
  'Marketing',
  'Health and fitness',
]

const WEEK_RANGE = 'Feb 22-28, 2026'

export function AssignedGoalHome({ assigner, goalTitle, dueLabel, onViewPlan }: AssignedGoalHomeProps) {
  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <UBHeader />

      {/* Marketplace category bar */}
      <nav className="flex shrink-0 items-center gap-lg overflow-x-auto border-b border-line-subdued bg-surface px-md py-xs text-sm text-ink">
        {CATEGORIES.map((c) => (
          <button key={c} className="shrink-0 whitespace-nowrap hover:text-brand">
            {c}
          </button>
        ))}
      </nav>

      <div className="flex-1 overflow-y-auto">
        {/* Assigned-goal banner band */}
        <section className="bg-surface-pale px-lg py-xl">
          <div className="mx-auto max-w-[768px]">
            <GoalBanner assigner={assigner} goalTitle={goalTitle} dueLabel={dueLabel} onViewPlan={onViewPlan} />
          </div>
        </section>

        {/* Streak + weekly challenge */}
        <section className="bg-surface-pale px-lg py-xl">
          <div className="mx-auto max-w-[1290px]">
            <p className="text-right text-sm text-ink-subdued">{WEEK_RANGE}</p>
            <div className="mt-xs grid grid-cols-1 gap-md lg:grid-cols-2">
              <StreakCard />
              <ChallengeCard />
            </div>
          </div>
        </section>

        {/* Rest of the marketplace homepage (placeholder) */}
        <section className="h-[220px] bg-surface-pale" aria-hidden />
      </div>
    </div>
  )
}

// ── Assigned-goal banner ─────────────────────────────────────────────────────

function GoalBanner({ assigner, goalTitle, dueLabel, onViewPlan }: AssignedGoalHomeProps) {
  return (
    <div className="flex flex-wrap items-center gap-sm rounded-2xl border border-line bg-surface p-md">
      <div className="flex min-w-[500px] flex-1 items-start gap-sm">
        <Flag className="size-8 shrink-0 text-[#2d907f]" strokeWidth={1.75} />
        <div className="flex flex-1 flex-col gap-sm">
          <div className="flex flex-col gap-xs">
            <p className="text-lg font-medium leading-snug text-ink">New organizational goal assigned by {assigner}</p>
            <p className="text-lg leading-relaxed text-ink">
              <span className="font-medium text-brand">“{goalTitle}”</span>{' '}
              <span className="font-light">by {dueLabel}</span>
            </p>
          </div>
          <Button udStyle="primary" size="medium" onClick={onViewPlan}>
            View the plan
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Streak card ──────────────────────────────────────────────────────────────

function StreakCard() {
  return (
    <WeekCard title="Start a weekly streak" subtitle="You’ll always be glad you made time for learning.">
      <div className="flex items-center justify-between gap-md">
        {/* Current streak */}
        <div className="flex items-center gap-sm">
          <Flame className="size-12 shrink-0 text-brand" strokeWidth={1.5} />
          <span className="flex flex-col leading-tight">
            <span className="text-ink">
              <span className="text-2xl font-medium">1</span> <span className="text-base font-light">week</span>
            </span>
            <span className="text-base text-ink-subdued">Current streak</span>
          </span>
        </div>
        {/* Progress ring + legend */}
        <div className="flex items-center gap-md">
          <StreakRing />
          <span className="flex flex-col gap-sm text-base">
            <span className="flex items-center gap-xs">
              <span className="size-2 rounded-round" style={{ background: '#F5A623' }} />
              <span className="text-ink">
                <span className="font-bold">20</span>/30 min
              </span>
            </span>
            <span className="flex items-center gap-xs">
              <span className="size-2 rounded-round" style={{ background: '#16897B' }} />
              <span className="text-ink">
                <span className="font-bold">1</span>/1 visit
              </span>
            </span>
          </span>
        </div>
      </div>
    </WeekCard>
  )
}

/** Dual-arc ring: orange = minutes progress, teal = visit progress. */
function StreakRing() {
  const size = 76
  const stroke = 6
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const gap = 0.04
  const minPct = 20 / 30
  const visitPct = 1 - minPct
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-[76px] -rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-gray-200)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#F5A623"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circ * (minPct - gap)} ${circ * (1 - minPct + gap)}`}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#16897B"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${circ * (visitPct - gap)} ${circ * (1 - visitPct + gap)}`}
        strokeDashoffset={-circ * minPct}
      />
    </svg>
  )
}

// ── Weekly challenge card ────────────────────────────────────────────────────

function ChallengeCard() {
  return (
    <WeekCard title="Weekly challenge" subtitle="Complete one activity in each learning type">
      <div className="flex flex-wrap items-center justify-between gap-md">
        <ChallengeType label="Learn" sub="Video, article" icon={<Play className="size-6 fill-current" strokeWidth={0} />} active />
        <ChallengeType label="Practice" sub="Role play, Lab" icon={<FlaskConical className="size-6" strokeWidth={1.75} />} active />
        <ChallengeType label="Assess" sub="Quiz, assessment" icon={<ClipboardCheck className="size-6" strokeWidth={1.75} />} active={false} />
      </div>
    </WeekCard>
  )
}

function ChallengeType({
  label,
  sub,
  icon,
  active,
}: {
  label: string
  sub: string
  icon: React.ReactNode
  active: boolean
}) {
  return (
    <div className="flex items-center gap-sm">
      <span
        className={cn(
          'flex size-12 shrink-0 items-center justify-center rounded-round',
          active ? 'text-white' : 'border border-line-input text-ink-subdued',
        )}
        style={active ? { background: 'radial-gradient(circle at 30% 30%, #2a2b3f 28%, #1f8552 50%, #45b5bb 100%)' } : undefined}
      >
        {icon}
      </span>
      <span className="flex flex-col leading-tight">
        <span className={cn('text-base font-medium', active ? 'text-ink' : 'text-[#6f7390]')}>{label}</span>
        <span className="text-xs text-ink-subdued">{sub}</span>
      </span>
    </div>
  )
}

// ── Shared card shell ────────────────────────────────────────────────────────

function WeekCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-lg rounded-2xl border border-line bg-surface px-[40px] pb-md pt-lg">
      <div className="flex items-start justify-between gap-sm">
        <div className="flex flex-col gap-xs">
          <h3 className="text-2xl font-medium leading-tight text-ink">{title}</h3>
          <p className="text-base font-light text-ink">{subtitle}</p>
        </div>
        <HelpDot />
      </div>
      {children}
      <div className="flex justify-end">
        <button className="text-sm font-bold text-brand hover:underline">View activity</button>
      </div>
    </div>
  )
}

/** Circled "i" affordance used in card headers. */
function HelpDot() {
  return (
    <span className="flex size-5 shrink-0 items-center justify-center rounded-round border border-line-subdued text-[11px] font-bold leading-none text-ink-subdued">
      i
    </span>
  )
}
