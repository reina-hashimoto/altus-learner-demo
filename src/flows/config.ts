import {
  SKILLS_AI,
  SKILLS_CUSTOM_PM,
  COURSES_AI,
  COURSES_OPEN_PM,
  COURSES_CUSTOM_PM,
  FLEX_TAILORED_FIRST,
  type Skill,
  type Course,
} from '@/data/goal'
import type { Persona } from './types'

export interface ChipDef {
  id: 'assessment' | 'role' | 'study-time'
  label: string
}

export interface FlowConfig {
  goalTitle: string
  altusGoalName: string
  altusDueDate: string
  role: string
  intro: string[]
  proficiencyPrompt: string
  /** simple = "All set!"; personalized = "Here is your personalized path 🎉" + options. */
  doneStyle: 'simple' | 'personalized'
  doneMessage: string
  doneOptions: string[]
  chips: ChipDef[]
  /** false → skills card is a skeleton until the proficiency step (Custom). */
  skillsKnown: boolean
  /** fixed/suggested render the path immediately; empty → skeleton until done. */
  pathMode: 'fixed' | 'suggested' | 'empty'
  skills: Skill[]
  courses: Course[]
  /** Flex: shorten the first course after self-assessment. */
  tailorFirstCourse?: { lectures: number; duration: string }
}

const ROLE_BY_PERSONA: Record<Persona, string> = {
  'product-manager': 'Product Manager',
  'data-scientist': 'Data Scientist',
}

const ROLE_Q = "What's your current role?"
const PROMPT_DEFAULT = 'Great, select the proficiency level that best matches your current skill level.'
const PROMPT_CUSTOM =
  "Great, we've identified the key skills needed for this goal. Select the proficiency level that best matches your current skill level."
const DONE_SIMPLE = "All set! Your learning path is ready. Let's start building the skills needed to achieve your goal."
const DONE_PERSONALIZED = 'Here is your personalized learning path designed to help close your skill gaps and reach your goal 🎉'
const DONE_OPTIONS = ['Change weekly study time', 'Update role', 'Update proficiency', 'Refine learning path']

const ASSESS_CHIP: ChipDef = { id: 'assessment', label: 'Take an assessment' }
const ROLE_CHIP: ChipDef = { id: 'role', label: 'Update role' }
const STUDY_CHIP: ChipDef = { id: 'study-time', label: 'Change study time' }

type ScenarioId = 'fixed' | 'flex' | 'open' | 'custom'

const SCENARIOS: Record<ScenarioId, Omit<FlowConfig, 'role'>> = {
  fixed: {
    goalTitle: 'AI benchmark fluency',
    altusGoalName: 'AI Benchmark Fluency',
    altusDueDate: 'Sept 30, 2026',
    intro: [`Your organization has assigned you the goal “AI Benchmark Fluency” by Sept 30, 2026. Let's identify your current skill proficiency and create a learning path to help you achieve it.`, ROLE_Q],
    proficiencyPrompt: PROMPT_DEFAULT,
    doneStyle: 'simple',
    doneMessage: DONE_SIMPLE,
    doneOptions: [],
    chips: [ASSESS_CHIP, ROLE_CHIP],
    skillsKnown: true,
    pathMode: 'fixed',
    skills: SKILLS_AI,
    courses: COURSES_AI,
  },
  flex: {
    goalTitle: 'Upskilling in AI',
    altusGoalName: 'AI Benchmark Fluency',
    altusDueDate: 'Sept 30, 2026',
    intro: [`Your organization has assigned you the goal “AI Benchmark Fluency” by Sept 30, 2026. Let's identify your current skill proficiency and create a learning path to help you achieve it.`, ROLE_Q],
    proficiencyPrompt: PROMPT_DEFAULT,
    doneStyle: 'simple',
    doneMessage: DONE_SIMPLE,
    doneOptions: [],
    chips: [ASSESS_CHIP, ROLE_CHIP],
    skillsKnown: true,
    pathMode: 'suggested',
    skills: SKILLS_AI,
    courses: COURSES_AI,
    tailorFirstCourse: FLEX_TAILORED_FIRST,
  },
  open: {
    goalTitle: 'Upskilling in AI',
    altusGoalName: 'AI Benchmark Fluency',
    altusDueDate: 'Sept 30, 2026',
    intro: [`Your organization has assigned you the goal “AI Benchmark Fluency” by Sept 30, 2026. Let's identify your current skill proficiency and create a learning path to help you achieve it.`, ROLE_Q],
    proficiencyPrompt: PROMPT_DEFAULT,
    doneStyle: 'personalized',
    doneMessage: DONE_PERSONALIZED,
    doneOptions: DONE_OPTIONS,
    chips: [ASSESS_CHIP, ROLE_CHIP, STUDY_CHIP],
    skillsKnown: true,
    pathMode: 'empty',
    skills: SKILLS_AI,
    courses: COURSES_OPEN_PM,
  },
  custom: {
    goalTitle: 'Upskilling in AI',
    altusGoalName: 'Upskilling in AI',
    altusDueDate: 'Aug 30, 2026',
    intro: [`Your organization has assigned you the goal “Upskilling in AI” by Aug 30, 2026. Let's identify the key skills needed for this goal and create a personalized learning path to help you achieve it.`, 'What is your current role?'],
    proficiencyPrompt: PROMPT_CUSTOM,
    doneStyle: 'personalized',
    doneMessage: DONE_PERSONALIZED,
    doneOptions: DONE_OPTIONS,
    chips: [ASSESS_CHIP, ROLE_CHIP, STUDY_CHIP],
    skillsKnown: false,
    pathMode: 'empty',
    skills: SKILLS_CUSTOM_PM,
    courses: COURSES_CUSTOM_PM,
  },
}

export function getFlowConfig(scenarioId: string, persona: Persona): FlowConfig {
  const base = SCENARIOS[scenarioId as ScenarioId] ?? SCENARIOS.fixed
  return { ...base, role: ROLE_BY_PERSONA[persona] }
}
