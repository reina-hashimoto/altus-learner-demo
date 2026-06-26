import { Flag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PersonalHeader, CategoryNav } from './shell'
import { HomeActivity } from './HomeActivity'

/**
 * Screen 1 — Streak home (entry). The marketplace home with an org-assigned
 * goal banner floating in a pale hero band. "View the plan" advances the flow.
 */
export function StreakHome({ onViewPlan }: { onViewPlan: () => void }) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <PersonalHeader />
      <CategoryNav />

      {/* Hero band */}
      <div className="bg-surface-pale px-xl py-xl">
        <div className="mx-auto flex max-w-[760px] items-center gap-md rounded-lg bg-surface p-lg shadow-[var(--box-shadow-100)]">
          <Flag className="mt-xxs size-5 shrink-0 text-brand" strokeWidth={2} />
          <div className="flex-1">
            <p className="text-sm font-bold text-ink">New goal assigned by your organization</p>
            <p className="mt-xxs text-sm text-ink-subdued">
              <span className="font-bold text-ink">“Improve AWS Cost Efficiency”</span> by the end of August, 2026
            </p>
            <div className="mt-sm">
              <Button udStyle="primary" size="small" onClick={onViewPlan}>
                View the plan
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-surface">
        <HomeActivity streakSubtitle="You'll always be glad you made time for learning." />
      </div>
    </div>
  )
}
