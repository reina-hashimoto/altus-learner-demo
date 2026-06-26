import { SKILLS, COURSES, type Skill, type Course } from '@/data/goal'
import type { Persona } from './types'

export interface ChipDef {
  id: 'assessment' | 'role' | 'study-time'
  label: string
}

/** Everything that varies between the 8 flows, in one object. */
export interface FlowConfig {
  goalTitle: string
  /** How Altus names the goal + due date in its opening line. */
  altusGoalName: string
  altusDueDate: string
  role: string
  /** Altus opening messages (assistant). */
  intro: string[]
  /** Final assistant message once the path/skills are ready. */
  doneMessage: string
  chips: ChipDef[]
  /** false → skills card renders as a skeleton until the flow completes. */
  skillsKnown: boolean
  /** fixed/suggested render the path immediately; empty → skeleton until done. */
  pathMode: 'fixed' | 'suggested' | 'empty'
  skills: Skill[]
  courses: Course[]
}

const ROLE_BY_PERSONA: Record<Persona, string> = {
  'product-manager': 'Product Manager',
  'data-scientist': 'Data Scientist',
}

const ROLE_Q = "What's your current role?"
const ASSESS_CHIP: ChipDef = { id: 'assessment', label: 'Take an assessment' }
const ROLE_CHIP: ChipDef = { id: 'role', label: 'Update role' }
const STUDY_CHIP: ChipDef = { id: 'study-time', label: 'Change study time' }

type ScenarioId = 'fixed' | 'flex' | 'open' | 'custom'

/** Per-scenario template; persona only swaps the role string. */
const SCENARIOS: Record<ScenarioId, Omit<FlowConfig, 'role'>> = {
  fixed: {
    goalTitle: 'AI benchmark fluency',
    altusGoalName: 'AI Benchmark Fluency',
    altusDueDate: 'Sept 30, 2026',
    intro: [
      'Your organization has assigned you the goal “AI Benchmark Fluency” by Sept 30, 2026. Let’s identify your current skill proficiency and create a learning path to help you achieve it.',
      ROLE_Q,
    ],
    doneMessage:
      "All set! Your learning path is ready below. Let's start building the skills needed to reach your goal.",
    chips: [ASSESS_CHIP, ROLE_CHIP],
    skillsKnown: true,
    pathMode: 'fixed',
    skills: SKILLS,
    courses: COURSES,
  },
  flex: {
    goalTitle: 'Upskilling in AI',
    altusGoalName: 'Upskilling in AI',
    altusDueDate: 'Sept 30, 2026',
    intro: [
      'Your organization has assigned you the goal “Upskilling in AI” by Sept 30, 2026. Let’s identify your current skill proficiency and create a learning path to help you achieve it.',
      ROLE_Q,
    ],
    doneMessage:
      "I’ve tailored a learning path to your skill levels — review it below and adjust anytime.",
    chips: [ASSESS_CHIP, ROLE_CHIP],
    skillsKnown: true,
    pathMode: 'suggested',
    skills: SKILLS,
    courses: COURSES,
  },
  open: {
    goalTitle: 'Upskilling in AI',
    altusGoalName: 'Upskilling in AI',
    altusDueDate: 'Sept 30, 2026',
    intro: [
      'Your organization has assigned you the goal “Upskilling in AI” by Sept 30, 2026. Let’s identify your current skill proficiency and create a learning path to help you achieve it.',
      ROLE_Q,
    ],
    doneMessage:
      "Based on your skills, I’ve built a learning path to close the gaps. Here it is.",
    chips: [ASSESS_CHIP, ROLE_CHIP, STUDY_CHIP],
    skillsKnown: true,
    pathMode: 'empty',
    skills: SKILLS,
    courses: COURSES,
  },
  custom: {
    goalTitle: 'Upskilling in AI',
    altusGoalName: 'Upskilling in AI',
    altusDueDate: 'Aug 30, 2026',
    intro: [
      'Your organization has assigned you the goal “Upskilling in AI” by Aug 30, 2026. Let’s identify the key skills needed for this goal and create a personalized learning path to help you achieve it.',
      'What is your current role?',
    ],
    doneMessage:
      "Here are the key skills for your goal, plus a learning path to build them. Let’s get started.",
    chips: [ASSESS_CHIP, ROLE_CHIP, STUDY_CHIP],
    skillsKnown: false,
    pathMode: 'empty',
    skills: SKILLS,
    courses: COURSES,
  },
}

/** Map a flow id (e.g. "open-ds") to its scenario + persona config. */
export function getFlowConfig(scenarioId: string, persona: Persona): FlowConfig {
  const base = SCENARIOS[scenarioId as ScenarioId] ?? SCENARIOS.fixed
  return { ...base, role: ROLE_BY_PERSONA[persona] }
}
