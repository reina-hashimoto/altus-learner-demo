import { useState } from 'react'
import { PanelLeft, ArrowRight, Sparkles, TrendingUp } from 'lucide-react'
import { cn } from '@/components/ui/utils'
import { AltusMark } from './AltusMark'
import { TypingIndicator } from './TypingIndicator'
import {
  SkillProficiencyForm,
  type ProficiencySelections,
} from '../SkillProficiencyForm'

export interface AltusMessage {
  id: string
  role: 'assistant' | 'user'
  text: string
}

type AltusView = 'altus' | 'your-week'

interface AltusPanelProps {
  messages: AltusMessage[]
  thinking: boolean
  showProficiencyForm: boolean
  proficiency: ProficiencySelections
  onProficiencyChange: (skillId: string, levelIndex: number) => void
  onProficiencySubmit: () => void
  onSend: (text: string) => void
  onChip: (chip: 'assessment' | 'role') => void
}

export function AltusPanel(props: AltusPanelProps) {
  const [view, setView] = useState<AltusView>('altus')
  const [draft, setDraft] = useState('')

  const send = () => {
    const text = draft.trim()
    if (!text) return
    props.onSend(text)
    setDraft('')
  }

  return (
    <div className="flex h-full flex-col bg-surface-pale">
      {/* toggle bar */}
      <div className="flex items-center gap-sm px-md py-sm">
        <button className="text-ink-subdued hover:text-ink" aria-label="Collapse panel">
          <PanelLeft className="size-5" strokeWidth={1.75} />
        </button>
        <div className="flex flex-1 rounded-round bg-surface-midtone p-1">
          <ToggleTab active={view === 'altus'} onClick={() => setView('altus')}>
            <AltusMark size={16} /> Altus
          </ToggleTab>
          <ToggleTab active={view === 'your-week'} onClick={() => setView('your-week')}>
            <TrendingUp className="size-4" strokeWidth={2} /> Your week
          </ToggleTab>
        </div>
      </div>

      {/* conversation */}
      <div className="flex-1 overflow-y-auto px-md pb-md">
        {view === 'your-week' ? (
          <p className="pt-sm text-sm text-ink-subdued">Your week at a glance — coming soon.</p>
        ) : (
          <div className="flex flex-col gap-md pt-xs">
            {props.messages.map((m) =>
              m.role === 'assistant' ? (
                <p key={m.id} className="text-sm leading-relaxed text-ink">
                  {m.text}
                </p>
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
                values={props.proficiency}
                onChange={props.onProficiencyChange}
                onSubmit={props.onProficiencySubmit}
              />
            )}

            {props.thinking && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* composer */}
      <div className="flex flex-col gap-xs px-md pb-md">
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
        <div className="flex gap-xs">
          <Chip onClick={() => props.onChip('assessment')}>Take an assessment</Chip>
          <Chip onClick={() => props.onChip('role')}>Update role</Chip>
        </div>
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
        active ? 'bg-surface text-ink shadow-sm' : 'text-ink-subdued hover:text-ink',
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
