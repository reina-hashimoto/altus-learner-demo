/** Mock data backing the goal pages, per scenario × persona (from Figma specs). */
import coursePrompt from '@/assets/course-prompt-engineering.png'
import courseHallucination from '@/assets/course-hallucination.png'
import courseResponsible from '@/assets/course-responsible-ai.jpg'

export const PROFICIENCY_LEVELS = ['Foundational', 'Intermediate', 'Established', 'Advanced'] as const
export type ProficiencyLevel = (typeof PROFICIENCY_LEVELS)[number]

/** Chart scale runs 0–200; bands of 50 map to the four levels. */
export const SKILL_SCALE_MAX = 200

export interface Skill {
  id: string
  name: string
  description: string
  estimated: number
  selfReported: number
  target: number
}

export interface Course {
  id: string
  title: string
  lectures: number
  duration: string
  skillTag: string
  progress: number
  image: string
}

const THUMBS = [coursePrompt, courseHallucination, courseResponsible]

// ── Generic AI skills (Fixed / Flex / Open) ───────────────────────────────
export const SKILLS_AI: Skill[] = [
  { id: 'prompting', name: 'Prompting AI Effectively', description: 'Provide clear instructions, context, and desired outputs to help AI generate useful and relevant results.', estimated: 40, selfReported: 78, target: 128 },
  { id: 'evaluating', name: 'Evaluating AI Outputs', description: 'Assess AI-generated responses for accuracy, relevance, and potential errors before using them.', estimated: 40, selfReported: 45, target: 132 },
  { id: 'responsible', name: 'Responsible AI Usage', description: 'Use AI responsibly by understanding its limitations, risks, privacy considerations, and ethical implications.', estimated: 40, selfReported: 78, target: 130 },
]

// ── Custom-scenario PM skills (Altus-defined) ─────────────────────────────
export const SKILLS_CUSTOM_PM: Skill[] = [
  { id: 'ai-native', name: 'AI-Native Product Development', description: 'Design products and workflows that leverage AI as a core part of the user experience.', estimated: 40, selfReported: 78, target: 130 },
  { id: 'ai-proto', name: 'AI-Powered Prototyping', description: 'Use AI tools and vibe coding techniques to rapidly prototype and validate product ideas.', estimated: 40, selfReported: 45, target: 130 },
  { id: 'ai-analytics', name: 'AI-Assisted Product Analytics', description: 'Use AI to analyze user behavior, generate insights, and build KPI dashboards for decision-making.', estimated: 40, selfReported: 78, target: 130 },
]

function courses(defs: Omit<Course, 'image' | 'progress'>[]): Course[] {
  return defs.map((d, i) => ({ ...d, progress: 0, image: THUMBS[i % THUMBS.length] }))
}

// ── Fixed / Flex: org-curated generic AI path ─────────────────────────────
export const COURSES_AI = courses([
  { id: 'prompt-eng-101', title: 'Prompt Engineering 101 - The Complete Beginner’s Guide', lectures: 14, duration: '1h 51m', skillTag: 'Prompting AI Effectively' },
  { id: 'hallucination-mgmt', title: 'Hallucination Management for Generative AI', lectures: 23, duration: '2h 58m', skillTag: 'Evaluating AI Outputs' },
  { id: 'responsible-ai', title: 'Responsible AI: Principles, Risk & Governance', lectures: 18, duration: '2h 12m', skillTag: 'Responsible AI Usage' },
])

/** Flex tailors the first course shorter after self-assessment. */
export const FLEX_TAILORED_FIRST = { lectures: 9, duration: '53m' }

// ── Open: Altus-built PM path (generic skills) ────────────────────────────
export const COURSES_OPEN_PM = courses([
  { id: 'prompt-strategy', title: 'Prompt Engineering for Product Strategy and Requirements', lectures: 22, duration: '2h 35m', skillTag: 'Prompting AI Effectively' },
  { id: 'eval-ai-ux', title: 'Evaluating AI Features and User Experience', lectures: 18, duration: '2h 10m', skillTag: 'Evaluating AI Outputs' },
  { id: 'responsible-decisions', title: 'Responsible AI for Product Decision-Making', lectures: 16, duration: '1h 50m', skillTag: 'Responsible AI Usage' },
])

// ── Custom: Altus-built PM path (PM-specific skills) ──────────────────────
export const COURSES_CUSTOM_PM = courses([
  { id: 'build-ai-native', title: 'Building AI-Native Products: From Idea to Launch', lectures: 24, duration: '1h 37m', skillTag: 'AI-Native Product Development' },
  { id: 'rapid-proto', title: 'Rapid Product Prototyping with AI and Vibe Coding', lectures: 18, duration: '2h 03m', skillTag: 'AI-Powered Prototyping' },
  { id: 'kpi-dashboards', title: 'Creating Product KPI Dashboards with AI', lectures: 19, duration: '1h 58m', skillTag: 'AI-Assisted Product Analytics' },
])

/** Goal meta shared across all scenarios (timeline + weekly commitment). */
export const GOAL_META = {
  tag: 'Organization goal',
  daysLeft: '72 more days',
  dueDate: 'By Aug 31, 2026',
  commitment: '1 hour',
  commitmentUnit: '/week',
}
