import { useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { PersonalHeader, CategoryNav } from './shell'
import { HomeActivity } from './HomeActivity'

const CHIPS = [
  'Get promoted',
  'Upskilling in generative AI',
  'Learning new tools',
  'Improve communication',
]

/**
 * Screen 2 — "Let's set up your learning goals" (personal variant). A pale
 * hero band with a greeting, a large prompt input prefilled with the learner's
 * goal, a round send button, and suggestion chips. Submitting advances the flow.
 */
export function SetupGoals({ onSubmit }: { onSubmit: () => void }) {
  const [value, setValue] = useState('I want to upskill in Generative AI')

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PersonalHeader />
      <CategoryNav />

      {/* Hero band */}
      <div className="bg-surface-pale px-xl py-xl">
        <div className="mx-auto max-w-[1100px]">
          <p className="text-xl text-ink">Hi Reina!</p>
          <h1 className="mt-xxs text-xxl font-medium leading-tight text-ink">
            Let’s set up your learning goals
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSubmit()
            }}
            className="mt-md flex items-center gap-sm rounded-xl border border-line-subdued bg-surface px-md py-md shadow-[var(--box-shadow-100)]"
          >
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Describe a goal you want to work toward"
              className="h-9 flex-1 bg-transparent text-md text-ink outline-none placeholder:text-ink-subdued"
            />
            <button
              type="submit"
              aria-label="Set goal"
              className="flex size-9 shrink-0 items-center justify-center rounded-round bg-brand text-on-brand transition-colors hover:bg-brand-strong"
            >
              <ArrowRight className="size-4" strokeWidth={2.25} />
            </button>
          </form>

          <div className="mt-md flex flex-wrap gap-sm">
            {CHIPS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setValue(`I want to focus on ${c.toLowerCase()}`)
                }}
                className="flex items-center gap-xs rounded-round bg-surface-accent px-md py-xs text-sm text-ink transition-colors hover:bg-brand-pale"
              >
                <Sparkles className="size-4 text-brand" strokeWidth={2} />
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 bg-surface">
        <HomeActivity streakSubtitle="Just 30 mins a week help you achieve your goals" />
      </div>
    </div>
  )
}
