import { useRef, useState } from 'react'
import { UBHeader } from '@/components/shell/UBHeader'
import { LeftRail } from '@/components/shell/LeftRail'
import { GoalHeader } from '@/features/goal/GoalHeader'
import { SkillsCard } from '@/features/goal/SkillsCard'
import { LearningPathCard } from '@/features/goal/LearningPathCard'
import { AltusPanel, type AltusMessage } from '@/features/goal/altus/AltusPanel'
import type { ProficiencySelections } from '@/features/goal/SkillProficiencyForm'
import { GOAL } from '@/data/goal'

type Stage = 'intro' | 'proficiency' | 'thinking' | 'done'

const INTRO_MESSAGES: AltusMessage[] = [
  {
    id: 'intro-1',
    role: 'assistant',
    text: `Your organization has assigned you the goal “${GOAL.altusGoalName}” by ${GOAL.altusDueDate}. Let's identify your current skill proficiency and create a learning path to help you achieve it.`,
  },
  { id: 'intro-2', role: 'assistant', text: "What's your current role?" },
]

const PROFICIENCY_PROMPT =
  'Great, select the proficiency level that best matches your current skill level.'
const DONE_MESSAGE =
  "All set! Your learning path is ready below. Let's start building the skills needed to reach your goal."

export default function GoalPage() {
  const [stage, setStage] = useState<Stage>('intro')
  const [messages, setMessages] = useState<AltusMessage[]>(INTRO_MESSAGES)
  const [proficiency, setProficiency] = useState<ProficiencySelections>({})
  const idRef = useRef(0)
  const nextId = () => `m${++idRef.current}`

  const chartMode = stage === 'done' ? 'selfReported' : 'estimated'

  /** Reveal the proficiency self-assessment, optionally recording the role first. */
  const startProficiency = (role?: string) => {
    if (stage !== 'intro') return
    setMessages((prev) => {
      const next = [...prev]
      if (role) next.push({ id: nextId(), role: 'user', text: role })
      next.push({ id: nextId(), role: 'assistant', text: PROFICIENCY_PROMPT })
      return next
    })
    setStage('proficiency')
  }

  const handleSend = (text: string) => {
    if (stage === 'intro') {
      startProficiency(text)
    } else {
      setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }])
    }
  }

  const handleChip = (chip: 'assessment' | 'role') => {
    if (chip === 'role') startProficiency(GOAL.role)
    else startProficiency()
  }

  const handleProficiencySubmit = () => {
    setStage('thinking')
    window.setTimeout(() => {
      setMessages((prev) => [...prev, { id: nextId(), role: 'assistant', text: DONE_MESSAGE }])
      setStage('done')
    }, 1800)
  }

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <UBHeader />
      <div className="flex flex-1 overflow-hidden">
        <LeftRail />
        <div className="grid flex-1 grid-cols-2 overflow-hidden">
          {/* left column — goal + skills + learning path */}
          <div className="overflow-y-auto border-r border-line-subdued px-lg py-md">
            <div className="mx-auto flex max-w-[620px] flex-col gap-md">
              <GoalHeader />
              <SkillsCard
                mode={chartMode}
                onAssess={() => startProficiency()}
                onTakeAssessment={() => startProficiency()}
              />
              <LearningPathCard />
            </div>
          </div>

          {/* right column — Altus */}
          <AltusPanel
            messages={messages}
            thinking={stage === 'thinking'}
            showProficiencyForm={stage === 'proficiency'}
            proficiency={proficiency}
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
