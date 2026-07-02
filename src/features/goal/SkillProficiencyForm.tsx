import { PROFICIENCY_LEVELS, type Skill } from '@/data/goal'
import { Button } from '@/components/ui/button'
import { cn } from '@/components/ui/utils'

export type ProficiencySelections = Record<string, number>

interface SkillProficiencyFormProps {
  skills: Skill[]
  values: ProficiencySelections
  /** levelIndex is null when the learner de-selects (clicks the active level again). */
  onChange: (skillId: string, levelIndex: number | null) => void
  onSubmit: () => void
  /** Open the "Level definitions" info modal. */
  onOpenLevelDefs?: () => void
}

export function SkillProficiencyForm({ skills, values, onChange, onSubmit, onOpenLevelDefs }: SkillProficiencyFormProps) {

  return (
    <div className="rounded-lg border border-line bg-surface">
      <div className="flex items-center justify-between p-md">
        <h3 className="text-md font-bold text-ink">Skill proficiency</h3>
        <button onClick={onOpenLevelDefs} className="text-sm font-bold text-link hover:underline">Level definitions</button>
      </div>
      <div className="border-t border-line-subdued" />

      <div className="flex flex-col gap-md p-md">
        {skills.map((skill, i) => (
          <div key={skill.id} className="flex flex-col gap-xs">
            <div className="flex items-center gap-xs">
              <span className="flex size-5 items-center justify-center rounded-round bg-surface-midtone text-xxs font-bold text-ink-subdued">
                {i + 1}
              </span>
              <span className="text-sm font-bold text-ink">{skill.name}</span>
            </div>
            <p className="text-xs leading-snug text-ink-subdued">{skill.description}</p>

            <div className="mt-xxs grid grid-cols-4 gap-xs">
              {PROFICIENCY_LEVELS.map((level, idx) => {
                const selected = values[skill.id] === idx
                return (
                  <button
                    key={level}
                    onClick={() => onChange(skill.id, selected ? null : idx)}
                    className={cn(
                      'rounded-sm px-xs py-xs text-xs transition-colors',
                      selected
                        ? 'bg-brand font-bold text-on-brand'
                        : 'bg-surface-pale font-normal text-ink hover:bg-surface-midtone',
                    )}
                  >
                    {level}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        <div className="flex justify-end">
          <Button udStyle="secondary" onClick={onSubmit}>
            Save and continue
          </Button>
        </div>
      </div>
    </div>
  )
}
