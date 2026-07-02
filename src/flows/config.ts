import {
  SKILLS_AI,
  SKILLS_CUSTOM_PM,
  SKILLS_CUSTOM_DS,
  COURSES_AI,
  COURSES_OPEN_PM,
  COURSES_CUSTOM_PM,
  COURSES_CUSTOM_DS,
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
  /** Flex: after self-assessment, re-optimize each course's lecture count by
   *  whether the learner's skill rose (fewer) or fell (more) vs the estimate. */
  optimizeBySkill?: boolean
  /** "From CPO, John D." label shown in the goal header for org-assigned custom goals. */
  fromLabel?: string
  /** true → skeleton placeholders have no shimmer animation (custom scenario initial state). */
  staticPlaceholder?: boolean
  /** true → show a "Review your goal" confirmation card before generating the path. */
  showGoalConfirmation?: boolean
}

const ROLE_BY_PERSONA: Record<Persona, string> = {
  'product-manager': 'Product Manager',
  'data-scientist': 'Data Scientist',
  'product-designer': 'Product Designer',
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
    altusDueDate: 'Aug 31, 2026',
    intro: [`Your organization has assigned you the goal “AI Benchmark Fluency” by Aug 31, 2026. Let's identify your current skill proficiency and create a learning path to help you achieve it.`, ROLE_Q],
    proficiencyPrompt: PROMPT_DEFAULT,
    doneStyle: 'simple',
    doneMessage: DONE_SIMPLE,
    doneOptions: [],
    chips: [ASSESS_CHIP, ROLE_CHIP],
    skillsKnown: true,
    pathMode: 'fixed',
    fromLabel: 'From CPO, John D.',
    skills: SKILLS_AI,
    courses: COURSES_AI,
  },
  flex: {
    goalTitle: 'Upskilling in Generative AI',
    altusGoalName: 'Upskilling in Generative AI',
    altusDueDate: 'Aug 31, 2026',
    intro: [`VP of Product, Marcus G. has assigned you the goal “Upskilling in Generative AI” by Aug 31, 2026. Let's identify your current skill proficiency and create a learning path to help you achieve it.`, ROLE_Q],
    proficiencyPrompt: PROMPT_DEFAULT,
    doneStyle: 'simple',
    doneMessage: DONE_SIMPLE,
    doneOptions: [],
    chips: [ASSESS_CHIP, ROLE_CHIP],
    skillsKnown: true,
    pathMode: 'suggested',
    fromLabel: 'From VP of Product, Marcus G.',
    skills: SKILLS_AI,
    courses: COURSES_AI,
    // Flex-specific: after self-assessment, keep all courses but re-optimize each
    // course's lecture count by whether the learner's skill rose or fell.
    optimizeBySkill: true,
  },
  open: {
    goalTitle: 'Upskilling in AI',
    altusGoalName: 'AI Benchmark Fluency',
    altusDueDate: 'Aug 31, 2026',
    intro: [`Your organization has assigned you the goal “AI Benchmark Fluency” by Aug 31, 2026. Let's identify your current skill proficiency and create a learning path to help you achieve it.`, ROLE_Q],
    proficiencyPrompt: PROMPT_DEFAULT,
    doneStyle: 'personalized',
    doneMessage: DONE_PERSONALIZED,
    doneOptions: DONE_OPTIONS,
    chips: [ASSESS_CHIP, ROLE_CHIP, STUDY_CHIP],
    skillsKnown: true,
    pathMode: 'empty',
    fromLabel: 'From CPO, John D.',
    skills: SKILLS_AI,
    courses: COURSES_OPEN_PM,
  },
  custom: {
    goalTitle: 'Upskilling in Generative AI',
    altusGoalName: 'Upskilling in Generative AI',
    altusDueDate: 'Aug 31, 2026',
    intro: [`Your organization has assigned you the goal “Upskilling in Generative AI” by Aug 31, 2026. Let's identify the key skills needed for this goal and create a personalized learning path to help you achieve it.`, 'What is your current role?'],
    proficiencyPrompt: PROMPT_CUSTOM,
    doneStyle: 'personalized',
    doneMessage: DONE_PERSONALIZED,
    doneOptions: DONE_OPTIONS,
    chips: [],
    skillsKnown: false,
    pathMode: 'empty',
    fromLabel: 'From CPO, John D.',
    staticPlaceholder: true,
    showGoalConfirmation: true,
    skills: SKILLS_CUSTOM_PM,
    courses: COURSES_CUSTOM_PM,
  },
}

export function getFlowConfig(scenarioId: string, persona: Persona): FlowConfig {
  const base = SCENARIOS[scenarioId as ScenarioId] ?? SCENARIOS.fixed
  const config: FlowConfig = { ...base, role: ROLE_BY_PERSONA[persona] }
  if (scenarioId === 'custom' && persona === 'data-scientist') {
    config.skills = SKILLS_CUSTOM_DS
    config.courses = COURSES_CUSTOM_DS
  }
  return config
}
