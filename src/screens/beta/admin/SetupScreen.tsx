import { useState } from 'react'
import { ArrowRight, Plus, Sparkles } from 'lucide-react'
import { AdminHeader, CategoryNav } from './AdminHeader'
import { StreakChallengeRow } from './StreakWidgets'

const SUGGESTIONS = [
  'Get promoted',
  'Upskilling in generative AI',
  'Learning new tools',
  'Improve communication',
]

/**
 * Screen A — "Let's set up your learning goals" (empty state), node 158:8926.
 * Marketplace header + category nav, then a centered hero (max 1140px) with the
 * big rounded chat-input card (border-radius-xxl, box-shadow-100) and suggested
 * prompt chips, over the shared streak / weekly-challenge row.
 */
export function SetupScreen({ onSubmit }: { onSubmit: (prompt: string) => void }) {
  const [draft, setDraft] = useState('')
  const submit = () => onSubmit(draft.trim() || SUGGESTIONS[1])

  return (
    <div className="flex h-screen flex-col bg-surface-pale text-ink">
      <AdminHeader />
      <CategoryNav />

      <div className="flex-1 overflow-y-auto">
        {/* hero band */}
        <section className="bg-surface-pale py-xl">
          <div className="mx-auto w-full max-w-[1140px] px-xl">
            {/* welcome message — heading-sans XL (24px) over XXL (32px), weight 500 */}
            <div className="flex flex-col gap-xs">
              <p className="text-xl font-medium leading-[1.1] text-ink">Hi Reina!</p>
              <h1 className="text-xxl font-medium leading-[1.1] text-ink">
                Let&rsquo;s set up your learning goals
              </h1>
            </div>

            {/* chat input — full content width, rounded-xxl card with soft shadow */}
            <div className="mt-sm flex flex-col gap-xs-mid">
              <div className="flex flex-col rounded-xxl border border-line-input bg-surface shadow-[var(--box-shadow-100)]">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={2}
                  placeholder="Tell me what you want to improve or achieve…"
                  className="w-full resize-none bg-transparent px-md pt-xs-mid text-md text-ink outline-none placeholder:text-ink-subdued"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      submit()
                    }
                  }}
                />
                <div className="flex items-center justify-between pb-sm pl-xs pr-sm">
                  <button
                    aria-label="Add attachment"
                    className="flex size-10 items-center justify-center rounded-round text-ink-subdued transition-colors hover:bg-surface-pale hover:text-ink"
                  >
                    <Plus className="size-5" strokeWidth={2} />
                  </button>
                  <button
                    onClick={submit}
                    aria-label="Submit goal"
                    className="flex size-10 items-center justify-center rounded-round bg-brand text-on-brand transition-colors hover:bg-brand-strong"
                  >
                    <ArrowRight className="size-5" strokeWidth={2.25} />
                  </button>
                </div>
              </div>

              {/* suggested prompts */}
              <div className="flex flex-wrap gap-sm">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => onSubmit(s)}
                    className="flex items-center gap-xs rounded-round bg-surface-midtone px-sm py-xs text-sm text-ink transition-colors hover:bg-line"
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
          <div className="mx-auto w-full max-w-[1140px] px-xl">
            <StreakChallengeRow />
          </div>
        </section>
      </div>
    </div>
  )
}
