import { Button } from '@/components/ui/button'

/**
 * One-time nudge shown next to a reached-target skill's Assess button: the
 * learner has self-reported their way to the target, so encourage them to make
 * it official with a Udemy assessment. Dismissed via "Got it" (once per session).
 */
export function AssessOnboarding({ onDismiss }: { onDismiss?: () => void }) {
  return (
    <div className="animate-altus-fadein absolute right-0 top-full z-50 mt-sm w-[260px] rounded-md border border-line-subdued bg-surface p-sm text-left shadow-[0_4px_16px_rgba(140,134,147,0.2)]">
      {/* arrow pointing up to the Assess button */}
      <span className="absolute -top-1.5 right-7 size-3 rotate-45 border-l border-t border-line-subdued bg-surface" />
      <p className="relative text-xs leading-relaxed text-ink">
        Ready to make it official? Take a quick Udemy assessment to verify a skill and earn official
        certification — your profile and learning path update automatically.
      </p>
      <div className="relative mt-sm flex justify-end">
        <Button udStyle="primary" size="xsmall" onClick={onDismiss}>
          Got it
        </Button>
      </div>
    </div>
  )
}
