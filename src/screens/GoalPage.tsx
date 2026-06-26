import { useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { UBHeader } from '@/components/shell/UBHeader'
import { LeftRail } from '@/components/shell/LeftRail'
import { GoalHeader } from '@/features/goal/GoalHeader'
import { SkillsCard } from '@/features/goal/SkillsCard'
import { LearningPathCard } from '@/features/goal/LearningPathCard'
import { AltusPanel, type AltusMessage } from '@/features/goal/altus/AltusPanel'
import type { ProficiencySelections } from '@/features/goal/SkillProficiencyForm'
import { getFlow, defaultFlowId } from '@/flows/registry'
import { getFlowConfig, type ChipDef } from '@/flows/config'

type Stage = 'intro' | 'proficiency' | 'thinking' | 'done'

export default function GoalPage() {
  const { flowId } = useParams()
  const flow = getFlow(flowId) ?? getFlow(defaultFlowId)!
  const config = getFlowConfig(flow.scenarioId ?? 'fixed', flow.persona ?? 'product-manager')

  const introMessages: AltusMessage[] = config.intro.map((text, i) => ({
    id: `intro-${i}`,
    role: 'assistant',
    text,
  }))

  const [stage, setStage] = useState<Stage>('intro')
  const [messages, setMessages] = useState<AltusMessage[]>(introMessages)
  const [proficiency, setProficiency] = useState<ProficiencySelections>({})
  const idRef = useRef(0)
  const nextId = () => `m${++idRef.current}`

  const done = stage === 'done'
  const chartMode = stage === 'thinking' || done ? 'selfReported' : 'estimated'
  const skillsSkeleton = !config.skillsKnown && stage === 'intro'
  const pathSkeleton = config.pathMode === 'empty' && !done

  // Flex shortens its first course once the path is tailored.
  const displayedCourses =
    done && config.tailorFirstCourse
      ? config.courses.map((c, i) => (i === 0 ? { ...c, ...config.tailorFirstCourse } : c))
      : config.courses

  const startProficiency = (role?: string) => {
    if (stage !== 'intro') return
    setMessages((prev) => {
      const next = [...prev]
      if (role) next.push({ id: nextId(), role: 'user', text: role })
      next.push({ id: nextId(), role: 'assistant', text: config.proficiencyPrompt })
      return next
    })
    setStage('proficiency')
  }

  const handleSend = (text: string) => {
    if (stage === 'intro') startProficiency(text)
    else setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }])
  }

  const handleChip = (chip: ChipDef['id']) => {
    if (chip === 'role') startProficiency(config.role)
    else if (chip === 'assessment') startProficiency()
    else if (chip === 'study-time') {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'user', text: 'Change study time' },
        { id: nextId(), role: 'assistant', text: 'Sure — how many hours per week can you commit?' },
      ])
    }
  }

  const handleProficiencySubmit = () => {
    setStage('thinking')
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', text: 'Skill proficiency updated', pill: true },
        {
          id: nextId(),
          role: 'assistant',
          text: config.doneMessage,
          options: config.doneStyle === 'personalized' ? config.doneOptions : undefined,
        },
      ])
      setStage('done')
    }, 1800)
  }

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <UBHeader />
      <div className="flex flex-1 overflow-hidden">
        <LeftRail />
        {/* Figma 7021:27603: content area 856px, Altus panel ~480px → ~64/36 split */}
        <div className="grid flex-1 grid-cols-[856fr_480fr] overflow-hidden">
          <div className="overflow-y-auto bg-surface-pale px-lg py-md">
            <div className="mx-auto flex max-w-[860px] flex-col gap-md">
              <GoalHeader title={config.goalTitle} />
              <SkillsCard
                skills={config.skills}
                role={config.role}
                mode={chartMode}
                skeleton={skillsSkeleton}
                showRole={stage !== 'intro'}
                onAssess={() => startProficiency()}
                onTakeAssessment={() => startProficiency()}
              />
              <LearningPathCard
                courses={displayedCourses}
                skeleton={pathSkeleton}
                curated={config.pathMode === 'fixed'}
              />
            </div>
          </div>

          <AltusPanel
            messages={messages}
            thinking={stage === 'thinking'}
            showProficiencyForm={stage === 'proficiency'}
            skills={config.skills}
            proficiency={proficiency}
            chips={config.chips}
            onProficiencyChange={(skillId, levelIndex) =>
              setProficiency((p) => ({ ...p, [skillId]: levelIndex }))
            }
            onProficiencySubmit={handleProficiencySubmit}
            onSend={handleSend}
            onChip={handleChip}
          />
        </div>
      </div>
    </div>
  )
}
