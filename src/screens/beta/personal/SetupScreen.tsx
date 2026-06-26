/**
 * Screen 1 — Setup (entry). The marketplace home: header + category nav, a pale
 * hero band with the greeting, a wide prefilled chat input + purple arrow submit
 * + suggestion chips, and the streak / weekly-challenge widgets below.
 *
 * Submitting the input advances the flow (passing the typed goal text up).
 * There is deliberately NO "Welcome back, Reina!" goal-home card here.
 */
import { useState } from 'react'
import {
  ArrowRight,
  Sparkles,
  Info,
  Flame,
  GraduationCap,
  FlaskConical,
  ClipboardCheck,
} from 'lucide-react'
import { PersonalHeader, CategoryNav } from './shell'

const CHIPS = [
  'Get promoted',
  'Upskilling in generative AI',
  'Learning new tools',
  'Improve communication',
]

const DEFAULT_GOAL = 'I want to upskill in Generative AI'

// ── Streak widgets (local, mirrors the marketplace home pattern) ─────────────

function StreakRing() {
  const size = 72
  const stroke = 6
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-[72px] -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-teal-400)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * 0.34} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-orange-400)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * 0.34} />
    </svg>
  )
}

function HomeCard({ children }: { children: React.ReactNode }) {
  return <section className="flex-1 rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">{children}</section>
}

function StreakCard() {
  return (
    <HomeCard>
      <div className="mb-md flex items-start justify-between">
        <div>
          <h2 className="text-lg font-medium text-ink">Start a weekly streak</h2>
          <p className="mt-xxs text-sm text-ink-subdued">Just 30 mins a week help you achieve your goals</p>
        </div>
        <Info className="size-5 shrink-0 text-ink-subdued" strokeWidth={1.75} />
      </div>
      <div className="flex items-center gap-xl">
        <div className="flex items-center gap-sm">
          <Flame className="size-7 text-brand" strokeWidth={2} fill="var(--color-purple-400)" />
          <div>
            <p className="text-ink">
              <span className="text-lg font-bold">1</span> week
            </p>
            <p className="text-sm text-ink-subdued">Current streak</p>
          </div>
        </div>
        <div className="flex items-center gap-sm">
          <StreakRing />
          <div className="flex flex-col gap-xs text-sm">
            <span className="flex items-center gap-xs">
              <span className="size-2.5 rounded-round bg-[var(--color-orange-400)]" />
              <span className="text-ink">
                <span className="font-bold">20</span>/30 min
              </span>
            </span>
            <span className="flex items-center gap-xs">
              <span className="size-2.5 rounded-round bg-[var(--color-teal-400)]" />
              <span className="text-ink">
                <span className="font-bold">1</span>/1 visit
              </span>
            </span>
          </div>
        </div>
      </div>
    </HomeCard>
  )
}

const CHALLENGE_TYPES = [
  { icon: GraduationCap, label: 'Learn', sub: 'Video, article', bg: 'var(--color-teal-400)', on: true },
  { icon: FlaskConical, label: 'Practice', sub: 'Role play, Lab', bg: 'var(--color-teal-500)', on: true },
  { icon: ClipboardCheck, label: 'Assess', sub: 'Quiz, assessment', bg: 'transparent', on: false },
]

function ChallengeCard() {
  return (
    <HomeCard>
      <div className="mb-md flex items-start justify-between">
        <div>
          <h2 className="text-lg font-medium text-ink">Weekly challenge</h2>
          <p className="mt-xxs text-sm text-ink-subdued">Complete one activity in each learning type</p>
        </div>
        <Info className="size-5 shrink-0 text-ink-subdued" strokeWidth={1.75} />
      </div>
      <div className="flex items-center gap-lg">
        {CHALLENGE_TYPES.map(({ icon: Icon, label, sub, bg, on }) => (
          <div key={label} className="flex items-center gap-sm">
            <span
              className={`flex size-11 items-center justify-center rounded-round ${on ? 'text-on-brand' : 'border border-line text-ink-subdued'}`}
              style={on ? { background: bg } : undefined}
            >
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className={`text-sm font-bold ${on ? 'text-ink' : 'text-ink-subdued'}`}>{label}</p>
              <p className="text-xs text-ink-subdued">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </HomeCard>
  )
}

// ── Setup screen ─────────────────────────────────────────────────────────────

export function SetupScreen({ onSubmit }: { onSubmit: (goal: string) => void }) {
  const [value, setValue] = useState(DEFAULT_GOAL)

  const submit = () => {
    const goal = value.trim()
    if (goal) onSubmit(goal)
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PersonalHeader />
      <CategoryNav />

      {/* Hero band */}
      <div className="bg-surface-pale px-xl py-xl">
        <div className="mx-auto max-w-[1100px]">
          <p className="text-xl text-ink">Hi Reina!</p>
          <h1 className="mt-xxs text-xxl font-medium leading-tight text-ink">
            Let’s set up your learning goals
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
            className="mt-md flex items-center gap-sm rounded-xl border border-line-subdued bg-surface px-md py-md shadow-[var(--box-shadow-100)]"
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Describe a goal you want to work toward"
              className="h-9 flex-1 bg-transparent text-md text-ink outline-none placeholder:text-ink-subdued"
            />
            <button
              type="submit"
              aria-label="Set goal"
              className="flex size-9 shrink-0 items-center justify-center rounded-round bg-brand text-on-brand transition-colors hover:bg-brand-strong"
            >
              <ArrowRight className="size-4" strokeWidth={2.25} />
            </button>
          </form>

          <div className="mt-md flex flex-wrap gap-sm">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => setValue(`I want to focus on ${c.toLowerCase()}`)}
                className="flex items-center gap-xs rounded-round bg-surface-accent px-md py-xs text-sm text-ink transition-colors hover:bg-brand-pale"
              >
                <Sparkles className="size-4 text-brand" strokeWidth={2} />
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Streak + weekly challenge widgets */}
      <div className="flex-1 bg-surface">
        <div className="mx-auto w-full max-w-[1100px] px-xl py-xl">
          <p className="mb-sm text-right text-sm text-ink-subdued">Feb 22-28, 2026</p>
          <div className="flex gap-lg">
            <StreakCard />
            <ChallengeCard />
          </div>
        </div>
      </div>
    </div>
  )
}
