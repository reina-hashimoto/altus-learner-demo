/**
 * Left-hand content of the Goal Detail screen. Two states:
 *  - skeleton (initial): grey "Skills to develop" bars + skeleton learning path
 *    + a goal header with the "Personal goal" chip and "2 hours /week" but a
 *    skeletoned title.
 *  - populated (after Confirm): real goal header, the 3-series skills chart,
 *    and the learning path timeline.
 */
import {
  Flag,
  CalendarDays,
  HelpCircle,
  Lightbulb,
  ChevronDown,
  RotateCw,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui/utils'
import {
  SKILL_SCALE_MAX,
  SKILL_TICKS,
  SKILL_BANDS,
  GOAL_META,
  type SkillRow,
  type PathCourse,
} from './data'

const pct = (v: number) => `${(v / SKILL_SCALE_MAX) * 100}%`

// ── Goal header ──────────────────────────────────────────────────────────────

function GoalChip() {
  return (
    <span className="inline-flex w-fit items-center gap-xs rounded-sm bg-surface-accent px-xs py-xxs text-xs font-bold text-brand">
      <Flag className="size-3.5" strokeWidth={2} />
      {GOAL_META.tag}
    </span>
  )
}

function GoalHeaderSkeleton() {
  return (
    <div className="flex flex-col gap-xs">
      <GoalChip />
      <div className="h-7 w-[60%] animate-pulse rounded-sm bg-surface-midtone" />
      <div className="mt-xxs flex items-center gap-md text-sm text-ink-subdued">
        <span className="flex items-center gap-xs">
          <CalendarDays className="size-4" strokeWidth={1.75} />
          <span className="h-4 w-24 animate-pulse rounded-sm bg-surface-midtone" />
        </span>
        <span className="flex items-center gap-xs">
          <span className="font-bold text-ink">{GOAL_META.commitment}</span>
          <span>{GOAL_META.commitmentUnit}</span>
        </span>
      </div>
    </div>
  )
}

function GoalHeader() {
  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-start justify-between gap-md">
        <div className="flex flex-col gap-xs">
          <GoalChip />
          <h1 className="text-xxl font-medium leading-tight text-ink">{GOAL_META.title}</h1>
        </div>
        <Button udStyle="secondary" size="small" className="gap-xs">
          Edit
          <ChevronDown className="size-4" strokeWidth={2} />
        </Button>
      </div>
      <div className="mt-xxs flex flex-wrap items-center gap-md text-sm text-ink-subdued">
        <span className="flex items-center gap-xs">
          <CalendarDays className="size-4" strokeWidth={1.75} />
          <span className="font-bold text-ink">{GOAL_META.daysLeft}</span>
          <span>·</span>
          <span>{GOAL_META.dueDate}</span>
        </span>
        <span className="flex items-center gap-xs">
          <span className="font-bold text-ink">{GOAL_META.commitment}</span>
          <span>{GOAL_META.commitmentUnit}</span>
        </span>
        <span className="rounded-sm bg-surface-midtone px-xs py-xxs text-xs font-medium text-ink">
          {GOAL_META.role}
        </span>
      </div>
    </div>
  )
}

// ── Skills to develop ────────────────────────────────────────────────────────

const SOURCE_COLOR: Record<SkillRow['source'], string> = {
  Estimated: 'var(--color-orange-150)',
  'Self-reported': 'var(--color-purple-150)',
  'Udemy Verified': 'var(--color-purple-400)',
}

const LEGEND = [
  { label: 'Estimated', color: 'var(--color-orange-150)', shape: 'bar' as const },
  { label: 'Self-reported', color: 'var(--color-purple-150)', shape: 'bar' as const },
  { label: 'Udemy Verified', color: 'var(--color-purple-400)', shape: 'bar' as const },
  { label: 'Target proficiency', color: 'var(--color-purple-400)', shape: 'dot' as const },
]

function SkillsCardSkeleton() {
  return (
    <section className="rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">
      <div className="mb-md flex items-center gap-xs">
        <h2 className="text-lg font-medium text-ink">Skills to develop</h2>
        <HelpCircle className="size-4 text-ink-subdued" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-md">
        {[0, 1, 2].map((i) => (
          <div key={i} className="grid grid-cols-[180px_1fr] items-center gap-sm">
            <div className="ml-auto h-3 w-32 animate-pulse rounded-sm bg-surface-midtone" />
            <div
              className="h-2.5 animate-pulse rounded-sm bg-surface-midtone"
              style={{ width: `${70 - i * 15}%` }}
            />
          </div>
        ))}
      </div>
    </section>
  )
}

function SkillsCard({ skills }: { skills: SkillRow[] }) {
  return (
    <section className="rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">
      <div className="mb-md flex items-center justify-between">
        <h2 className="flex items-center gap-xs text-lg font-medium text-ink">
          Skills to develop
          <HelpCircle className="size-4 text-ink-subdued" strokeWidth={1.75} />
        </h2>
        <span className="text-xs font-medium text-ink-subdued">{GOAL_META.role}</span>
      </div>

      <div className="flex flex-col gap-xs-mid">
        {/* axis */}
        <div className="grid grid-cols-[180px_1fr_104px] items-end gap-sm">
          <div />
          <div className="relative h-5 text-xxs text-ink-subdued">
            {SKILL_TICKS.map((t) => (
              <span key={t} className="absolute top-0 -translate-x-1/2 tabular-nums" style={{ left: pct(t) }}>
                {t}
              </span>
            ))}
            {SKILL_BANDS.map((b, i) => (
              <span key={b} className="absolute bottom-0 -translate-x-1/2" style={{ left: pct(25 + i * 50) }}>
                {b}
              </span>
            ))}
          </div>
          <div />
        </div>

        {/* rows */}
        {skills.map((s) => (
          <div key={s.id} className="grid grid-cols-[180px_1fr_104px] items-center gap-sm">
            <div className="text-right text-xs font-bold leading-tight text-ink">{s.name}</div>
            <div className="relative h-9">
              {SKILL_TICKS.map((t) => (
                <span key={t} className="absolute top-0 bottom-0 w-px bg-line-subdued" style={{ left: pct(t) }} />
              ))}
              {/* current proficiency bar, coloured by source */}
              <div
                className="absolute top-1/2 left-0 h-2.5 -translate-y-1/2 rounded-sm"
                style={{ width: pct(s.current), background: SOURCE_COLOR[s.source] }}
              />
              {/* target proficiency dot */}
              <span
                className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-round bg-brand"
                style={{ left: pct(s.target) }}
              />
            </div>
            <div className="flex justify-end">
              {s.source === 'Udemy Verified' ? (
                <button className="flex items-center gap-xs text-xs font-bold text-link hover:underline">
                  Retake
                  <RotateCw className="size-3.5" strokeWidth={2} />
                </button>
              ) : (
                <Button udStyle="secondary" size="xsmall">
                  Assess
                </Button>
              )}
            </div>
          </div>
        ))}

        {/* legend */}
        <div className="grid grid-cols-[180px_1fr_104px] gap-sm">
          <div />
          <div className="flex flex-wrap items-center gap-md text-xxs text-ink-subdued">
            {LEGEND.map((l) => (
              <span key={l.label} className="flex items-center gap-xs">
                <span
                  className={l.shape === 'dot' ? 'size-2.5 rounded-round' : 'size-2.5 rounded-sm'}
                  style={{ background: l.color }}
                />
                {l.label}
              </span>
            ))}
          </div>
          <div />
        </div>
      </div>

      {/* assessment banner */}
      <div className="mt-md flex items-start gap-sm rounded-md bg-surface-accent px-md py-sm">
        <Lightbulb className="mt-xxs size-5 shrink-0 text-brand" strokeWidth={2} />
        <div className="flex-1">
          <p className="text-sm font-bold text-ink">Take a skills assessment</p>
          <p className="text-xs text-ink-subdued">
            Refine your skills profile and receive a more personalized learning path to reach your goals faster.
          </p>
        </div>
        <button aria-label="Dismiss" className="text-ink-subdued hover:text-ink">
          <X className="size-4" strokeWidth={2} />
        </button>
      </div>
    </section>
  )
}

// ── Learning path ────────────────────────────────────────────────────────────

function ProgressRing({ completed, total }: { completed: number; total: number }) {
  const size = 56
  const stroke = 3
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const p = total ? completed / total : 0
  return (
    <span className="relative flex size-14 shrink-0 items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-gray-200)" strokeWidth={stroke} />
        {p > 0 && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--color-purple-400)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - p)}
          />
        )}
      </svg>
      <span className="text-xs font-medium text-ink tabular-nums">
        {completed}/{total}
      </span>
    </span>
  )
}

function LearningPathSkeleton() {
  return (
    <section className="flex flex-col gap-lg rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">
      <div className="flex items-center gap-sm">
        <span className="size-14 shrink-0 animate-pulse rounded-round bg-surface-midtone" />
        <div className="flex flex-col gap-xxs">
          <div className="h-5 w-32 animate-pulse rounded-sm bg-surface-midtone" />
          <div className="h-3 w-20 animate-pulse rounded-sm bg-surface-midtone" />
        </div>
      </div>
      <div className="flex flex-col gap-sm">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-sm rounded-lg border border-line-subdued p-sm">
            <span className="size-12 shrink-0 animate-pulse rounded-md bg-surface-midtone" />
            <div className="flex flex-1 flex-col gap-xs">
              <div className="h-4 w-3/4 animate-pulse rounded-sm bg-surface-midtone" />
              <div className="h-3 w-1/2 animate-pulse rounded-sm bg-surface-midtone" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function LearningPathCard({ courses }: { courses: PathCourse[] }) {
  const completed = courses.filter((c) => c.progress === 100).length
  return (
    <section className="flex flex-col gap-lg rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">
      <div className="flex items-center gap-sm">
        <ProgressRing completed={completed} total={courses.length} />
        <div className="flex flex-col gap-xxs">
          <h2 className="text-lg font-medium leading-tight text-ink">Learning path</h2>
          <p className="text-sm text-ink-subdued">{courses.length} courses</p>
        </div>
      </div>

      <div className="flex flex-col pl-xs">
        {courses.map((c, i) => {
          const isFirst = i === 0
          const isLast = i === courses.length - 1
          return (
            <div key={c.id} className="flex gap-sm">
              <div className="flex w-[10px] shrink-0 flex-col items-center">
                <span className={cn('w-px flex-1', !isFirst && 'bg-line')} />
                <span className="size-[10px] shrink-0 rounded-round border border-line bg-surface" />
                <span className={cn('w-px flex-1', !isLast && 'bg-line')} />
              </div>
              <div className={cn('flex flex-1 gap-sm rounded-lg border border-line-subdued p-sm', !isLast && 'mb-xs-mid')}>
                <img src={c.image} alt="" className="size-12 shrink-0 rounded-md object-cover" />
                <div className="flex flex-1 flex-col gap-sm">
                  <div className="flex flex-col gap-xxs">
                    <h3 className="text-md font-medium leading-tight text-ink">{c.title}</h3>
                    <p className="truncate text-xs text-ink-subdued">{c.meta}</p>
                  </div>
                  <span className="inline-flex w-fit items-center rounded-sm bg-[var(--color-purple-150)] px-xs py-xxs text-xs font-bold text-ink">
                    {c.tag}
                  </span>
                  <div className="flex items-center gap-[10px]">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-round bg-line-subdued">
                      <div
                        className="h-full rounded-round"
                        style={{
                          width: `${c.progress}%`,
                          background: c.progress === 100 ? 'var(--color-green-300)' : 'var(--color-purple-400)',
                        }}
                      />
                    </div>
                    <span className="text-xs tabular-nums text-ink">{c.progress}%</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ── Public component ─────────────────────────────────────────────────────────

export interface LeftContentProps {
  populated: boolean
  skills: SkillRow[]
  courses: PathCourse[]
}

export function LeftContent({ populated, skills, courses }: LeftContentProps) {
  return (
    <main className="flex-1 overflow-y-auto px-xl py-lg">
      <div className="mx-auto flex max-w-[760px] flex-col gap-lg">
        {populated ? <GoalHeader /> : <GoalHeaderSkeleton />}
        {populated ? <SkillsCard skills={skills} /> : <SkillsCardSkeleton />}
        {populated ? <LearningPathCard courses={courses} /> : <LearningPathSkeleton />}
      </div>
    </main>
  )
}
