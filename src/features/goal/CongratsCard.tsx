import { Button } from '@/components/ui/button'

/**
 * Goal-complete celebration card — shown in the learning-path slot once every
 * skill has reached its target proficiency. Uses the Thesis hero illustration
 * (instructor-course-revenue-female) instead of an emoji, with an optional
 * "See learning goals" CTA.
 */
export function CongratsCard({ onSeeGoals }: { onSeeGoals?: () => void }) {
  return (
    <section className="flex w-full flex-col items-center gap-sm rounded-lg bg-surface p-xl text-center">
      {/* Thesis hero illustration in place of an emoji. */}
      <img
        src="https://frontends.udemycdn.com/thesis/hero-illustrations/v1/light/instructor-course-revenue-female@2x.webp"
        alt=""
        className="mb-xs h-40 w-auto"
      />
      <h2 className="text-xl font-bold text-ink">Goal complete — congratulations!</h2>
      <p className="max-w-[600px] text-sm text-ink-subdued">
        You've reached the target proficiency for every skill in this goal. Your learning path is all done. Keep the
        momentum going by setting a new goal or exploring advanced topics.
      </p>
      {onSeeGoals && (
        <Button udStyle="primary" size="large" onClick={onSeeGoals} className="mt-sm">
          See learning goals
        </Button>
      )}
    </section>
  )
}
