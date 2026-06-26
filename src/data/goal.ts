/** Mock data backing the Fixed-LP / Product-Manager goal page. */

export const PROFICIENCY_LEVELS = [
  'Foundational',
  'Intermediate',
  'Established',
  'Advanced',
] as const

export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number]

/** Chart scale runs 0–200; bands of 50 map to the four levels. */
export const SKILL_SCALE_MAX = 200

export interface Skill {
  id: string
  name: string
  description: string
  /** Altus's pre-assessment estimate (0–200). */
  estimated: number
  /** Where the self-assessed level lands once the learner reports it (0–200). */
  selfReported: number
  /** Org target proficiency (0–200). */
  target: number
}

export const SKILLS: Skill[] = [
  {
    id: 'prompting',
    name: 'Prompting AI Effectively',
    description:
      'Provide clear instructions, context, and desired outputs to help AI generate useful and relevant results.',
    estimated: 40,
    selfReported: 78,
    target: 128,
  },
  {
    id: 'evaluating',
    name: 'Evaluating AI Outputs',
    description:
      'Assess AI-generated responses for accuracy, relevance, and potential errors before using them.',
    estimated: 40,
    selfReported: 52,
    target: 132,
  },
  {
    id: 'responsible',
    name: 'Responsible AI Usage',
    description:
      'Use AI responsibly by understanding its limitations, risks, privacy considerations, and ethical implications.',
    estimated: 40,
    selfReported: 78,
    target: 130,
  },
]

import coursePrompt from '@/assets/course-prompt-engineering.png'
import courseHallucination from '@/assets/course-hallucination.png'
import courseResponsible from '@/assets/course-responsible-ai.jpg'

export interface Course {
  id: string
  title: string
  lectures: number
  duration: string
  skillTag: string
  progress: number
  /** real course thumbnail */
  image: string
}

export const COURSES: Course[] = [
  {
    id: 'prompt-eng-101',
    title: 'Prompt Engineering 101 - The Complete Beginner’s Guide',
    lectures: 14,
    duration: '1h 51m',
    skillTag: 'Prompting AI Effectively',
    progress: 0,
    image: coursePrompt,
  },
  {
    id: 'hallucination-mgmt',
    title: 'Hallucination Management for Generative AI',
    lectures: 23,
    duration: '2h 58m',
    skillTag: 'Evaluating AI Outputs',
    progress: 0,
    image: courseHallucination,
  },
  {
    id: 'responsible-ai',
    title: 'Responsible AI: Principles, Risk & Governance',
    lectures: 18,
    duration: '2h 12m',
    skillTag: 'Responsible AI Usage',
    progress: 0,
    image: courseResponsible,
  },
]

export const GOAL = {
  tag: 'Organization goal',
  title: 'AI benchmark fluency',
  daysLeft: '72 more days',
  dueDate: 'By Aug 31, 2026',
  commitment: '1 hour',
  commitmentUnit: '/week',
  role: 'Product Manager',
  /** Date as Altus phrases it in conversation. */
  altusDueDate: 'Sept 30, 2026',
  altusGoalName: 'AI Benchmark Fluency',
}
