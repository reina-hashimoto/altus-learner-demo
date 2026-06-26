import { useRef, useState } from 'react'
import { Flag, Pencil } from 'lucide-react'
import { LeftRail } from '@/components/shell/LeftRail'
import { SkillsCard } from '@/features/goal/SkillsCard'
import { LearningPathCard } from '@/features/goal/LearningPathCard'
import { AltusPanel, type AltusMessage } from '@/features/goal/altus/AltusPanel'
import type { ProficiencySelections } from '@/features/goal/SkillProficiencyForm'
import type { ChipDef } from '@/flows/config'
import type { Skill, Course } from '@/data/goal'
import { AdminHeader } from './AdminHeader'
import coursePrompt from '@/assets/course-prompt-engineering.png'
import courseHallucination from '@/assets/course-hallucination.png'

// ── Screen C content (from Figma "Skills to develop") ─────────────────────
const ADMIN_SKILLS: Skill[] = [
  {
    id: 'ai-design-thinking',
    name: 'AI-powered Design Thinking',
    description:
      'Apply AI to explore problems, generate solutions, and iterate on design decisions faster.',
    estimated: 40,
    selfReported: 78,
    target: 130,
  },
  {
    id: 'prompt-to-ui',
    name: 'Prompt-to-UI Prototyping',
    description:
      'Use AI to quickly turn ideas and prompts into UI concepts and interactive prototypes.',
    estimated: 40,
    selfReported: 60,
    target: 132,
  },
  {
    id: 'ai-ml-foundations',
    name: 'AI/ML Foundations',
    description:
      'Understanding of AI and machine learning concepts to design responsibly and effectively.',
    estimated: 40,
    selfReported: 45,
    target: 128,
  },
]

const ADMIN_COURSES: Course[] = [
  {
    id: 'ai-design-fundamentals',
    title: 'AI Design Thinking: the fundamentals',
    lectures: 16,
    duration: '1h 48m',
    skillTag: 'AI-powered Design Thinking',
    progress: 0,
    image: coursePrompt,
  },
  {
    id: 'genai-beginners',
    title: 'Generative AI for Beginners',
    lectures: 21,
    duration: '2h 34m',
    skillTag: 'AI/ML Foundations',
    progress: 0,
    image: courseHallucination,
  },
]

const ADMIN_CHIPS: ChipDef[] = [
  { id: 'assessment', label: 'Take an assessment' },
  { id: 'role', label: 'Update role' },
]

const INTRO_MESSAGES: AltusMessage[] = [
  {
    id: 'a-intro-1',
    role: 'assistant',
    text: "Here's your goal to upskill in generative AI. I've identified the key skills to develop and built a learning path to help you get there.",
  },
  {
    id: 'a-intro-2',
    role: 'assistant',
    text: 'Take an assessment to validate your current proficiency, or ask me anything about your plan.',
  },
]

/** Local goal header for screen C — "Personal goal", role label + Edit link. */
function AdminGoalHeader() {
  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-start justify-between gap-md">
        <span className="inline-flex w-fit items-center gap-xs rounded-sm bg-[var(--color-orange-200)] px-xs py-0.5 text-xs font-bold text-ink">
          <Flag className="size-3.5" strokeWidth={2} />
          Personal goal
        </span>
        <button className="flex shrink-0 items-center gap-xxs text-sm font-bold text-brand hover:text-brand-strong">
          <Pencil className="size-4" strokeWidth={2} />
          Edit
        </button>
      </div>

      <h1 className="text-xxl font-medium leading-tight text-ink">Upskilling in generative AI</h1>

      <div className="mt-xxs flex items-center gap-md text-sm text-ink-subdued">
        <span className="flex items-center gap-xs">
          <span className="font-bold text-ink">2 hours</span>
          <span>/ week</span>
        </span>
      </div>
    </div>
  )
}

/**
 * Screen C — "Skills to develop" (goal detail). Thin icon rail + two-column
 * layout (skills/learning-path main column + Altus chat panel). Reuses the
 * shared SkillsCard / LearningPathCard / AltusPanel with admin-specific data.
 */
export function GoalDetailScreen() {
  const [messages, setMessages] = useState<AltusMessage[]>(INTRO_MESSAGES)
  const [proficiency, setProficiency] = useState<ProficiencySelections>({})
  const [showForm, setShowForm] = useState(false)
  const [thinking, setThinking] = useState(false)
  const idRef = useRef(0)
  const nextId = () => `am${++idRef.current}`

  const beginAssessment = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: nextId(),
        role: 'assistant',
        text: 'Great — select the proficiency level that best matches your current skill level.',
      },
    ])
    setShowForm(true)
  }

  const handleSend = (text: string) => {
    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text }])
  }

  const handleChip = (chip: ChipDef['id']) => {
    if (chip === 'assessment' || chip === 'role') beginAssessment()
    else handleSend('Change study time')
  }

  const handleProficiencySubmit = () => {
    setShowForm(false)
    setThinking(true)
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: nextId(), role: 'assistant', text: 'Skill proficiency updated', pill: true },
        {
          id: nextId(),
          role: 'assistant',
          text: "Your learning path is ready. Let's start building the skills needed to achieve your goal.",
        },
      ])
      setThinking(false)
    }, 1600)
  }

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <LeftRail />
        {/* content area / Altus panel split (matches GoalPage) */}
        <div className="grid flex-1 grid-cols-[856fr_480fr] overflow-hidden">
          <div className="overflow-y-auto bg-surface-pale px-lg py-md">
            <div className="mx-auto flex max-w-[860px] flex-col gap-md">
              <AdminGoalHeader />
              <SkillsCard
                skills={ADMIN_SKILLS}
                role="Sr. Product Designer"
                mode="selfReported"
                showRole
                onAssess={beginAssessment}
                onTakeAssessment={beginAssessment}
              />
              <LearningPathCard courses={ADMIN_COURSES} />
            </div>
          </div>

          <AltusPanel
            messages={messages}
            thinking={thinking}
            showProficiencyForm={showForm}
            skills={ADMIN_SKILLS}
            proficiency={proficiency}
            chips={ADMIN_CHIPS}
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
