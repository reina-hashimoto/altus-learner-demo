import { useState } from 'react'
import { ArrowRight, PlusCircle, Sparkles } from 'lucide-react'
import { AdminHeader, CategoryNav } from './AdminHeader'
import { StreakChallengeRow } from './StreakWidgets'

const SUGGESTIONS = [
  'Get promoted',
  'Upskilling in generative AI',
  'Learning new tools',
  'Improve communication',
]

/**
 * Screen A — "Let's set up your learning goals" (empty state). Marketplace
 * header + gray hero band with the goal chat input and suggested prompts,
 * over the shared streak / weekly-challenge row.
 */
export function SetupScreen({ onSubmit }: { onSubmit: (prompt: string) => void }) {
  const [draft, setDraft] = useState('')
  const submit = () => onSubmit(draft.trim() || SUGGESTIONS[1])

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <AdminHeader />
      <CategoryNav />

      <div className="flex-1 overflow-y-auto">
        {/* hero band */}
        <section className="bg-surface-pale py-xl">
          <div className="mx-auto w-full max-w-[1160px] px-xl">
            <div className="pl-[260px]">
              <p className="text-xl font-medium text-ink">Hi Reina!</p>
              <h1 className="mt-xxs text-xxl font-medium text-ink">
                Let's set up your learning goals
              </h1>

              {/* chat input */}
              <div className="mt-md max-w-[680px] rounded-[var(--border-radius-xxl)] bg-surface p-md shadow-[var(--box-shadow-100)]">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Tell me what you want to improve or achieve…"
                  className="w-full resize-none bg-transparent text-sm text-ink outline-none placeholder:text-ink-subdued"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submit()
                    }
                  }}
                />
                <div className="mt-sm flex items-center justify-between">
                  <button
                    aria-label="Add"
                    className="text-ink-subdued hover:text-ink"
                  >
                    <PlusCircle className="size-6" strokeWidth={1.75} />
                  </button>
                  <button
                    onClick={submit}
                    aria-label="Submit goal"
                    className="flex size-9 items-center justify-center rounded-round bg-brand text-on-brand transition-colors hover:bg-brand-strong"
                  >
                    <ArrowRight className="size-4" strokeWidth={2.25} />
                  </button>
                </div>
              </div>

              {/* suggested prompts */}
              <div className="mt-md flex max-w-[680px] flex-wrap gap-sm">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => onSubmit(s)}
                    className="flex items-center gap-xs rounded-round bg-surface-midtone px-sm py-xs text-sm text-ink hover:bg-line"
                  >
                    <Sparkles className="size-4 text-brand" strokeWidth={2} />
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* streak + weekly challenge */}
        <section className="bg-surface py-xl">
          <div className="mx-auto w-full max-w-[1160px] px-xl">
            <StreakChallengeRow />
          </div>
        </section>
      </div>
    </div>
  )
}
