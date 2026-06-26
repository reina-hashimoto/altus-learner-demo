import { useState } from 'react'
import {
  PanelLeftClose,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Check,
  Info,
  Flame,
  MonitorPlay,
  FlaskConical,
  ClipboardCheck,
  Lightbulb,
  Loader2,
} from 'lucide-react'
import { cn } from '@/components/ui/utils'
import altusLogo from '@/assets/altus-logo.png'
import { TypingIndicator } from '@/features/goal/altus/TypingIndicator'
import {
  SkillProficiencyForm,
  type ProficiencySelections,
} from '@/features/goal/SkillProficiencyForm'
import type { Skill } from '@/data/goal'
import type { ChipDef } from '@/flows/config'

export interface AdminMessage {
  id: string
  role: 'assistant' | 'user'
  /** Primary line. */
  text: string
  /** Optional secondary paragraph rendered under `text` (lighter). */
  detail?: string
  /** Renders as a green "success" pill instead of a normal message. */
  pill?: boolean
  /** Renders as a spinner "in-progress" pill (Goal confirmed — generating…). */
  spinnerPill?: boolean
}

/** Summary shown in the "Review your goal" card before the path is generated. */
export interface GoalReview {
  role: string
  targetDate: string
  weeklyTime: string
  skills: { name: string; level: string; source: string }[]
}

type AltusView = 'altus' | 'your-week'

interface AdminAltusPanelProps {
  messages: AdminMessage[]
  thinking: boolean
  showProficiencyForm: boolean
  /** Renders the "Review your goal" card after the messages. */
  review?: GoalReview | null
  skills: Skill[]
  proficiency: ProficiencySelections
  chips: ChipDef[]
  onProficiencyChange: (skillId: string, levelIndex: number) => void
  onProficiencySubmit: () => void
  onSend: (text: string) => void
  onChip: (chip: ChipDef['id']) => void
}

/**
 * Admin-flow Altus panel (goal detail, node 1046:45588 + sub-states). Mirrors
 * the shared AltusPanel but adds the "Review your goal" card and the populated
 * "Your week" view from the Figma prototype. Reuses SkillProficiencyForm and
 * TypingIndicator from the shared goal feature.
 */
export function AdminAltusPanel(props: AdminAltusPanelProps) {
  const [view, setView] = useState<AltusView>('altus')
  const [draft, setDraft] = useState('')

  const send = () => {
    const text = draft.trim()
    if (!text) return
    props.onSend(text)
    setDraft('')
  }

  return (
    <div className="flex h-full flex-col bg-surface-pale shadow-[var(--box-shadow-100)]">
      {/* toggle bar */}
      <div className="flex items-center gap-md p-md">
        <button className="text-ink-subdued hover:text-ink" aria-label="Collapse panel">
          <PanelLeftClose className="size-5" strokeWidth={1.75} />
        </button>
        <div className="flex flex-1 rounded-round bg-surface-midtone p-1">
          <ToggleTab active={view === 'altus'} onClick={() => setView('altus')}>
            <img src={altusLogo} alt="" className="size-5 object-contain" /> Altus
          </ToggleTab>
          <ToggleTab active={view === 'your-week'} onClick={() => setView('your-week')}>
            <TrendingUp className="size-4" strokeWidth={2} /> Your week
          </ToggleTab>
        </div>
      </div>

      {/* body */}
      <div className="flex-1 overflow-y-auto px-md pb-md">
        {view === 'your-week' ? (
          <YourWeek />
        ) : (
          <div className="flex flex-col gap-md pt-xs">
            {props.messages.map((m) =>
              m.pill ? (
                <span
                  key={m.id}
                  className="inline-flex w-fit items-center gap-xs rounded-round bg-surface-positive px-sm py-xs text-sm font-medium text-positive"
                >
                  <Check className="size-4" strokeWidth={2.5} />
                  {m.text}
                </span>
              ) : m.spinnerPill ? (
                <span
                  key={m.id}
                  className="mx-auto inline-flex w-fit items-center gap-xs rounded-round bg-surface px-md py-xs text-sm text-ink-subdued shadow-[var(--box-shadow-100)]"
                >
                  <Loader2 className="size-4 animate-spin text-brand" strokeWidth={2} />
                  {m.text}
                </span>
              ) : m.role === 'assistant' ? (
                <div key={m.id} className="flex flex-col gap-xs">
                  <p className="text-sm font-bold leading-relaxed text-ink">{m.text}</p>
                  {m.detail && (
                    <p className="text-sm leading-relaxed text-ink-subdued">{m.detail}</p>
                  )}
                </div>
              ) : (
                <div key={m.id} className="flex justify-end">
                  <span className="max-w-[80%] rounded-lg bg-surface-accent px-sm py-xs text-sm text-ink">
                    {m.text}
                  </span>
                </div>
              ),
            )}

            {props.showProficiencyForm && (
              <SkillProficiencyForm
                skills={props.skills}
                values={props.proficiency}
                onChange={props.onProficiencyChange}
                onSubmit={props.onProficiencySubmit}
              />
            )}

            {props.review && <ReviewGoalCard review={props.review} />}

            {props.thinking && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="flex flex-col gap-xs px-md pb-md">
        <div className="flex items-center gap-xs rounded-round border border-line bg-surface py-1.5 pl-md pr-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Tell me what you want to improve or achieve…"
            className="h-9 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-subdued"
          />
          <button
            onClick={send}
            aria-label="Send"
            className="flex size-9 shrink-0 items-center justify-center rounded-round bg-brand text-on-brand transition-colors hover:bg-brand-strong"
          >
            <ArrowRight className="size-4" strokeWidth={2.25} />
          </button>
        </div>
        {props.chips.length > 0 && (
          <div className="flex flex-wrap gap-xs">
            {props.chips.map((chip) => (
              <Chip key={chip.id} onClick={() => props.onChip(chip.id)}>
                {chip.label}
              </Chip>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ToggleTab({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-xs rounded-round py-1.5 text-sm font-bold transition-colors',
        active ? 'bg-surface text-ink shadow-[var(--box-shadow-100)]' : 'text-ink-subdued hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

function Chip({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-xs rounded-round bg-surface-midtone px-sm py-xs text-xs font-medium text-ink hover:bg-line"
    >
      <Sparkles className="size-3.5 text-brand" strokeWidth={2} />
      {children}
    </button>
  )
}

/** "Review your goal" summary card (node 5655:65160). */
function ReviewGoalCard({ review }: { review: GoalReview }) {
  const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="flex flex-col gap-xxs">
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className="text-sm text-ink-subdued">{value}</span>
    </div>
  )
  return (
    <section className="rounded-lg bg-surface p-md shadow-[var(--box-shadow-100)]">
      <h3 className="text-md font-medium text-ink">Review your goal</h3>
      <div className="mt-md flex flex-col gap-sm rounded-lg border border-line-subdued p-md">
        <Row label="Current role" value={review.role} />
        <Row label="Target date" value={review.targetDate} />
        <Row label="Weekly study time" value={review.weeklyTime} />
        <div className="flex flex-col gap-xs">
          <span className="text-sm font-bold text-ink">Target skills ({review.skills.length})</span>
          {review.skills.map((s) => (
            <div key={s.name} className="flex flex-wrap items-center gap-xs text-xs">
              <span className="inline-flex items-center rounded-sm border border-line px-xs py-0.5 font-medium text-ink">
                {s.name}
              </span>
              <span className="text-ink-subdued">{s.level}</span>
              <span className="text-ink-subdued">·</span>
              <span className="text-ink-subdued">{s.source}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ── "Your week" tab content (node 4530:63062 Panel) ───────────────────────
function YourWeekCard({
  title,
  meta,
  icon,
  children,
}: {
  title: string
  meta?: string
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-md rounded-lg bg-surface p-md shadow-[var(--box-shadow-100)]">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-xs text-md font-medium text-ink">
          {title}
          {icon}
        </span>
        {meta && <span className="text-xs text-ink-subdued">{meta}</span>}
      </div>
      {children}
    </section>
  )
}

function Bullet({ lead, rest }: { lead: string; rest: string }) {
  return (
    <li className="flex gap-xs text-sm text-ink">
      <span className="mt-[7px] size-1 shrink-0 rounded-round bg-ink-subdued" />
      <span>
        <span className="font-medium">{lead}</span>
        {rest}
      </span>
    </li>
  )
}

function YourWeek() {
  return (
    <div className="flex flex-col gap-md pt-xs">
      <YourWeekCard
        title="Weekly streak"
        meta="Feb 22 - Feb 28"
        icon={<Info className="size-4 text-ink-subdued" strokeWidth={1.75} />}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-xs">
            <Flame className="size-7 text-brand" strokeWidth={2} fill="var(--color-purple-100)" />
            <span className="flex flex-col leading-tight">
              <span className="text-sm text-ink">
                <span className="text-lg font-bold">1</span> week
              </span>
              <span className="text-xs text-ink-subdued">Current streak</span>
            </span>
          </div>
          <ul className="flex flex-col gap-xs text-sm text-ink">
            <li className="flex items-center gap-xs">
              <span className="size-2 rounded-round bg-[var(--color-orange-300)]" />
              <span className="font-bold">20</span>
              <span className="-ml-1 text-ink-subdued">/30 min</span>
            </li>
            <li className="flex items-center gap-xs">
              <span className="size-2 rounded-round bg-[var(--color-green-300)]" />
              <span className="font-bold">1</span>
              <span className="-ml-1 text-ink-subdued">/1 visit</span>
            </li>
          </ul>
        </div>
      </YourWeekCard>

      <YourWeekCard
        title="Weekly challenge"
        meta="Feb 22 - Feb 28"
        icon={<Info className="size-4 text-ink-subdued" strokeWidth={1.75} />}
      >
        <div className="flex items-center justify-between gap-sm">
          <p className="flex-1 text-sm text-ink">Complete one activity in each learning type</p>
          <div className="flex items-center gap-sm">
            {[
              { label: 'Learn', Icon: MonitorPlay, active: true },
              { label: 'Practice', Icon: FlaskConical, active: true },
              { label: 'Assess', Icon: ClipboardCheck, active: false },
            ].map(({ label, Icon, active }) => (
              <span key={label} className="flex flex-col items-center gap-xxs">
                <span
                  className={
                    active
                      ? 'flex size-9 items-center justify-center rounded-round bg-[var(--color-green-400)] text-on-brand'
                      : 'flex size-9 items-center justify-center rounded-round border border-line-subdued text-ink-subdued'
                  }
                >
                  <Icon className="size-4" strokeWidth={2} />
                </span>
                <span className={active ? 'text-xs text-positive' : 'text-xs text-ink-subdued'}>
                  {label}
                </span>
              </span>
            ))}
          </div>
        </div>
      </YourWeekCard>

      <YourWeekCard
        title="Company trends"
        icon={<TrendingUp className="size-4 text-ink-subdued" strokeWidth={2} />}
      >
        <ul className="flex flex-col gap-xs">
          <Bullet lead="You're in the top 5%" rest=" of active learners!" />
          <Bullet lead="100+ learners" rest=" improving AI-powered Design Thinking" />
          <Bullet lead="120+ learners" rest=" building Prompt-to-UI skills" />
          <Bullet lead="85+ learners" rest=" exploring AI/ML Foundations" />
        </ul>
      </YourWeekCard>

      <YourWeekCard
        title="Turn learning into growth"
        icon={<Lightbulb className="size-4 text-ink-subdued" strokeWidth={1.75} />}
      >
        <ul className="flex flex-col gap-xs">
          <Bullet lead="Set aside 30 minutes" rest=" on your calendar" />
          <Bullet lead="Reflect on key takeaways" rest=" from this week" />
          <Bullet lead="Schedule a 1:1" rest=" with your manager" />
        </ul>
      </YourWeekCard>
    </div>
  )
}
