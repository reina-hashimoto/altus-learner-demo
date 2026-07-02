import { useRef, useState } from 'react'
import { Flag, Pencil } from 'lucide-react'
import { LeftRail } from '@/components/shell/LeftRail'
import { SkillsCard } from '@/features/goal/SkillsCard'
import { LearningPathCard } from '@/features/goal/LearningPathCard'
import type { ProficiencySelections } from '@/features/goal/SkillProficiencyForm'
import type { ChipDef } from '@/flows/config'
import { PROFICIENCY_LEVELS, type Skill, type Course } from '@/data/goal'
import { AdminHeader } from './AdminHeader'
import { AdminAltusPanel, type AdminMessage, type GoalReview } from './AdminAltusPanel'
import coursePrompt from '@/assets/course-prompt-engineering.png'
import courseHallucination from '@/assets/course-hallucination.png'

// ── Goal-detail content (from Figma "Skills to develop") ──────────────────
const ADMIN_SKILLS: Skill[] = [
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
    id: 'ai-design-thinking',
    name: 'AI-powered Design Thinking',
    description:
      'Apply AI to explore problems, generate solutions, and iterate on design decisions faster.',
    estimated: 40,
    selfReported: 78,
    target: 130,
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

const GOAL_REVIEW: GoalReview = {
  role: 'Senior Product Designer',
  targetDate: 'August 31, 2026',
  weeklyTime: '2 hours',
  skills: [
    { name: 'AI-powered Design Thinking', level: 'Intermediate', source: 'Udemy Assessed' },
    { name: 'Prompt-to-UI Prototyping', level: 'Established', source: 'Self-reported' },
    { name: 'AI/ML Foundations', level: 'Foundational', source: 'Estimated' },
  ],
}

const ROLE_CHIP: ChipDef = { id: 'role', label: 'Update role' }
const ASSESS_CHIP: ChipDef = { id: 'assessment', label: 'Take an assessment' }
const STUDY_CHIP: ChipDef = { id: 'study-time', label: 'Change study time' }
// During the confirm stage a single "Confirm goal" chip drives the flow; it is
// routed by stage (not id) in handleChip.
const CONFIRM_CHIP: ChipDef = { id: 'study-time', label: 'Confirm goal' }

/**
 * Stage machine for the Altus conversation (verbatim Figma copy):
 *  loading      → just submitted; everything skeleton, empty panel
 *  ask-role     → "...What is your role?" (user already stated the goal)
 *  proficiency  → self-report form ("There are 2 skills where we need your input…")
 *  confirm      → "Review your goal" card ("Does this goal look good to you?…")
 *  generating   → "Goal confirmed — generating your learning path…"
 *  done         → skills + path populated; "Here is your personalized learning path 🎉"
 */
type Stage = 'loading' | 'ask-role' | 'proficiency' | 'confirm' | 'generating' | 'done'

/** Local goal header for goal detail — "Personal goal", title + weekly time + Edit. */
function AdminGoalHeader({ ready }: { ready: boolean }) {
  return (
    <div className="flex flex-col gap-xs">
      <div className="flex items-start justify-between gap-md">
        <span className="inline-flex w-fit items-center gap-xs rounded-sm bg-[var(--color-orange-200)] px-xs py-0.5 text-xs font-bold text-ink">
          <Flag className="size-3.5" strokeWidth={2} />
          Personal goal
        </span>
        {ready && (
          <button className="flex shrink-0 items-center gap-xxs text-sm font-bold text-brand hover:text-brand-strong">
            <Pencil className="size-4" strokeWidth={2} />
            Edit
          </button>
        )}
      </div>

      {ready ? (
        <h1 className="text-xxl font-medium leading-tight text-ink">Upskilling in generative AI</h1>
      ) : (
        <div className="flex flex-col gap-xs py-xxs" aria-hidden>
          <div className="skeleton h-6 w-[60%] rounded-round" />
          <div className="skeleton h-3 w-[24%] rounded-round" />
        </div>
      )}

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
 * Screen C — "Skills to develop" (goal detail), node 1046:45588 + sub-states.
 * Thin icon rail + two-column layout (skills / learning-path main column +
 * Altus chat panel). The Altus panel advances a conversation state machine:
 * ask role → self-report proficiency → confirm goal → personalized path.
 */
export function GoalDetailScreen() {
  // Skip straight past the brief "loading" stage into the first question.
  const [stage, setStage] = useState<Stage>('ask-role')
  const [messages, setMessages] = useState<AdminMessage[]>([
    { id: 'u-goal', role: 'user', text: 'I want to upskill in generative AI' },
    {
      id: 'a-role',
      role: 'assistant',
      text: "Let's make sure the plan fits your role and current proficiency. What is your role?",
    },
  ])
  // Pre-seed the skill Altus already assessed (AI-powered Design Thinking =
  // Intermediate); the learner self-reports the other two.
  const [proficiency, setProficiency] = useState<ProficiencySelections>({
    'ai-design-thinking': PROFICIENCY_LEVELS.indexOf('Intermediate'),
  })
  const [thinking, setThinking] = useState(false)
  const idRef = useRef(0)
  const nextId = () => `am${++idRef.current}`

  const ready = stage === 'done'
  const showForm = stage === 'proficiency'
  const review = stage === 'confirm' || stage === 'generating' ? GOAL_REVIEW : null

  // Skills self-reported at/above target → Assess button turns primary + a one-time
  // "make it official" tooltip until acknowledged with "Got it".
  const bandOf = (v: number) => Math.min(Math.floor(v / 50), 3)
  const [assessTipDismissed, setAssessTipDismissed] = useState(false)
  const primaryAssessIds = new Set(
    ready
      ? ADMIN_SKILLS.filter((s) => proficiency[s.id] !== undefined && proficiency[s.id] >= bandOf(s.target)).map((s) => s.id)
      : [],
  )

  const chips: ChipDef[] =
    stage === 'done'
      ? [ASSESS_CHIP, ROLE_CHIP, STUDY_CHIP]
      : stage === 'confirm'
        ? [CONFIRM_CHIP, ROLE_CHIP, STUDY_CHIP]
        : stage === 'proficiency' || stage === 'generating'
          ? []
          : [ROLE_CHIP]

  const push = (m: Omit<AdminMessage, 'id'>) => setMessages((prev) => [...prev, { id: nextId(), ...m }])

  /** ask-role → user answers role → proficiency step. */
  const advanceFromRole = (roleText: string) => {
    push({ role: 'user', text: roleText })
    setThinking(true)
    window.setTimeout(() => {
      setThinking(false)
      push({
        role: 'assistant',
        text: 'There are 2 skills where we need your input to determine your current proficiency.',
        detail:
          "Please self-report your level for each skill. If you're unsure, check the level definitions — or skip for now.",
      })
      setStage('proficiency')
    }, 1200)
  }

  const openProficiency = () => {
    push({
      role: 'assistant',
      text: 'There are 2 skills where we need your input to determine your current proficiency.',
      detail:
        "Please self-report your level for each skill. If you're unsure, check the level definitions — or skip for now.",
    })
    setStage('proficiency')
  }

  const handleSend = (text: string) => {
    if (stage === 'ask-role') {
      advanceFromRole(text)
      return
    }
    if (stage === 'confirm') {
      push({ role: 'user', text })
      confirmGoal()
      return
    }
    push({ role: 'user', text })
  }

  const handleChip = (chip: ChipDef['id']) => {
    if (stage === 'ask-role') {
      advanceFromRole('Senior Product Designer')
      return
    }
    if (stage === 'confirm') {
      // The "Confirm goal" chip (study-time id) confirms; others just echo.
      if (chip === 'study-time') confirmGoal()
      else push({ role: 'user', text: chip === 'role' ? 'Update role' : 'Change study time' })
      return
    }
    if (chip === 'assessment') openProficiency()
    else push({ role: 'user', text: chip === 'role' ? 'Update role' : 'Change study time' })
  }

  /** proficiency form submitted → review/confirm step. */
  const handleProficiencySubmit = () => {
    push({ role: 'user', text: 'Yes makes sense' })
    setThinking(true)
    window.setTimeout(() => {
      setThinking(false)
      push({
        role: 'assistant',
        text: 'Does this goal look good to you? Confirm to create your learning path, or keep refining it if needed.',
      })
      setStage('confirm')
    }, 1200)
  }

  /** confirm → generating → done (path appears). */
  const confirmGoal = () => {
    push({ role: 'assistant', text: 'Goal confirmed — generating your learning path…', spinnerPill: true })
    setStage('generating')
    window.setTimeout(() => {
      push({
        role: 'assistant',
        text: 'Here is your personalized learning path 🎉',
      })
      setStage('done')
    }, 1800)
  }

  return (
    <div className="flex h-screen flex-col bg-surface text-ink">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <LeftRail />
        {/* main content + Altus panel split (matches GoalPage 856 / 440) */}
        <div className="grid flex-1 grid-cols-[856fr_440fr] overflow-hidden">
          <div className="overflow-y-auto bg-surface-pale px-lg py-md">
            <div className="mx-auto flex max-w-[856px] flex-col gap-md">
              <AdminGoalHeader ready={ready} />
              <SkillsCard
                skills={ADMIN_SKILLS}
                role="Sr. Product Designer"
                mode="selfReported"
                skeleton={!ready}
                showRole={ready}
                onAssess={() => handleChip('assessment')}
                onTakeAssessment={() => handleChip('assessment')}
                primaryAssessIds={primaryAssessIds}
                assessOnboardingOpen={primaryAssessIds.size > 0 && !assessTipDismissed}
                onDismissAssessOnboarding={() => setAssessTipDismissed(true)}
              />
              <LearningPathCard courses={ADMIN_COURSES} skeleton={!ready} />
            </div>
          </div>

          <AdminAltusPanel
            messages={messages}
            thinking={thinking}
            showProficiencyForm={showForm}
            review={review}
            skills={ADMIN_SKILLS}
            proficiency={proficiency}
            chips={chips}
            onProficiencyChange={(skillId, levelIndex) =>
              setProficiency((p) => {
                if (levelIndex === null) {
                  const next = { ...p }
                  delete next[skillId]
                  return next
                }
                return { ...p, [skillId]: levelIndex }
              })
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
