import { useState } from 'react'
import { PanelLeft, ArrowUp, Flame, GraduationCap, FlaskConical, ClipboardCheck, TrendingUp, Lock, Calendar, Users } from 'lucide-react'
import { cn } from '@/components/ui/utils'
import altusLogo from '@/assets/altus-logo.png'

export type PanelView = 'altus' | 'your-week'

function ViewToggle({ view, setView }: { view: PanelView; setView: (v: PanelView) => void }) {
  return (
    <div className="flex items-center gap-xs rounded-round bg-surface-pale p-xxs">
      {(
        [
          { id: 'altus' as const, label: 'Altus' },
          { id: 'your-week' as const, label: 'Your week' },
        ]
      ).map((t) => (
        <button
          key={t.id}
          onClick={() => setView(t.id)}
          className={cn(
            'flex items-center gap-xs rounded-round px-md py-xs text-sm font-bold transition-colors',
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

function MiniCard({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg bg-surface p-md shadow-[var(--box-shadow-100)]">{children}</div>
}

function WeekContent() {
  return (
    <div className="flex flex-col gap-md">
      <MiniCard>
        <div className="mb-sm flex items-center justify-between">
          <p className="text-sm font-bold text-ink">Weekly streak</p>
          <span className="text-xs text-ink-subdued">Feb 22-28</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-xs text-sm text-ink">
            <Flame className="size-5 text-brand" strokeWidth={2} fill="var(--color-purple-400)" />
            <span className="font-bold">1</span> week
          </span>
          <div className="flex flex-col gap-xxs text-xs text-ink">
            <span className="flex items-center gap-xs">
              <span className="size-2 rounded-round bg-[var(--color-orange-400)]" /> 20/30 min
            </span>
            <span className="flex items-center gap-xs">
              <span className="size-2 rounded-round bg-[var(--color-teal-400)]" /> 1/1 visit
            </span>
          </div>
        </div>
      </MiniCard>

      <MiniCard>
        <p className="mb-sm text-sm font-bold text-ink">Weekly challenge</p>
        <div className="flex items-center justify-between">
          {[GraduationCap, FlaskConical, ClipboardCheck].map((Icon, i) => (
            <span
              key={i}
              className={cn(
                'flex size-9 items-center justify-center rounded-round',
                i < 2 ? 'bg-[var(--color-teal-400)] text-on-brand' : 'border border-line text-ink-subdued',
              )}
            >
              <Icon className="size-4" strokeWidth={1.75} />
            </span>
          ))}
        </div>
      </MiniCard>

      <MiniCard>
        <p className="mb-sm flex items-center gap-xs text-sm font-bold text-ink">
          <Users className="size-4 text-brand" strokeWidth={2} /> Company trends
        </p>
        <ul className="flex flex-col gap-sm text-xs text-ink-subdued">
          <li><span className="font-bold text-ink">You’re in the top 5%</span> of learners exploring AI-powered Design this month.</li>
          <li><span className="font-bold text-ink">120 learners</span> exploring Kubernetes Autoscaling this week.</li>
          <li><span className="font-bold text-ink">30+ learners</span> completed Prompt-to-UI Prototyping recently.</li>
        </ul>
      </MiniCard>

      <MiniCard>
        <p className="mb-sm flex items-center gap-xs text-sm font-bold text-ink">
          <TrendingUp className="size-4 text-brand" strokeWidth={2} /> Turn learning into growth
        </p>
        <ul className="flex flex-col gap-sm text-xs text-ink">
          <li className="flex items-center gap-xs"><Calendar className="size-4 shrink-0 text-ink-subdued" strokeWidth={1.75} /> Schedule a 1:1 with your manager</li>
          <li className="flex items-center gap-xs"><Users className="size-4 shrink-0 text-ink-subdued" strokeWidth={1.75} /> Join the AI Cost Efficiency community</li>
        </ul>
      </MiniCard>
    </div>
  )
}

function AltusActive() {
  const [draft, setDraft] = useState('')
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto">
        <WeekContent />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setDraft('')
        }}
        className="mt-md flex items-center gap-sm rounded-round border border-line-subdued bg-surface px-md py-xs"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Tell me what you want to improve or achieve…"
          className="h-8 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-subdued"
        />
        <button type="submit" aria-label="Send" className="flex size-7 items-center justify-center rounded-round bg-brand text-on-brand hover:bg-brand-strong">
          <ArrowUp className="size-4" strokeWidth={2.25} />
        </button>
      </form>
    </div>
  )
}

function AltusDisabled() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span className="flex size-16 items-center justify-center rounded-round bg-surface-midtone text-ink">
          <Lock className="size-7" strokeWidth={1.75} />
        </span>
        <p className="mt-md text-md font-bold text-ink">AI Assistant is disabled</p>
        <p className="mt-xs max-w-[260px] text-sm text-ink-subdued">
          Your organization has turned off the AI Assistant for this learning goal.
        </p>
      </div>
      <div className="mt-md flex items-center gap-sm rounded-round border border-line-subdued bg-surface-pale px-md py-xs opacity-60">
        <input
          disabled
          placeholder="Tell me what you want to improve or achieve…"
          className="h-8 flex-1 cursor-not-allowed bg-transparent text-sm text-ink-subdued outline-none placeholder:text-ink-subdued"
        />
        <span className="flex size-7 items-center justify-center rounded-round bg-brand/40 text-on-brand">
          <ArrowUp className="size-4" strokeWidth={2.25} />
        </span>
      </div>
    </div>
  )
}

/** Right-hand assistant panel for the goal detail page (screens 3 & 4). */
export function AltusPanel({ disabled, initialView }: { disabled: boolean; initialView: PanelView }) {
  const [view, setView] = useState<PanelView>(initialView)
  return (
    <aside className="flex w-[440px] shrink-0 flex-col border-l border-line-subdued bg-surface px-lg py-lg">
      <div className="mb-md flex items-center gap-sm">
        <button aria-label="Collapse panel" className="text-ink-subdued hover:text-ink">
          <PanelLeft className="size-5" strokeWidth={1.75} />
        </button>
        <ViewToggle view={view} setView={setView} />
      </div>
      {disabled ? <AltusDisabled /> : view === 'altus' ? <AltusActive /> : <WeekContent />}
    </aside>
  )
}
