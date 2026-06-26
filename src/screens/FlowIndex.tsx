import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { UBHeader } from '@/components/shell/UBHeader'
import { flows } from '@/flows/registry'
import { PERSONA_LABEL, type Flow } from '@/flows/types'

/** Landing page: pick a scenario × persona flow to play. */
export default function FlowIndex() {
  const byScenario = flows.reduce<Record<string, Flow[]>>((acc, f) => {
    ;(acc[f.scenarioId] ??= []).push(f)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-surface-pale text-ink">
      <UBHeader />
      <main className="mx-auto max-w-[920px] px-md py-xl">
        <p className="text-sm font-bold uppercase tracking-wide text-brand">Altus · Learner</p>
        <h1 className="mt-xxs text-xxl font-medium">Prototype flows</h1>
        <p className="mt-xs max-w-[60ch] text-md text-ink-subdued">
          The admin-assigned goal experience across four learning-path configurations, for two
          personas. Pick a flow to play it.
        </p>

        <div className="mt-lg flex flex-col gap-md">
          {Object.values(byScenario).map((group) => {
            const { scenario, scenarioBlurb } = group[0]
            return (
              <section
                key={scenario}
                className="rounded-lg border border-line bg-surface p-md"
              >
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
      className="inline-flex items-center gap-xs rounded-round border border-line-brand bg-surface px-md py-xs text-sm font-bold text-brand transition-colors hover:bg-brand-pale"
    >
      {label}
      <ArrowRight className="size-4" strokeWidth={2} />
    </Link>
  )
}
