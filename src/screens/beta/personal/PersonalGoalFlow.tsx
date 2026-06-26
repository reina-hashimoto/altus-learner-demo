import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { StreakHome } from './StreakHome'
import { SetupGoals } from './SetupGoals'
import { GoalDetail } from './GoalDetail'

/**
 * Personal goal E2E prototype flow.
 *
 * A learner sets their own learning goal and lands on a personalized goal page.
 * Four screens, advanced by the real CTAs in each screen (no router):
 *   1. Streak home (entry)            — "View the plan" / start setting a goal
 *   2. Let's set up your goals        — submit the prompt input
 *   3. Goal detail (Altus active)     — skills, learning path, assistant panel
 *   4. Goal detail (assistant off)    — same page, AI Assistant disabled state
 *
 * A thin footer bar provides Back/Next affordances for prototype navigation
 * in addition to the in-screen CTAs.
 */
const STEP_LABELS = ['Streak home', 'Set up goals', 'Goal detail', 'Assistant disabled']

export default function PersonalGoalFlow() {
  const [step, setStep] = useState(0)
  const go = (n: number) => setStep(Math.max(0, Math.min(STEP_LABELS.length - 1, n)))

  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex-1">
        {step === 0 && <StreakHome onViewPlan={() => go(1)} />}
        {step === 1 && <SetupGoals onSubmit={() => go(2)} />}
        {step === 2 && <GoalDetail panelDisabled={false} />}
        {step === 3 && <GoalDetail panelDisabled />}
      </div>

      {/* Prototype navigation bar */}
      <div className="sticky bottom-0 z-10 flex items-center justify-between gap-md border-t border-line-subdued bg-surface px-lg py-sm">
        <button
          onClick={() => go(step - 1)}
          disabled={step === 0}
          className="flex items-center gap-xs text-sm font-bold text-ink-subdued hover:text-ink disabled:opacity-30"
        >
          <ChevronLeft className="size-4" strokeWidth={2} />
          Back
        </button>
        <span className="text-xs text-ink-subdued">
          Step {step + 1} of {STEP_LABELS.length} · {STEP_LABELS[step]}
        </span>
        <button
          onClick={() => go(step + 1)}
          disabled={step === STEP_LABELS.length - 1}
          className="flex items-center gap-xs text-sm font-bold text-brand hover:text-brand-strong disabled:opacity-30"
        >
          Next
          <ChevronRight className="size-4" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
