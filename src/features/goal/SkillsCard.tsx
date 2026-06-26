import { HelpCircle, Flag } from 'lucide-react'
import { SKILLS, GOAL } from '@/data/goal'
import { SkillChart } from './SkillChart'

interface SkillsCardProps {
  /** Bars show estimated pre-assessment, or the learner's self-reported levels. */
  mode: 'estimated' | 'selfReported'
  onAssess?: (skillId: string) => void
  onTakeAssessment?: () => void
}

export function SkillsCard({ mode, onAssess, onTakeAssessment }: SkillsCardProps) {
  return (
    <section className="rounded-lg border border-line-subdued bg-surface p-md shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="mb-md flex items-center justify-between">
        <h2 className="flex items-center gap-xs text-lg font-medium text-ink">
          Skills to develop
          <HelpCircle className="size-4 text-ink-subdued" strokeWidth={1.75} />
        </h2>
        <span className="text-xs font-medium text-ink-subdued">{GOAL.role}</span>
      </div>

      <SkillChart skills={SKILLS} mode={mode} showAssess onAssess={onAssess} />

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
    </section>
  )
}
