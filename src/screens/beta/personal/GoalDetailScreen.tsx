/**
 * Screen 2 — Goal Detail. Two-column layout (~64/36): the left column is the
 * shared LeftRail + the goal content (skeleton → populated), the right column
 * is the Altus conversation panel. This component is purely presentational;
 * all state lives in PersonalGoalFlow and is threaded through props.
 */
import { LeftRail } from '@/components/shell/LeftRail'
import { LeftContent } from './LeftContent'
import { AltusPanel } from './AltusPanel'
import type { ChatItem } from './AltusPanel'
import type { ProficiencySelections } from './embeds'
import type { SkillRow, PathCourse } from './data'

export interface GoalDetailScreenProps {
  // left panel
  populated: boolean
  skills: SkillRow[]
  courses: PathCourse[]
  // right panel
  items: ChatItem[]
  thinking: boolean
  onSend: (text: string) => void
  proficiency: ProficiencySelections
  proficiencyDone: boolean
  onProficiencyChange: (skillId: string, level: number) => void
  onProficiencySave: () => void
  reviewDone: boolean
  onConfirm: () => void
}

export function GoalDetailScreen(props: GoalDetailScreenProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <LeftRail />
      {/* left content (~64%) */}
      <div className="flex flex-1 bg-surface-pale">
        <LeftContent populated={props.populated} skills={props.skills} courses={props.courses} />
      </div>
      {/* right Altus panel (~36%, fixed 440px) */}
      <AltusPanel
        items={props.items}
        thinking={props.thinking}
        onSend={props.onSend}
        proficiency={props.proficiency}
        proficiencyDone={props.proficiencyDone}
        onProficiencyChange={props.onProficiencyChange}
        onProficiencySave={props.onProficiencySave}
        reviewDone={props.reviewDone}
        onConfirm={props.onConfirm}
      />
    </div>
  )
}
