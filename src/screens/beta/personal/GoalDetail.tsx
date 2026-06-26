import { Flag, Lightbulb, FolderClosed, AlarmClock, CalendarDays, HelpCircle, Lightbulb as Bulb, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui/utils'
import { PersonalHeader } from './shell'
import { AltusPanel, type PanelView } from './RightPanel'
import coursePrompt from '@/assets/course-prompt-engineering.png'
import courseHallucination from '@/assets/course-hallucination.png'
import courseResponsible from '@/assets/course-responsible-ai.jpg'

const RAIL_ICONS = [Flag, Lightbulb, FolderClosed, AlarmClock]

function GoalLeftRail() {
  return (
    <aside className="flex w-[60px] shrink-0 flex-col items-center gap-md border-r border-line-subdued bg-surface py-md">
      {RAIL_ICONS.map((Icon, i) => (
        <button
          key={i}
          className="flex size-9 items-center justify-center rounded-md text-ink-subdued hover:bg-surface-pale hover:text-ink"
        >
          <Icon className="size-5" strokeWidth={1.75} />
        </button>
      ))}
    </aside>
  )
}

const SCALE_MAX = 200
const TICKS = [0, 50, 100, 150, 200]
const BANDS = ['Foundational', 'Intermediate', 'Established', 'Advanced']
const pct = (v: number) => `${(v / SCALE_MAX) * 100}%`

interface SkillRow {
  id: string
  name: string
  estimated: number
  selfReported: number
  verified: number
  target: number
}

const SKILLS: SkillRow[] = [
  { id: 'finops', name: 'FinOps & Cost Optimization', estimated: 70, selfReported: 95, verified: 120, target: 150 },
  { id: 'k8s', name: 'Kubernetes Autoscaling', estimated: 50, selfReported: 80, verified: 60, target: 140 },
  { id: 'obs', name: 'Observability & Monitoring', estimated: 60, selfReported: 70, verified: 0, target: 130 },
]

const LEGEND = [
  { label: 'Estimated', color: 'var(--color-orange-150)', shape: 'bar' as const },
  { label: 'Self-reported', color: 'var(--color-purple-150)', shape: 'bar' as const },
  { label: 'Udemy Verified', color: 'var(--color-purple-400)', shape: 'bar' as const },
  { label: 'Target proficiency', color: 'var(--color-purple-400)', shape: 'dot' as const },
]

function SkillsCard() {
  return (
    <section className="rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">
      <div className="mb-md flex items-center justify-between">
        <h2 className="flex items-center gap-xs text-lg font-medium text-ink">
          Skills to develop
          <HelpCircle className="size-4 text-ink-subdued" strokeWidth={1.75} />
        </h2>
        <span className="text-xs font-medium text-ink-subdued">Sr. Product Designer</span>
      </div>

      <div className="flex flex-col gap-xs-mid">
        {/* axis */}
        <div className="grid grid-cols-[180px_1fr_104px] items-end gap-sm">
          <div />
          <div className="relative h-5 text-xxs text-ink-subdued">
            {TICKS.map((t) => (
              <span key={t} className="absolute top-0 -translate-x-1/2 tabular-nums" style={{ left: pct(t) }}>
                {t}
              </span>
            ))}
            {BANDS.map((b, i) => (
              <span key={b} className="absolute bottom-0 -translate-x-1/2" style={{ left: pct(25 + i * 50) }}>
                {b}
              </span>
            ))}
          </div>
          <div />
        </div>

        {/* rows */}
        {SKILLS.map((s) => (
          <div key={s.id} className="grid grid-cols-[180px_1fr_104px] items-center gap-sm">
            <div className="text-right text-xs font-bold leading-tight text-ink">{s.name}</div>
            <div className="relative h-9">
              {TICKS.map((t) => (
                <span key={t} className="absolute top-0 bottom-0 w-px bg-line-subdued" style={{ left: pct(t) }} />
              ))}
              {/* estimated (back) */}
              <div className="absolute top-1/2 left-0 h-2.5 -translate-y-1/2 rounded-sm" style={{ width: pct(s.estimated), background: 'var(--color-orange-150)' }} />
              {/* self reported (mid) */}
              <div className="absolute top-1/2 left-0 h-2.5 -translate-y-1/2 rounded-sm" style={{ width: pct(s.selfReported), background: 'var(--color-purple-150)' }} />
              {/* verified (front) */}
              {s.verified > 0 && (
                <div className="absolute top-1/2 left-0 h-2.5 -translate-y-1/2 rounded-sm" style={{ width: pct(s.verified), background: 'var(--color-purple-400)' }} />
              )}
              {/* target dot */}
              <span className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-round bg-brand" style={{ left: pct(s.target) }} />
            </div>
            <div className="flex justify-end">
              <Button udStyle="secondary" size="xsmall">Assess</Button>
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
        <Bulb className="mt-xxs size-5 shrink-0 text-brand" strokeWidth={2} />
        <div className="flex-1">
          <p className="text-sm font-bold text-ink">Take Udemy’s assessment</p>
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

interface PathCourse {
  id: string
  title: string
  meta: string
  tag: string
  progress: number
  image: string
}

const COURSES: PathCourse[] = [
  { id: 'k8s-hands-on', title: 'Kubernetes Hands-On - Deploy Microservices to the AWS Cloud', meta: 'Course · 10 lectures · 56min', tag: 'Observability & Monitoring', progress: 100, image: coursePrompt },
  { id: 'cloud-native', title: 'Cloud-Native: Microservices, Kubernetes, Service Mesh, CI/CD', meta: 'Course · 12 lectures · 134min', tag: 'Kubernetes Autoscaling', progress: 0, image: courseHallucination },
  { id: 'assess-k8s', title: 'Assessment: Implement Kubernetes Autoscaling', meta: 'Course · 21 lectures · 73min', tag: 'Kubernetes Autoscaling', progress: 0, image: courseResponsible },
]

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
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-purple-400)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - p)} />
        )}
      </svg>
      <span className="text-xs font-medium text-ink tabular-nums">{completed}/{total}</span>
    </span>
  )
}

function LearningPathCard() {
  return (
    <section className="flex flex-col gap-lg rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">
      <div className="flex items-center gap-sm">
        <ProgressRing completed={1} total={COURSES.length} />
        <div className="flex flex-col gap-xxs">
          <h2 className="text-lg font-medium leading-tight text-ink">Learning path</h2>
          <p className="text-sm text-ink-subdued">{COURSES.length} courses</p>
        </div>
      </div>

      <div className="flex flex-col pl-xs">
        {COURSES.map((c, i) => {
          const isFirst = i === 0
          const isLast = i === COURSES.length - 1
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
                    <div className="h-1.5 flex-1 overflow-hidden rounded-round bg-ink/20">
                      <div className="h-full rounded-round bg-ink" style={{ width: `${c.progress}%` }} />
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

/**
 * Screens 3 & 4 — the personal goal detail page. The right panel switches
 * between the active Altus assistant (screen 3) and the disabled / locked
 * state (screen 4) via the `panelDisabled` prop.
 */
export function GoalDetail({ panelDisabled }: { panelDisabled: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PersonalHeader />
      <div className="flex flex-1">
        <GoalLeftRail />

        <div className="flex flex-1 bg-surface-pale">
          {/* main column */}
          <main className="flex-1 overflow-y-auto px-xl py-lg">
            <div className="mx-auto flex max-w-[860px] flex-col gap-lg">
              {/* header */}
              <div className="flex flex-col gap-xs">
                <span className="inline-flex w-fit items-center gap-xs rounded-sm bg-surface-positive px-xs py-0.5 text-xs font-bold text-positive">
                  <Flag className="size-3.5" strokeWidth={2} />
                  Organization goal
                </span>
                <h1 className="text-xxl font-medium leading-tight text-ink">Upskill to improve AWS Cost Efficiency</h1>
                <div className="mt-xxs flex items-center gap-md text-sm text-ink-subdued">
                  <span className="flex items-center gap-xs">
                    <CalendarDays className="size-4" strokeWidth={1.75} />
                    <span className="font-bold text-ink">32 more days</span>
                    <span>By Mar 30, 2026</span>
                  </span>
                </div>
              </div>

              <SkillsCard />
              <LearningPathCard />
            </div>
          </main>

          {/* right panel */}
          <AltusPanel disabled={panelDisabled} initialView={'altus' as PanelView} />
        </div>
      </div>
    </div>
  )
}
