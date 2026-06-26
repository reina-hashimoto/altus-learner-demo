/**
 * Right-hand Altus panel for the Goal Detail screen. Renders the conversation
 * (assistant copy, user bubbles, embedded proficiency/review/courseRecs cards,
 * and the "Altus is thinking" indicator) and a free-typing composer that calls
 * `brain.send(text)` via the `onSend` prop.
 */
import { useRef, useEffect } from 'react'
import { PanelLeft, ArrowUp, TrendingUp } from 'lucide-react'
import { cn } from '@/components/ui/utils'
import altusLogo from '@/assets/altus-logo.png'
import {
  TypingIndicator,
  AssistantCopy,
  SkillProficiencyCard,
  ReviewGoalCard,
  CourseRecCards,
  REVIEW,
  type GoalReview,
  type ProficiencySelections,
} from './embeds'
import type { AltusComponent } from './altusBrain'

export type PanelView = 'altus' | 'your-week'

export interface ChatItem {
  id: string
  role: 'assistant' | 'user'
  /** Assistant text (supports newlines / numbered lists / **bold**). */
  text?: string
  /** Embedded interactive component to render after the text. */
  component?: AltusComponent
}

interface AltusPanelProps {
  items: ChatItem[]
  thinking: boolean
  /** Composer submit — free typing. */
  onSend: (text: string) => void
  // proficiency card wiring
  proficiency: ProficiencySelections
  proficiencyDone: boolean
  onProficiencyChange: (skillId: string, level: number) => void
  onProficiencySave: () => void
  // review card wiring
  reviewDone: boolean
  onConfirm: () => void
  // course recs are display-only (selection happens by typing the number)
}

function ViewToggle({ view, setView }: { view: PanelView; setView: (v: PanelView) => void }) {
  return (
    <div className="flex flex-1 rounded-round bg-surface-midtone p-1">
      {([
        { id: 'altus' as const, label: 'Altus' },
        { id: 'your-week' as const, label: 'Your week' },
      ]).map((t) => (
        <button
          key={t.id}
          onClick={() => setView(t.id)}
          className={cn(
            'flex flex-1 items-center justify-center gap-xs rounded-round py-1.5 text-sm font-bold transition-colors',
            view === t.id ? 'bg-surface text-ink shadow-[var(--box-shadow-100)]' : 'text-ink-subdued hover:text-ink',
          )}
        >
          {t.id === 'altus' ? (
            <img src={altusLogo} alt="" className="size-4 object-contain" />
          ) : (
            <TrendingUp className="size-4" strokeWidth={2} />
          )}
          {t.label}
        </button>
      ))}
    </div>
  )
}

function EmbeddedComponent({
  component,
  props,
}: {
  component: AltusComponent
  props: AltusPanelProps
}) {
  if (component === 'proficiency') {
    return (
      <SkillProficiencyCard
        values={props.proficiency}
        onChange={props.onProficiencyChange}
        onSave={props.onProficiencySave}
        done={props.proficiencyDone}
      />
    )
  }
  if (component === 'review') {
    const review: GoalReview = REVIEW
    return <ReviewGoalCard review={review} onConfirm={props.onConfirm} done={props.reviewDone} />
  }
  if (component === 'courseRecs') {
    return <CourseRecCards />
  }
  return null
}

export function AltusPanel(props: AltusPanelProps) {
  const { items, thinking, onSend } = props
  const draftRef = useRef<HTMLInputElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Keep the conversation scrolled to the latest turn.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [items, thinking])

  const submit = () => {
    const text = draftRef.current?.value.trim() ?? ''
    if (!text) return
    onSend(text)
    if (draftRef.current) draftRef.current.value = ''
  }

  return (
    <aside className="flex w-[440px] shrink-0 flex-col border-l border-line-subdued bg-surface-pale">
      {/* toggle bar */}
      <div className="flex items-center gap-md p-md">
        <button aria-label="Collapse panel" className="text-ink-subdued hover:text-ink">
          <PanelLeft className="size-5" strokeWidth={1.75} />
        </button>
        {/* The toggle is shown but the conversation always lives in the Altus tab
            for this prototype; "Your week" is intentionally a no-op placeholder. */}
        <ViewToggle view="altus" setView={() => {}} />
      </div>

      {/* conversation */}
      <div ref={scrollRef} className="flex flex-1 flex-col gap-md overflow-y-auto px-md pb-md">
        {items.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <span className="max-w-[80%] rounded-lg bg-brand px-sm py-xs text-sm text-on-brand">
                {m.text}
              </span>
            </div>
          ) : (
            <div key={m.id} className="flex flex-col gap-sm">
              {m.text && <AssistantCopy text={m.text} />}
              {m.component && <EmbeddedComponent component={m.component} props={props} />}
            </div>
          ),
        )}
        {thinking && <TypingIndicator />}
      </div>

      {/* composer */}
      <div className="p-md">
        <div className="flex items-center gap-xs rounded-round border border-line bg-surface py-1.5 pl-md pr-1.5">
          <input
            ref={draftRef}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                submit()
              }
            }}
            placeholder="Tell me what you want to improve or achieve…"
            className="h-9 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-subdued"
          />
          <button
            onClick={submit}
            aria-label="Send"
            className="flex size-9 shrink-0 items-center justify-center rounded-round bg-brand text-on-brand transition-colors hover:bg-brand-strong"
          >
            <ArrowUp className="size-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </aside>
  )
}
