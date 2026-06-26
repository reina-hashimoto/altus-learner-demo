import { Info, Flame, GraduationCap, FlaskConical, ClipboardCheck, Play, HelpCircle } from 'lucide-react'

/** A two-arc ring: orange = minutes goal, teal = visits goal. */
function StreakRing() {
  const size = 72
  const stroke = 6
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  // Orange arc ~ 20/30, teal arc full (1/1) drawn as the remaining track look.
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-[72px] -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-teal-400)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * 0.34} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-orange-400)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * 0.34} />
    </svg>
  )
}

function HomeCard({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex-1 rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">{children}</section>
  )
}

function StreakCard({ subtitle }: { subtitle: string }) {
  return (
    <HomeCard>
      <div className="mb-md flex items-start justify-between">
        <div>
          <h2 className="text-lg font-medium text-ink">Start a weekly streak</h2>
          <p className="mt-xxs text-sm text-ink-subdued">{subtitle}</p>
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
      <div className="mt-md text-right">
        <a href="#" className="text-sm font-bold text-brand hover:underline">View activity</a>
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
      <div className="mt-md text-right">
        <a href="#" className="text-sm font-bold text-brand hover:underline">View activity</a>
      </div>
    </HomeCard>
  )
}

const TABS = ['Courses', 'Assigned courses', 'Learning paths', 'Certification preparation', 'Assessments', 'Labs']
const PRO_TABS = new Set(['Assessments', 'Labs'])

const CARDS = [
  { kind: 'video' as const, eyebrow: 'Complete Data Analyst Bootcamp From …', title: '1. What Does A Data Analyst Do and Its Roadmap', meta: 'Lecture · 18m', progress: 12, bg: 'var(--color-gray-650)' },
  { kind: 'video' as const, eyebrow: 'AWS Certified Cloud Practitioner (CLF-C…', title: '51. Amazon Simple Storage Service (S3)', meta: 'Lecture · 2m left', progress: 92, bg: 'var(--color-gray-600)' },
  { kind: 'quiz' as const, eyebrow: 'AWS Certified Cloud Practitioner Practi…', title: '1. AWS Certified Cloud Practitioner', meta: 'Quiz · 65 questions', progress: 0, bg: 'var(--color-red-150)' },
]

function PickUp() {
  return (
    <section className="mt-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xxl font-medium text-ink">Pick up where you left off</h2>
        <a href="#" className="text-md font-bold text-brand underline">My learning</a>
      </div>

      <div className="mt-md flex items-center gap-lg overflow-x-auto border-b border-line-subdued text-sm">
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`flex items-center gap-xs whitespace-nowrap border-b-2 pb-sm ${i === 0 ? 'border-ink font-bold text-ink' : 'border-transparent text-ink-subdued hover:text-ink'}`}
          >
            {t}
            {PRO_TABS.has(t) && (
              <span className="rounded-sm bg-[var(--color-green-400)] px-xs py-px text-xxs font-bold text-on-brand">★ Pro</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-md grid grid-cols-3 gap-md">
        {CARDS.map((c) => (
          <article key={c.title} className="flex overflow-hidden rounded-md border border-line-subdued bg-surface">
            <div className="relative flex size-[92px] shrink-0 items-center justify-center" style={{ background: c.bg }}>
              {c.kind === 'video' ? (
                <span className="flex size-9 items-center justify-center rounded-round bg-surface/90">
                  <Play className="size-4 text-ink" fill="currentColor" />
                </span>
              ) : (
                <HelpCircle className="size-8 text-[var(--color-red-400)]" strokeWidth={1.75} />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-xxs p-sm">
              <p className="truncate text-xs text-ink-subdued">{c.eyebrow}</p>
              <h3 className="line-clamp-2 text-sm font-bold leading-tight text-ink">{c.title}</h3>
              <p className="mt-auto text-xs text-ink-subdued">{c.meta}</p>
              {c.progress > 0 && (
                <div className="h-1 overflow-hidden rounded-round bg-line-subdued">
                  <div className="h-full bg-brand" style={{ width: `${c.progress}%` }} />
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

/** The streak + challenge + pick-up section shared by home screens 1 & 2. */
export function HomeActivity({ streakSubtitle }: { streakSubtitle: string }) {
  return (
    <div className="mx-auto w-full max-w-[1296px] px-xl py-xl">
      <p className="mb-sm text-right text-sm text-ink-subdued">Feb 22-28, 2026</p>
      <div className="flex gap-lg">
        <StreakCard subtitle={streakSubtitle} />
        <ChallengeCard />
      </div>
      <PickUp />
    </div>
  )
}
