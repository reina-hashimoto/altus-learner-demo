import { ChevronRight, Play } from 'lucide-react'
import { AdminHeader, CategoryNav } from './AdminHeader'
import { StreakChallengeRow } from './StreakWidgets'
import coursePrompt from '@/assets/course-prompt-engineering.png'

/** Circular "0/6" goal-progress ring (purple track, matches Figma). */
function GoalRing({ completed, total }: { completed: number; total: number }) {
  const size = 48
  const stroke = 3
  const r = (size - stroke) / 2
  return (
    <span className="relative flex size-12 shrink-0 items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-purple-150)"
          strokeWidth={stroke}
        />
      </svg>
      <span className="text-xs font-medium text-ink tabular-nums">
        {completed}/{total}
      </span>
    </span>
  )
}

function GoalChip({ label, filled }: { label: string; filled?: boolean }) {
  return filled ? (
    <span className="inline-flex items-center rounded-sm bg-[var(--color-orange-200)] px-xs py-0.5 text-xs font-bold text-ink">
      {label}
    </span>
  ) : (
    <span className="inline-flex items-center rounded-sm border border-line px-xs py-0.5 text-xs text-ink-subdued">
      {label}
    </span>
  )
}

/** The embedded "current course" card inside the goal summary. */
function GoalCourseCard() {
  return (
    <div className="flex gap-sm rounded-lg border border-line-subdued p-sm">
      <span className="relative size-12 shrink-0">
        <img src={coursePrompt} alt="" className="size-12 rounded-md object-cover" />
        <span className="absolute inset-0 flex items-center justify-center">
          <Play className="size-5 text-on-brand" fill="currentColor" strokeWidth={0} />
        </span>
      </span>
      <div className="flex flex-1 flex-col gap-xs">
        <div className="flex flex-col gap-xxs">
          <h3 className="text-lg font-medium leading-tight text-ink">
            Generative AI for Product Design
          </h3>
          <p className="text-xs text-ink-subdued">Dr. Diana McKinsey</p>
        </div>
        <div className="flex items-center gap-xs">
          <span className="inline-flex items-center rounded-sm border border-line px-xs py-0.5 text-xs text-ink-subdued">
            Course
          </span>
          <span className="inline-flex items-center rounded-sm border border-line px-xs py-0.5 text-xs text-ink-subdued">
            74.5 total hours
          </span>
        </div>
        <div className="flex items-center gap-sm">
          <div className="h-1.5 flex-1 overflow-hidden rounded-round bg-[var(--color-green-150)]">
            <div className="h-full rounded-round bg-[var(--color-green-300)]" style={{ width: '25%' }} />
          </div>
          <span className="text-xs text-ink tabular-nums">25%</span>
        </div>
      </div>
    </div>
  )
}

/**
 * Screen B — "Streak home" (post-setup). Marketplace header + gray hero with a
 * goal-summary card whose "See details" link advances to the goal detail
 * screen, over the shared streak / weekly-challenge row.
 */
export function StreakHomeScreen({ onSeeDetails }: { onSeeDetails: () => void }) {
  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <AdminHeader />
      <CategoryNav />

      <div className="flex-1 overflow-y-auto">
        {/* hero band */}
        <section className="bg-surface-pale py-xl">
          <div className="mx-auto w-full max-w-[1160px] px-xl">
            <div className="pl-[260px]">
              <h1 className="text-xxl font-medium text-ink">Welcome back, Reina!</h1>
              <p className="mt-xxs text-sm text-ink-subdued">
                Welcome back! Let's continue to work on your learning goal!
              </p>

              {/* goal summary card */}
              <div className="mt-md max-w-[820px] rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">
                <div className="flex items-start gap-md">
                  <GoalRing completed={0} total={6} />
                  <div className="flex flex-1 flex-col gap-sm">
                    <div className="flex items-start justify-between gap-md">
                      <div className="flex flex-col gap-xxs">
                        <h2 className="text-lg font-medium leading-tight text-ink">
                          Upskilling in generative AI
                        </h2>
                        <p className="text-sm text-ink-subdued">By the end of June, 2026</p>
                      </div>
                      <button
                        onClick={onSeeDetails}
                        className="flex shrink-0 items-center gap-xxs text-sm font-bold text-brand hover:text-brand-strong"
                      >
                        See details
                        <ChevronRight className="size-4" strokeWidth={2.25} />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-xs">
                      <GoalChip label="Personal goal" filled />
                      <GoalChip label="Skill 1" />
                      <GoalChip label="Skill 2" />
                      <GoalChip label="Skill 3" />
                    </div>

                    <GoalCourseCard />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* streak + weekly challenge */}
        <section className="bg-surface py-xl">
          <div className="mx-auto w-full max-w-[1160px] px-xl">
            <StreakChallengeRow streakSubtitle="You'll always be glad you made time for learning." />
          </div>
        </section>
      </div>
    </div>
  )
}
