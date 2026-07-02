import { useEffect, useRef, useState } from 'react'
import {
  ArrowRight,
  Sparkles,
  Check,
  Loader2,
  Flame,
  TrendingUp,
  Lightbulb,
  Play,
  FlaskConical,
  ClipboardCheck,
} from 'lucide-react'
import { UdemyIcon } from '@/components/icons/UdemyIcon'
import { cn } from '@/components/ui/utils'
import { Button } from '@/components/ui/button'
import altusLogo from '@/assets/altus-logo.png'
import { TypingIndicator } from './TypingIndicator'
import {
  SkillProficiencyForm,
  type ProficiencySelections,
} from '../SkillProficiencyForm'
import type { Skill } from '@/data/goal'
import type { ChipDef } from '@/flows/config'

export interface AltusMessage {
  id: string
  role: 'assistant' | 'user'
  text: string
  /** Renders as a green "success" pill instead of a normal message. */
  pill?: boolean
  /** Renders as a spinner "in-progress" pill (Goal confirmed — generating…). */
  spinnerPill?: boolean
  /** Bullet list of update options shown under the message (personalized done). */
  options?: string[]
  /** User bubble: clamp long text to ~3 lines with a See all / See less toggle. */
  collapsible?: boolean
}

/** Summary shown in the "Review your goal" card before the path is generated. */
export interface GoalReview {
  role: string
  targetDate: string
  weeklyTime: string
  /** Optional — the assigned goal title (Custom flow shows it in the summary). */
  goal?: string
  /** Optional — a focus area the learner chose in chat (Custom flow). */
  focus?: string
  skills: { name: string; level: string; source: string; target?: string }[]
}

export type AltusView = 'altus' | 'your-week'

interface AltusPanelProps {
  messages: AltusMessage[]
  thinking: boolean
  showProficiencyForm: boolean
  /** When non-null, renders the "Review your goal" card after the messages. */
  goalReview?: GoalReview | null
  /** Shows a skeleton loading state inside the review card (e.g. while study time updates). */
  goalReviewLoading?: boolean
  /** Called when the user clicks Confirm in the review card. */
  onConfirm?: () => void
  skills: Skill[]
  proficiency: ProficiencySelections
  chips: ChipDef[]
  onProficiencyChange: (skillId: string, levelIndex: number | null) => void
  onProficiencySubmit: () => void
  onSend: (text: string) => void
  onChip: (chip: ChipDef['id']) => void
  view: AltusView
  onViewChange: (v: AltusView) => void
  onCollapse: () => void
  /** Open the "Level definitions" info modal from the proficiency form. */
  onOpenLevelDefs?: () => void
  /** Skill names driving the role-oriented "Company trends" items in Your week. */
  trendsSkills?: string[]
}

export function AltusPanel(props: AltusPanelProps) {
  const { view, onViewChange: setView, onCollapse } = props
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when messages change.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [props.messages, props.thinking, props.goalReview])

  const send = () => {
    const text = draft.trim()
    if (!text) return
    props.onSend(text)
    setDraft('')
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-surface-pale">
      {/* toggle bar — fixed top */}
      <div className="shrink-0 flex items-center gap-sm px-md py-sm">
        <button className="text-ink-subdued hover:text-ink" aria-label="Collapse panel" onClick={onCollapse}>
          <UdemyIcon name="shrink-panel" size={20} />
        </button>
        <div className="flex flex-1 rounded-round bg-surface-midtone p-1">
          <ToggleTab active={view === 'altus'} onClick={() => setView('altus')}>
            <img src={altusLogo} alt="" className="size-5 object-contain" /> Altus
          </ToggleTab>
          <ToggleTab active={view === 'your-week'} onClick={() => setView('your-week')}>
            <UdemyIcon name="trending-graph" size={16} /> Your week
          </ToggleTab>
        </div>
      </div>

      {/* conversation — scrolls internally, min-h-0 required so flex doesn't override overflow */}
      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-md pb-md">
        {view === 'your-week' ? (
          <YourWeek trendsSkills={props.trendsSkills} />
        ) : (
          <div className="flex flex-col gap-md pt-xs">
            {props.messages.map((m) =>
              m.pill ? (
                <div key={m.id} className="flex justify-center">
                  <span className="inline-flex items-center gap-sm rounded-lg border border-line-subdued bg-gradient-to-r from-surface to-surface-pale px-md py-sm text-xs text-ink-subdued">
                    <span
                      className="flex size-[18px] shrink-0 items-center justify-center rounded-round"
                      style={{ background: 'var(--color-green-300)' }}
                    >
                      <Check className="size-2.5 text-white" strokeWidth={3} />
                    </span>
                    {m.text}
                  </span>
                </div>
              ) : m.spinnerPill ? (
                <div key={m.id} className="flex justify-center">
                  <span className="inline-flex items-center gap-sm rounded-lg border border-line-subdued bg-gradient-to-r from-surface to-surface-pale px-md py-sm text-xs text-ink-subdued">
                    <Loader2 className="size-[18px] shrink-0 animate-spin text-brand" strokeWidth={1.75} />
                    {m.text}
                  </span>
                </div>
              ) : m.role === 'assistant' ? (
                <div key={m.id} className="flex flex-col gap-xs">
                  <p className="text-sm leading-relaxed text-ink">{m.text}</p>
                  {m.options && (
                    <>
                      <p className="text-sm leading-relaxed text-ink">
                        If you need to make any changes, you can update these anytime, so just let me know. You can update the following:
                      </p>
                      <ul className="flex flex-col gap-xxs pl-xs">
                        {m.options.map((o) => (
                          <li key={o} className="flex items-center gap-xs text-sm text-ink">
                            <span className="size-1 rounded-round bg-ink-subdued" />
                            {o}
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              ) : (
                <div key={m.id} className="flex justify-end">
                  {m.collapsible ? (
                    <CollapsibleBubble text={m.text} />
                  ) : (
                    <span className="max-w-[80%] rounded-lg bg-surface-accent px-sm py-xs text-sm text-ink">
                      {m.text}
                    </span>
                  )}
                </div>
              ),
            )}

            {props.showProficiencyForm && (
              <SkillProficiencyForm
                skills={props.skills}
                values={props.proficiency}
                onChange={props.onProficiencyChange}
                onSubmit={props.onProficiencySubmit}
                onOpenLevelDefs={props.onOpenLevelDefs}
              />
            )}

            {props.goalReview && (
              <ReviewGoalCard
                review={props.goalReview}
                loading={props.goalReviewLoading}
                onConfirm={props.onConfirm}
              />
            )}

            {props.thinking && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* composer — fixed bottom */}
      <div className="shrink-0 flex flex-col gap-xs px-md pb-md">
        <div className="flex items-center gap-xs rounded-round border border-line bg-surface px-sm py-1.5">
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

// ── Your week ────────────────────────────────────────────────────────────

const WEEK_RANGE = 'Feb 22 - Feb 28'

/** Dual-arc ring: orange = minutes progress, teal = visit progress. */
function WeekRing() {
  const size = 72
  const stroke = 6
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const gap = 0.04 // small gap between arcs (fraction of circumference)
  const minPct = 20 / 30 // 0.667
  const visitPct = 1 - minPct
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="size-[72px] -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-gray-200)" strokeWidth={stroke} />
      {/* orange minutes arc */}
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
      {/* teal visit arc */}
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

function WeekCard({
  title,
  meta,
  icon,
  children,
}: {
  title: string
  meta?: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg bg-surface p-md">
      <div className="mb-sm flex items-center justify-between gap-sm">
        <h3 className="flex items-center gap-xs text-md font-bold text-ink">
          {title}
          {icon}
        </h3>
        {meta && <span className="shrink-0 text-xs text-ink-subdued">{meta}</span>}
      </div>
      {children}
    </section>
  )
}

function ChallengeType({
  label,
  icon,
  active,
}: {
  label: string
  icon: React.ReactNode
  active: boolean
}) {
  return (
    <div className="flex flex-col items-center gap-xs">
      <span
        className={cn(
          'flex size-12 items-center justify-center rounded-round',
          active ? 'text-white' : 'border border-line text-ink-subdued',
        )}
        style={active ? { background: '#16897B' } : undefined}
      >
        {icon}
      </span>
      <span className={cn('text-xs', active ? 'font-bold text-ink' : 'text-ink-subdued')}>{label}</span>
    </div>
  )
}

/** Bold-lead trend / tip bullet. */
function WeekBullet({ lead, rest }: { lead: string; rest?: string }) {
  return (
    <li className="flex gap-xs text-sm leading-relaxed text-ink">
      <span className="mt-[9px] size-1 shrink-0 rounded-round bg-ink-subdued" />
      <span>
        <span className="font-bold">{lead}</span>
        {rest ? ` ${rest}` : ''}
      </span>
    </li>
  )
}

function YourWeek({ trendsSkills }: { trendsSkills?: string[] }) {
  // Role-oriented trend items — fall back to design defaults when no skills given.
  const skills =
    trendsSkills && trendsSkills.length >= 3
      ? trendsSkills
      : ['AI-powered Design Thinking', 'Prompt-to-UI skills', 'AI/ML Foundations']
  const trends: { lead: string; rest: string }[] = [
    { lead: "You're in the top 5%", rest: 'of active learners!' },
    { lead: '100+ learners', rest: `improving ${skills[0]}` },
    { lead: '120+ learners', rest: `building ${skills[1]}` },
    { lead: '85+ learners', rest: `exploring ${skills[2]}` },
  ]

  return (
    <div className="flex flex-col gap-md pt-xs">
      {/* Weekly streak */}
      <WeekCard title="Weekly streak" meta={WEEK_RANGE} icon={<HelpDot />}>
        <div className="flex items-center justify-between gap-md">
          <div className="flex items-center gap-sm">
            <Flame className="size-8 shrink-0 text-brand" strokeWidth={1.75} />
            <span className="flex flex-col leading-tight">
              <span className="text-lg font-bold text-ink">
                1 <span className="text-sm font-normal">week</span>
              </span>
              <span className="text-xs text-ink-subdued">Current streak</span>
            </span>
          </div>
          <div className="flex items-center gap-sm">
            <WeekRing />
            <span className="flex flex-col gap-xs text-sm">
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

      {/* Weekly challenge */}
      <WeekCard title="Weekly challenge" meta={WEEK_RANGE} icon={<HelpDot />}>
        <div className="flex items-center justify-between gap-md">
          <p className="max-w-[150px] text-sm text-ink-subdued">Complete one activity in each learning type</p>
          <div className="flex gap-sm">
            <ChallengeType label="Learn" active icon={<Play className="size-5 fill-current" strokeWidth={0} />} />
            <ChallengeType label="Practice" active icon={<FlaskConical className="size-5" strokeWidth={1.75} />} />
            <ChallengeType label="Assess" active={false} icon={<ClipboardCheck className="size-5" strokeWidth={1.75} />} />
          </div>
        </div>
      </WeekCard>

      {/* Company trends */}
      <WeekCard title="Company trends" icon={<TrendingUp className="size-4 text-ink-subdued" strokeWidth={2} />}>
        <ul className="flex flex-col gap-xs">
          {trends.map((t) => (
            <WeekBullet key={t.lead + t.rest} lead={t.lead} rest={t.rest} />
          ))}
        </ul>
      </WeekCard>

      {/* Turn learning into growth */}
      <WeekCard title="Turn learning into growth" icon={<Lightbulb className="size-4 text-ink-subdued" strokeWidth={1.75} />}>
        <ul className="flex flex-col gap-xs">
          <WeekBullet lead="Set aside 30 minutes" rest="on your calendar" />
          <WeekBullet lead="Reflect on key takeaways" rest="from this week" />
          <WeekBullet lead="Schedule a 1:1" rest="with your manager" />
        </ul>
      </WeekCard>
    </div>
  )
}

/** Tiny circled "i"/"?" affordance used in Your week card headers. */
function HelpDot() {
  return (
    <span className="flex size-3.5 items-center justify-center rounded-round border border-line-subdued text-[9px] font-bold leading-none text-ink-subdued">
      i
    </span>
  )
}

/** "Review your goal" summary card — Figma: PreviewYourGoal component. */
function ReviewGoalCard({
  review,
  loading,
  onConfirm,
}: {
  review: GoalReview
  loading?: boolean
  onConfirm?: () => void
}) {
  const showTarget = review.skills.some((s) => s.target)
  return (
    <section className="overflow-hidden rounded-lg border border-line-subdued bg-surface">
      {/* Header */}
      <div className="border-b border-line-subdued bg-surface px-md pb-[13px] pt-md">
        <h3 className="text-lg font-medium text-ink">Review your goal</h3>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-lg p-md">
        {/* Details inner card */}
        <div className="flex flex-col gap-xs rounded-md border border-line-subdued bg-surface-pale p-sm">
          {loading ? (
            // Skeleton while card is reloading (e.g. after study time update)
            <div className="flex flex-col gap-sm py-xs" aria-hidden>
              {[75, 45, 60, 35, 55].map((w, i) => (
                <div key={i} className="skeleton h-3 rounded-round" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <>
              {review.goal && <FieldRow label="Goal" value={review.goal} />}
              <FieldRow label="Current role" value={review.role} />
              {review.focus && <FieldRow label="Focus area" value={review.focus} />}
              <FieldRow label="Target date" value={review.targetDate} />
              <FieldRow label="Weekly study time" value={review.weeklyTime} />
              {/* Target skills — table for clear, aligned scanning */}
              <div className="flex flex-col gap-xs">
                <p className="text-sm font-medium text-ink">
                  Target skills ({review.skills.length})
                </p>
                <div className="overflow-hidden rounded-md border border-line-subdued bg-surface">
                  <table className="w-full table-fixed border-collapse text-xs">
                    <thead>
                      <tr className="bg-surface-pale text-left">
                        <th className="px-xs py-xs font-medium text-ink-subdued">Skill</th>
                        <th className="px-xs py-xs font-medium text-ink-subdued">Current</th>
                        {showTarget && <th className="px-xs py-xs font-medium text-ink-subdued">Target</th>}
                        <th className="px-xs py-xs font-medium text-ink-subdued">Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {review.skills.map((s) => (
                        <tr key={s.name} className="border-t border-line-subdued align-top">
                          <td className="px-xs py-xs font-medium leading-tight text-ink">{s.name}</td>
                          <td className="px-xs py-xs leading-tight text-ink-subdued">{s.level}</td>
                          {showTarget && <td className="px-xs py-xs leading-tight text-ink-subdued">{s.target ?? '—'}</td>}
                          <td className="px-xs py-xs leading-tight text-ink-subdued">{s.source}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Confirm button — right-aligned, hidden while loading */}
        {!loading && onConfirm && (
          <div className="flex justify-end pt-xs-mid">
            <Button udStyle="secondary" size="large" onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}

function FieldRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-xs">
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="text-xs text-ink-subdued">{value}</p>
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
        active ? 'bg-surface text-ink shadow-sm' : 'text-ink-subdued hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}

/** User bubble that clamps long input to ~3 lines with a See all / See less toggle. */
function CollapsibleBubble({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false)
  // Long enough to be worth collapsing? ~3 lines ≈ 150 chars, or explicit newlines.
  const isLong = text.length > 150 || text.split('\n').length > 3
  return (
    <span className="flex max-w-[85%] flex-col items-end gap-xxs rounded-lg bg-surface-accent px-sm py-xs text-sm text-ink">
      <span className={cn('whitespace-pre-wrap', !expanded && isLong && 'line-clamp-3')}>{text}</span>
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs font-bold text-brand hover:underline"
        >
          {expanded ? 'See less' : 'See all'}
        </button>
      )}
    </span>
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
