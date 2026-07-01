import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import udemyBusinessLogo from '@/assets/udemy-business-logo.png'
import { flows } from '@/flows/registry'
import { PERSONA_LABEL, type Flow, type HubTab } from '@/flows/types'
import { cn } from '@/components/ui/utils'

const TABS: HubTab[] = ['post-beta', 'beta']
const TAB_LABEL: Record<HubTab, string> = { beta: 'Beta', 'post-beta': 'Post-beta' }

/** Prototype hub: choose a flow to play, grouped by release tab. */
export default function FlowIndex() {
  // Default to the first tab that has ready flows.
  const firstWithFlows = TABS.find((t) => flows.some((f) => f.tab === t && f.status === 'ready'))
  const [tab, setTab] = useState<HubTab>(firstWithFlows ?? 'beta')

  const tabFlows = flows.filter((f) => f.tab === tab)
  // Group by scenario (post-beta) or by the flow's own label (standalone beta).
  const groups = tabFlows.reduce<Record<string, Flow[]>>((acc, f) => {
    const key = f.scenario ?? f.label ?? f.id
    ;(acc[key] ??= []).push(f)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-surface-pale text-ink">
      <header className="flex h-[72px] items-center border-b border-line-subdued bg-surface px-lg">
        <img src={udemyBusinessLogo} alt="Udemy Business" className="h-[34px] w-auto" />
      </header>

      <main className="mx-auto max-w-[920px] px-md py-xl">
        <div className="flex gap-xs border-b border-line">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                '-mb-px border-b-2 px-sm py-xs text-sm font-bold transition-colors',
                tab === t ? 'border-brand text-brand' : 'border-transparent text-ink-subdued hover:text-ink',
              )}
            >
              {TAB_LABEL[t]}
            </button>
          ))}
        </div>

        {Object.keys(groups).length === 0 ? (
          <div className="mt-md rounded-lg border border-dashed border-line bg-surface p-xl text-center">
            <p className="text-md font-medium text-ink">{TAB_LABEL[tab]} flows coming soon</p>
            <p className="mt-xxs text-sm text-ink-subdued">These designs will live here once they’re built.</p>
          </div>
        ) : (
          <div className="mt-md flex flex-col gap-md">
            {Object.values(groups).map((group) => (
              <section key={group[0].id} className="rounded-lg border border-line bg-surface p-md">
                <h2 className="text-lg font-medium">{group[0].scenario ?? group[0].label}</h2>
                <p className="mt-xxs max-w-[70ch] text-sm text-ink-subdued">
                  {group[0].scenarioBlurb ?? group[0].blurb}
                </p>
                <div className="mt-sm flex flex-wrap gap-sm">
                  {group.map((f) => (
                    <FlowChip key={f.id} flow={f} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

function FlowChip({ flow }: { flow: Flow }) {
  const label = flow.persona ? PERSONA_LABEL[flow.persona] : 'Open'
  if (flow.status !== 'ready') {
    return (
      <span className="inline-flex items-center gap-xs rounded-round border border-line-subdued bg-surface-pale px-md py-xs text-sm text-ink-subdued">
        {label}
        <span className="rounded-round bg-surface-midtone px-xs text-xxs font-bold uppercase">Soon</span>
      </span>
    )
  }
  return (
    <Link
      to={`/${flow.id}`}
      className="inline-flex items-center gap-xs rounded-md border border-brand bg-surface px-md py-xs text-sm font-bold text-brand transition-colors hover:bg-surface-accent"
    >
      {label}
      <ArrowRight className="size-4" strokeWidth={2} />
    </Link>
  )
}
