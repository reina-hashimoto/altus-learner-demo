/**
 * Local mock data for the Personal goal E2E flow. Owned by this directory.
 * The shared `@/data/goal` types describe the canonical goal/skill/course
 * shapes; here we keep the exact copy and numbers the scripted flow needs.
 */
import coursePrompt from '@/assets/course-prompt-engineering.png'
import courseHallucination from '@/assets/course-hallucination.png'
import courseResponsible from '@/assets/course-responsible-ai.jpg'

export const PROFICIENCY_LEVELS = ['Foundational', 'Intermediate', 'Established', 'Advanced'] as const
export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number]

/** Chart scale runs 0–200; four bands of 50 map to the proficiency levels. */
export const SKILL_SCALE_MAX = 200
export const SKILL_TICKS = [0, 50, 100, 150, 200]
export const SKILL_BANDS: ProficiencyLevel[] = ['Foundational', 'Intermediate', 'Established', 'Advanced']

export type SkillSource = 'Estimated' | 'Self-reported' | 'Udemy Verified'

export interface SkillRow {
  id: string
  name: string
  /** Source of the current proficiency reading (drives bar colour + CTA). */
  source: SkillSource
  /** Current proficiency on the 0–200 scale. */
  current: number
  /** Target proficiency (purple dot). */
  target: number
}

/** Skills shown in the embedded proficiency card (steps 6). */
export interface ProficiencySkill {
  id: string
  name: string
  /** When true the level is assessed by Udemy and locked (faded). */
  locked?: boolean
  lockedLabel?: string
  /** Pre-selected level index for a locked/assessed skill. */
  presetLevel?: number
}

export const PROFICIENCY_SKILLS: ProficiencySkill[] = [
  { id: 'prompt-to-ui', name: 'Prompt-to-UI Prototyping' },
  {
    id: 'ai-design-thinking',
    name: 'AI-powered Design Thinking',
    locked: true,
    lockedLabel: 'Assessed by Udemy',
    presetLevel: 1, // Intermediate
  },
  { id: 'ai-ml-foundations', name: 'AI/ML Foundations' },
]

/** The 3-series skills chart shown in the populated left panel (step 8). */
export const POPULATED_SKILLS: SkillRow[] = [
  { id: 'ai-design-thinking', name: 'AI-powered Design Thinking', source: 'Udemy Verified', current: 175, target: 130 },
  { id: 'prompt-to-ui', name: 'Prompt-to-UI Prototyping', source: 'Estimated', current: 60, target: 130 },
  { id: 'ai-ml-foundations', name: 'AI/ML Foundations', source: 'Self-reported', current: 40, target: 130 },
]

export interface PathCourse {
  id: string
  title: string
  /** e.g. "Course • 10 lectures • 97min" */
  meta: string
  tag: string
  progress: number
  image: string
}

/** The initial learning path built at step 8. */
export const INITIAL_PATH: PathCourse[] = [
  {
    id: 'ai-design-thinking-fundamentals',
    title: 'AI Design Thinking : the fundamentals',
    meta: 'Course • 10 lectures • 97min',
    tag: 'AI-powered Design Thinking',
    progress: 100,
    image: courseHallucination,
  },
  {
    id: 'vibe-coding-ux-ui',
    title: 'The Complete Vibe coding for UX/UI Designers',
    meta: 'Course • 5 lectures • 43min',
    tag: 'Prompt-to-UI prototyping',
    progress: 0,
    image: coursePrompt,
  },
  {
    id: 'gen-ai-beginners',
    title: 'Generative AI for Beginners',
    meta: 'Course • 21 lectures • 137min',
    tag: 'AI/ML Foundations',
    progress: 0,
    image: courseResponsible,
  },
]

export interface CourseRec {
  id: string
  title: string
  instructor: string
  duration: string
  level: string
  whyFit: string
  image: string
}

/** The 3 recommendation cards shown at step 10. */
export const COURSE_RECS: CourseRec[] = [
  {
    id: 'chatgpt-marketing',
    title: 'ChatGPT for Marketing: Data Analysis & Customer Insights',
    instructor: 'Anton Voroniuk',
    duration: '9hr',
    level: 'All Levels',
    whyFit:
      'Taking this course will help you improve your prompt-to-UI workflow and apply gen AI to real product research…',
    image: coursePrompt,
  },
  {
    id: 'ai-business-analytics',
    title: 'AI for Business Analytics: Turning Data into Insights',
    instructor: 'KRISHAI Technologies',
    duration: '18hr',
    level: 'All Levels',
    whyFit:
      'Taking this course will help you improve your data-driven decision making with AI-assisted analytics…',
    image: courseHallucination,
  },
  {
    id: 'market-research-ai',
    title: 'Market Research with AI: Analyze Trends and Customer Needs',
    instructor: 'Matt Gerry',
    duration: '11hr',
    level: 'All Levels',
    whyFit:
      'Taking this course will help you improve your ability to spot trends and synthesize customer needs with AI…',
    image: courseResponsible,
  },
]

/** When the learner picks rec "1", course 2 in the path becomes this. */
export const SWAP_COURSE: PathCourse = {
  id: 'chatgpt-marketing',
  title: 'ChatGPT for Marketing: Data Analysis & Customer Insights',
  meta: 'Course • 3 lectures • 32min',
  tag: 'Prompt-to-UI prototyping',
  progress: 0,
  image: coursePrompt,
}

/** Goal header meta for the populated left panel (step 8). */
export const GOAL_META = {
  tag: 'Personal goal',
  title: 'Upskilling in generative AI',
  daysLeft: '120 more days',
  dueDate: 'By Jun 30, 2026',
  commitment: '2 hours',
  commitmentUnit: '/week',
  role: 'Senior Product Designer',
}
