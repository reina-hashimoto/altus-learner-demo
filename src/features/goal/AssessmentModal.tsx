import { useEffect, useState } from 'react'
import { X, Play, Info, Flag, Check, RotateCw, HelpCircle, Clock, RefreshCw, Lightbulb, ChevronRight } from 'lucide-react'
import type { Skill } from '@/data/goal'
import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui/utils'
import { UdemyIcon } from '@/components/icons/UdemyIcon'

/** Dark green used across the assessment + verified skill bar (target reached & confirmed). */
export const VERIFIED_GREEN = '#0e8a5f'

// ── Skill-adapted sample content ────────────────────────────────────────────
interface AssessmentContent {
  description: string
  role: string
  target: string
  tools: string
  domains: string[]
  question: { text: string; options: string[]; correct: number }
  reviewExplanation: string
}

function buildAssessment(name: string): AssessmentContent {
  const lower = name.toLowerCase()
  return {
    description: `This assessment evaluates your understanding of ${lower}. You'll demonstrate practical knowledge and apply the core concepts to realistic, on-the-job scenarios.`,
    role: 'Product Managers, Team Leads, and practitioners applying AI day-to-day',
    target: 'Established — confident, real-world application with limited guidance',
    tools: 'Generative AI, prompt & evaluation frameworks, analytics tooling',
    domains: [
      'Core concepts & terminology',
      'Practical application',
      'Common pitfalls & risks',
      'Evaluation & iteration',
      'Tools & workflows',
      'Real-world scenarios',
      'Best practices',
      'Measuring impact',
    ],
    question: {
      text: `Which approach best demonstrates strong ${lower} in a real project?`,
      options: [
        `Applying ${lower} only when explicitly asked, without a repeatable process`,
        `Establishing a clear, repeatable workflow and validating outcomes against measurable goals`,
        `Relying on default settings and shipping the first result without review`,
        `Avoiding ${lower} until a specialist is available to own it`,
      ],
      correct: 1,
    },
    reviewExplanation: `A repeatable, goal-driven workflow with validation is the hallmark of established ${lower}. It balances speed with quality and makes results reproducible across the team.`,
  }
}

const ACHIEVED_INDEX = 2 // Established — the result always lands on target
const SCORE = 148
const PREV_SCORE = 61

// Per-level faceted hexagon badges (Figma result: green / orange / gold / grey).
const BADGES = [
  { name: 'Foundational', range: '0-49', dark: '#37a97f', base: '#4fc79b', light: '#9fe6c8' },
  { name: 'Intermediate', range: '50-99', dark: '#cf7c3f', base: '#e8975a', light: '#f6c39b' },
  { name: 'Established', range: '100-149', dark: '#d9a800', base: '#f2c200', light: '#ffe680' },
  { name: 'Advanced', range: '150-200', dark: '#a9a9b8', base: '#c7c7d1', light: '#e6e6ee' },
] as const

/** Goal summary shown in the "plan refined" banner on the result page. */
export interface AssessmentGoal {
  title: string
  deadline: string
  skills: string[]
  isOrg: boolean
  completed: number
  total: number
}

// ── Modal shell ───────────────────────────────────────────────────────────
type Step = 'intro' | 'question' | 'result'

interface AssessmentModalProps {
  skill: Skill
  goal: AssessmentGoal
  /** Close without completing (X on intro, Save & exit). */
  onClose: () => void
  /** Assessment completed — apply verification and return to the dashboard. */
  onComplete: () => void
}

export function AssessmentModal({ skill, goal, onClose, onComplete }: AssessmentModalProps) {
  const [step, setStep] = useState<Step>('intro')
  const [selected, setSelected] = useState<number | null>(null)
  const content = buildAssessment(skill.name)

  // Esc closes intro/result (matches the X); on the question it exits without completing.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      step === 'result' ? onComplete() : onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, onClose, onComplete])

  return (
    <div className="fixed inset-0 z-[200] overflow-y-auto bg-surface animate-altus-fadein">
      {step === 'intro' && <IntroPage skill={skill} content={content} onClose={onClose} onStart={() => setStep('question')} />}
      {step === 'question' && (
        <QuestionPage
          skill={skill}
          content={content}
          selected={selected}
          onSelect={setSelected}
          onExit={onClose}
          onSubmit={() => setStep('result')}
        />
      )}
      {step === 'result' && <ResultPage skill={skill} goal={goal} content={content} onClose={onComplete} onBackToGoal={onComplete} onRetake={() => { setSelected(null); setStep('intro') }} />}
    </div>
  )
}

// ── Shared breadcrumb ─────────────────────────────────────────────────────
function Breadcrumb({ skillName }: { skillName: string }) {
  return (
    <div className="flex items-center gap-sm text-sm">
      <UdemyIcon name="sparkles" size={20} />
      <span className="font-bold text-brand">Assessments</span>
      <span className="text-ink-subdued">/</span>
      <span className="font-medium text-ink">{skillName}</span>
      <span className="rounded-sm bg-surface-midtone px-xs py-0.5 text-xs font-bold text-ink-subdued">Beta</span>
    </div>
  )
}

// ── Intro ─────────────────────────────────────────────────────────────────
function IntroPage({ skill, content, onClose, onStart }: { skill: Skill; content: AssessmentContent; onClose: () => void; onStart: () => void }) {
  return (
    <div className="min-h-full">
      <header className="flex items-center justify-between border-b border-line-subdued px-lg py-md">
        <Breadcrumb skillName={skill.name} />
        <button onClick={onClose} aria-label="Close assessment" className="flex size-8 items-center justify-center rounded-md text-ink-subdued transition-colors hover:bg-surface-pale hover:text-ink">
          <X className="size-5" strokeWidth={2} />
        </button>
      </header>

      <div className="mx-auto max-w-[800px] px-lg py-xl">
        <h1 className="text-xxl font-bold text-ink">{skill.name}</h1>
        <p className="mt-sm text-md leading-relaxed text-ink-subdued">{content.description}</p>
        <div className="mt-md flex flex-col gap-xs text-sm text-ink-subdued">
          <p><span className="font-bold text-ink">Role:</span> {content.role}</p>
          <p><span className="font-bold text-ink">Target Proficiency:</span> {content.target}</p>
          <p><span className="font-bold text-ink">Tools:</span> {content.tools}</p>
        </div>

        <div className="mt-lg flex items-center gap-md">
          <Button udStyle="primary" size="large" onClick={onStart}>
            <Play className="size-4 fill-current" strokeWidth={0} /> Start assessment
          </Button>
          <button className="flex items-center gap-xs text-sm font-bold text-brand hover:underline">
            <Info className="size-4" strokeWidth={2} /> How assessments work
          </button>
        </div>

        <section className="mt-xl rounded-lg bg-surface-pale p-lg">
          <div className="grid grid-cols-3 gap-md border-b border-line-subdued pb-md">
            <Stat icon={<HelpCircle className="size-4" strokeWidth={1.75} />} label="Questions" value="30 questions" />
            <Stat icon={<Clock className="size-4" strokeWidth={1.75} />} label="Duration" value="30 mins" />
            <Stat icon={<RefreshCw className="size-4" strokeWidth={1.75} />} label="Attempts remaining" value="2 attempts" />
          </div>
          <h3 className="mt-md text-sm font-bold text-ink">Domains covered</h3>
          <div className="mt-sm grid grid-cols-2 gap-x-lg gap-y-sm">
            {content.domains.map((d) => (
              <span key={d} className="flex items-center gap-sm text-sm text-ink">
                <Check className="size-4 shrink-0 text-brand" strokeWidth={2.5} /> {d}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-xxs">
      <span className="flex items-center gap-xs text-xs text-ink-subdued">{icon} {label}</span>
      <span className="text-md font-bold text-ink">{value}</span>
    </div>
  )
}

// ── Question ────────────────────────────────────────────────────────────────
function QuestionPage({
  skill,
  content,
  selected,
  onSelect,
  onExit,
  onSubmit,
}: {
  skill: Skill
  content: AssessmentContent
  selected: number | null
  onSelect: (i: number) => void
  onExit: () => void
  onSubmit: () => void
}) {
  return (
    <div className="min-h-full">
      <header className="flex items-center justify-between border-b border-line-subdued px-lg py-md">
        <div className="flex items-center gap-sm text-sm">
          <UdemyIcon name="sparkles" size={20} />
          <span className="font-medium text-ink">{skill.name}</span>
          <span className="rounded-sm bg-surface-midtone px-xs py-0.5 text-xs font-bold text-ink-subdued">Beta</span>
        </div>
        <div className="flex items-center gap-md">
          <button className="flex items-center gap-xs text-sm font-bold text-brand hover:underline">
            <Flag className="size-4" strokeWidth={2} /> Share feedback
          </button>
          <Button udStyle="secondary" size="small" onClick={onExit}>Save and exit</Button>
        </div>
      </header>

      <div className="mx-auto max-w-[800px] px-lg py-xl">
        <div className="flex items-center gap-sm">
          <div className="h-1.5 flex-1 overflow-hidden rounded-round bg-line-subdued">
            <div className="h-full rounded-round bg-brand" style={{ width: '92%' }} />
          </div>
          <span className="text-xs text-ink-subdued tabular-nums">1 / 1</span>
        </div>

        <p className="mt-lg text-sm font-bold text-ink">Question 1</p>
        <h2 className="mt-xs text-xl leading-snug text-ink">{content.question.text}</h2>

        <div className="mt-md flex flex-col gap-sm">
          {content.question.options.map((opt, i) => {
            const active = selected === i
            return (
              <button
                key={i}
                onClick={() => onSelect(i)}
                className={cn(
                  'flex items-center gap-sm rounded-lg border bg-surface px-md py-sm text-left text-sm text-ink transition-colors',
                  active ? 'border-brand ring-1 ring-brand' : 'border-line hover:border-line-strong hover:bg-surface-pale',
                )}
              >
                <span className={cn('flex size-5 shrink-0 items-center justify-center rounded-round border', active ? 'border-brand' : 'border-line-strong')}>
                  {active && <span className="size-2.5 rounded-round bg-brand" />}
                </span>
                {opt}
              </button>
            )
          })}
        </div>

        <div className="mt-lg flex items-center gap-lg">
          <button onClick={onSubmit} className="text-sm font-bold text-brand hover:underline">Skip</button>
          <Button udStyle="primary" size="large" className="flex-1" onClick={onSubmit} disabled={selected === null}>
            Submit answer
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Result ──────────────────────────────────────────────────────────────────
/** Pointy-top hexagon points for circumradius R about (26,30) in a 52×60 box. */
function hexPoints(R: number): string {
  const cx = 26
  const cy = 30
  return [-90, -30, 30, 90, 150, 210]
    .map((deg) => {
      const a = (deg * Math.PI) / 180
      return `${(cx + R * Math.cos(a)).toFixed(1)},${(cy + R * Math.sin(a)).toFixed(1)}`
    })
    .join(' ')
}

/** Faceted hexagon "gem" badge — nested rim / base / table like the Figma result. */
function GemBadge({ dark, base, light, achieved }: { dark: string; base: string; light: string; achieved?: boolean }) {
  const w = achieved ? 60 : 44
  return (
    <svg
      viewBox="0 0 52 60"
      width={w}
      height={(w * 60) / 52}
      className="block"
      style={achieved ? { filter: `drop-shadow(0 0 8px ${base}aa)` } : undefined}
    >
      <polygon points={hexPoints(29)} fill={dark} />
      <polygon points={hexPoints(23)} fill={base} />
      <polygon points={hexPoints(13.5)} fill={light} />
    </svg>
  )
}

/** Small progress ring for the refined-plan goal card. */
function MiniRing({ completed, total }: { completed: number; total: number }) {
  const size = 44
  const stroke = 3
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const pct = total ? completed / total : 0
  return (
    <span className="relative flex size-11 shrink-0 items-center justify-center">
      <svg viewBox={`0 0 ${size} ${size}`} className="absolute inset-0 -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-gray-200)" strokeWidth={stroke} />
        {pct > 0 && (
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-purple-400)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} />
        )}
      </svg>
      <span className="text-xs font-medium text-ink tabular-nums">{completed}/{total}</span>
    </span>
  )
}

function ResultPage({
  skill,
  goal,
  content,
  onClose,
  onBackToGoal,
  onRetake,
}: {
  skill: Skill
  goal: AssessmentGoal
  content: AssessmentContent
  onClose: () => void
  onBackToGoal: () => void
  onRetake: () => void
}) {
  return (
    <div className="min-h-full">
      <header className="flex items-center justify-between border-b border-line-subdued px-lg py-md">
        <Breadcrumb skillName={skill.name} />
        <div className="flex items-center gap-md">
          <button onClick={onRetake} className="flex items-center gap-xs text-sm font-bold text-brand hover:underline">
            <RotateCw className="size-4" strokeWidth={2} /> Retake
          </button>
          <button onClick={onClose} aria-label="Close assessment" className="flex size-8 items-center justify-center rounded-md text-ink-subdued transition-colors hover:bg-surface-pale hover:text-ink">
            <X className="size-5" strokeWidth={2} />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[860px] px-lg py-xl">
        <h1 className="text-xxl font-bold text-ink">{skill.name}</h1>

        {/* Score card */}
        <section className="mt-lg rounded-lg border border-line-subdued bg-surface p-lg">
          <div className="flex flex-wrap items-start justify-between gap-xl">
            {/* Left: score */}
            <div className="w-[240px] shrink-0">
              <span className="flex items-center gap-xs text-sm font-medium text-ink-subdued">
                Your score <Info className="size-3.5" strokeWidth={1.75} />
              </span>
              <p className="text-[64px] font-bold leading-none text-ink">{SCORE}</p>
              <p className="mt-sm flex items-start gap-xs rounded-md bg-surface-accent px-sm py-xs text-xs text-ink">
                <Lightbulb className="mt-0.5 size-3.5 shrink-0 text-brand" strokeWidth={1.75} />
                <span>You scored better than <span className="font-bold">2%</span> of assessed learners</span>
              </p>
            </div>

            {/* Right: hexagon badges + previous/current markers */}
            <div className="min-w-[380px] flex-1">
              <div className="flex justify-between">
                {BADGES.map((b, i) => (
                  <div key={b.name} className="flex flex-col items-center gap-xs text-center">
                    <div className="flex h-[62px] items-center justify-center">
                      <GemBadge dark={b.dark} base={b.base} light={b.light} achieved={i === ACHIEVED_INDEX} />
                    </div>
                    <span className={cn('text-sm', i === ACHIEVED_INDEX ? 'font-bold text-ink' : 'text-ink-subdued')}>{b.name}</span>
                    <span className="text-xs text-ink-subdued">{b.range}</span>
                  </div>
                ))}
              </div>
              {/* markers line */}
              <div className="relative mt-md h-px bg-line">
                <Marker pct={(PREV_SCORE / 200) * 100} label={`Previous ${PREV_SCORE}`} tone="muted" />
                <Marker pct={(SCORE / 200) * 100} label={`Current ${SCORE}`} tone="dark" />
              </div>
            </div>
          </div>
        </section>

        {/* Plan refined banner — lavender band with the goal card + Back to goal */}
        <section className="mt-md rounded-lg p-lg" style={{ background: 'var(--color-purple-100, #efedfb)' }}>
          <p className="text-md font-bold text-ink">Your plan has been refined</p>
          <p className="mt-xxs text-sm text-ink-subdued">Learning path and skills profile now better reflect your current level.</p>

          <div className="mt-md flex items-center gap-md rounded-lg bg-surface p-md">
            {/* ring is top-aligned with the title (Figma), so align this group to the start */}
            <div className="flex flex-1 items-start gap-md">
              <MiniRing completed={goal.completed} total={goal.total} />
              <div className="flex flex-col gap-xs">
                <div>
                  <h3 className="text-md font-bold leading-snug text-ink">{goal.title}</h3>
                  <p className="text-xs text-ink-subdued">{goal.deadline}</p>
                </div>
                <div className="flex flex-wrap items-center gap-xs">
                  <span
                    className={cn(
                      'rounded-sm px-xs py-xxs text-xs font-bold',
                      goal.isOrg ? 'bg-surface-positive text-positive' : 'text-ink',
                    )}
                    style={goal.isOrg ? undefined : { background: 'var(--color-orange-150)' }}
                  >
                    {goal.isOrg ? 'Organization goal' : 'Personal goal'}
                  </span>
                  {goal.skills.map((s) => (
                    <span key={s} className="rounded-sm border border-line px-xs py-xxs text-xs text-ink-subdued">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <Button udStyle="primary" size="medium" className="shrink-0" onClick={onBackToGoal}>
              Back to goal <ChevronRight className="size-4" strokeWidth={2.5} />
            </Button>
          </div>
        </section>

        {/* Review the answers (sample) */}
        <section className="mt-xl">
          <h2 className="text-lg font-bold text-ink">Review the answers</h2>
          <p className="mt-xxs text-sm text-ink-subdued">Compare your answer with the correct solution and review the recommended focus areas.</p>
          <div className="mt-md rounded-lg border border-line-subdued p-md">
            <div className="flex items-center gap-sm">
              <span className="text-sm font-bold text-ink">Question 1</span>
              <span className="flex items-center gap-xxs rounded-sm px-xs py-0.5 text-xs font-bold text-white" style={{ background: VERIFIED_GREEN }}>
                <Check className="size-3" strokeWidth={3} /> Correct
              </span>
            </div>
            <p className="mt-sm text-sm text-ink">{content.question.text}</p>
            <div className="mt-sm flex items-start gap-sm rounded-md bg-surface-pale p-sm">
              <Check className="mt-0.5 size-4 shrink-0" strokeWidth={2.5} style={{ color: VERIFIED_GREEN }} />
              <div>
                <p className="text-sm font-medium text-ink">{content.question.options[content.question.correct]}</p>
                <p className="mt-xxs text-xs text-ink-subdued">{content.reviewExplanation}</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

/** A dot + label marker; the dot sits centred on the line, the label hangs below. */
function Marker({ pct, label, tone }: { pct: number; label: string; tone: 'muted' | 'dark' }) {
  return (
    <span className="absolute top-0 -translate-x-1/2" style={{ left: `${pct}%` }}>
      {/* dot: centred vertically on the line */}
      <span className={cn('block size-3 -translate-y-1/2 rounded-round', tone === 'dark' ? 'bg-ink ring-4 ring-surface' : 'bg-ink-subdued/50')} />
      {/* label: absolutely positioned below the line so it doesn't shift the dot */}
      <span className={cn('absolute left-1/2 top-2.5 -translate-x-1/2 whitespace-nowrap text-center text-xs', tone === 'dark' ? 'font-bold text-ink' : 'text-ink-subdued')}>{label}</span>
    </span>
  )
}
