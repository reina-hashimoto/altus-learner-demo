import { HelpCircle, Flag } from 'lucide-react'
import type { Skill } from '@/data/goal'
import { SkillChart } from './SkillChart'

interface SkillsCardProps {
  skills: Skill[]
  role: string
  /** Bars show estimated pre-assessment, or the learner's self-reported levels. */
  mode: 'estimated' | 'selfReported'
  /** Per-skill mode overrides (applied after proficiency form submit). */
  perSkillMode?: Record<string, 'estimated' | 'selfReported'>
  /** When true, skills aren't defined yet — render a loading skeleton (Custom flow). */
  skeleton?: boolean
  /** When true with skeleton, suppresses the shimmer animation (static placeholder). */
  staticSkeleton?: boolean
  /** Show the persona role label (appears once the learner states their role). */
  showRole?: boolean
  /** Animate bars from 0 → value on first render (custom scenario reveal). */
  animateBars?: boolean
  onAssess?: (skillId: string) => void
  onTakeAssessment?: () => void
  /** Skill ids whose Assess button should be primary (reached target — verify via assessment). */
  primaryAssessIds?: Set<string>
  /** Skill ids verified via assessment — dark-green bar + "Retake" button. */
  verifiedSkillIds?: Set<string>
  /** Skill id to briefly celebrate near its chart row. */
  celebrateSkillId?: string | null
  /** Show the one-time onboarding tooltip near the first primary Assess button. */
  assessOnboardingOpen?: boolean
  onDismissAssessOnboarding?: () => void
}

const SKILLS_TOOLTIP =
  'Shows the key skills required to achieve your goal and the target proficiency for each. Your current proficiency is based on either your learning activity, your self-reported proficiency, or verified Udemy Assessment results, helping you identify your skill gaps.'

export function SkillsCard({ skills, role, mode, perSkillMode, skeleton, staticSkeleton, showRole, animateBars, onAssess, onTakeAssessment, primaryAssessIds, verifiedSkillIds, celebrateSkillId, assessOnboardingOpen, onDismissAssessOnboarding }: SkillsCardProps) {
  return (
    <section className="rounded-lg bg-surface p-lg">
      <div className="mb-md flex items-center justify-between">
        <h2 className="flex items-center gap-xs text-lg font-medium text-ink">
          Skills to develop
          {/* Design-system Tooltip — appears on hover/focus of the ? affordance */}
          <span className="group/tt relative inline-flex">
            <button
              type="button"
              aria-label="About skills to develop"
              className="flex items-center justify-center rounded-round text-ink-subdued transition-colors hover:text-ink focus:text-ink focus:outline-none"
            >
              <HelpCircle className="size-4" strokeWidth={1.75} />
            </button>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-full z-50 mt-xs w-[320px] -translate-x-1/2 rounded-sm border border-line-subdued bg-surface p-xs text-center text-sm font-normal leading-[1.6] text-ink opacity-0 shadow-[0_2px_8px_rgba(140,134,147,0.16),0_4px_16px_rgba(140,134,147,0.12)] transition-opacity duration-150 group-hover/tt:opacity-100 group-focus-within/tt:opacity-100"
            >
              {SKILLS_TOOLTIP}
            </span>
          </span>
        </h2>
        {!skeleton && showRole && (
          <span className="text-xs font-medium text-ink-subdued">{role}</span>
        )}
      </div>

      {skeleton ? (
        <SkeletonLines static={staticSkeleton} />
      ) : (
        <>
          <SkillChart
            skills={skills}
            mode={mode}
            perSkillMode={perSkillMode}
            showAssess
            onAssess={onAssess}
            animateBars={animateBars}
            primaryAssessIds={primaryAssessIds}
            verifiedSkillIds={verifiedSkillIds}
            celebrateSkillId={celebrateSkillId}
            assessOnboardingOpen={assessOnboardingOpen}
            onDismissAssessOnboarding={onDismissAssessOnboarding}
          />
          <button
            onClick={onTakeAssessment}
            className="mt-md flex w-full items-center gap-sm rounded-md bg-surface-accent px-sm py-sm text-left transition-colors hover:bg-brand-pale/70"
          >
            <Flag className="size-5 shrink-0 text-brand" strokeWidth={2} />
            <span>
              <span className="block text-sm font-bold text-ink">Take a skill assessment</span>
              <span className="block text-xs text-ink-subdued">
                Validate your skills and measure progress toward your target proficiency.
              </span>
            </span>
          </button>
        </>
      )}
    </section>
  )
}

function SkeletonLines({ static: isStatic }: { static?: boolean }) {
  const widths = ['100%', '100%', '100%', '45%']
  const cls = isStatic ? 'skeleton-static' : 'skeleton'
  return (
    <div className="flex flex-col gap-sm py-xs" aria-hidden>
      {widths.map((w, i) => (
        <div key={i} className={`${cls} h-3 rounded-round`} style={{ width: w }} />
      ))}
    </div>
  )
}
