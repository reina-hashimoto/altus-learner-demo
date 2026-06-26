import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import udemyBusinessLogo from '@/assets/udemy-business-logo.png'
import { flows } from '@/flows/registry'
import { PERSONA_LABEL, type Flow } from '@/flows/types'
import { cn } from '@/components/ui/utils'

type HubTab = 'beta' | 'post-beta'

/** Prototype hub: pick a scenario × persona flow to play, grouped by release tab. */
export default function FlowIndex() {
  const [tab, setTab] = useState<HubTab>('beta')

  const byScenario = flows.reduce<Record<string, Flow[]>>((acc, f) => {
    ;(acc[f.scenarioId] ??= []).push(f)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-surface-pale text-ink">
      {/* clean branded header — just the Udemy Business logo */}
      <header className="flex h-[72px] items-center border-b border-line-subdued bg-surface px-lg">
        <img src={udemyBusinessLogo} alt="Udemy Business" className="h-[34px] w-auto" />
      </header>

      <main className="mx-auto max-w-[920px] px-md py-xl">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Altus · Learner</p>
        <h1 className="mt-xxs text-xxl font-medium">Prototype hub</h1>
        <p className="mt-xs max-w-[60ch] text-md text-ink-subdued">
          The admin-assigned goal experience across four learning-path configurations, for two
          personas. Pick a flow to play it.
        </p>

        {/* Beta / Post-beta tabs */}
        <div className="mt-lg flex gap-xs border-b border-line">
          {(['beta', 'post-beta'] as HubTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                '-mb-px border-b-2 px-sm py-xs text-sm font-bold capitalize transition-colors',
                tab === t
                  ? 'border-brand text-brand'
                  : 'border-transparent text-ink-subdued hover:text-ink',
              )}
            >
              {t === 'post-beta' ? 'Post-beta' : 'Beta'}
            </button>
          ))}
        </div>

        {tab === 'beta' ? (
          <div className="mt-md flex flex-col gap-md">
            {Object.values(byScenario).map((group) => {
              const { scenario, scenarioBlurb } = group[0]
              return (
                <section key={scenario} className="rounded-lg border border-line bg-surface p-md">
                  <h2 className="text-lg font-medium">{scenario}</h2>
                  <p className="mt-xxs max-w-[70ch] text-sm text-ink-subdued">{scenarioBlurb}</p>
                  <div className="mt-sm flex flex-wrap gap-sm">
                    {group.map((f) => (
                      <FlowChip key={f.id} flow={f} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        ) : (
          <div className="mt-md rounded-lg border border-dashed border-line bg-surface p-xl text-center">
            <p className="text-md font-medium text-ink">Post-beta flows coming soon</p>
            <p className="mt-xxs text-sm text-ink-subdued">
              The refined post-beta designs will live here once they’re ready.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

function FlowChip({ flow }: { flow: Flow }) {
  const label = PERSONA_LABEL[flow.persona]
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
