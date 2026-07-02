/** Mock data backing the goal pages, per scenario × persona (from Figma specs). */
import coursePrompt from '@/assets/course-prompt-engineering.png'
import courseHallucination from '@/assets/course-hallucination.png'
import courseResponsible from '@/assets/course-responsible-ai.jpg'
import thumbRoleplay from '@/assets/thumb-roleplay.png'
import thumbLab from '@/assets/thumb-lab.png'

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
  /** Instructor name — shown after the duration in the meta line when present. */
  instructor?: string
  /** Content type — drives the meta line. Defaults to a video 'course'. */
  kind?: 'course' | 'roleplay' | 'lab' | 'assessment'
  /** Full meta line for non-course items, e.g. "Role Play • Gen AI • 1hr - 2hr". */
  metaText?: string
  /** Flex: lecture/duration when the learner's skill rose above the estimate. */
  optimized?: { lectures: number; duration: string }
  /** Flex: lecture/duration when the learner's skill fell below the estimate. */
  expanded?: { lectures: number; duration: string }
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
// optimized = fewer lectures when the skill rose above the estimate (already
// mastered content trimmed); expanded = more when the skill fell below it.
export const COURSES_AI = courses([
  { id: 'prompt-eng-101', title: 'Prompt Engineering 101 - The Complete Beginner’s Guide', lectures: 14, duration: '1h 51m', skillTag: 'Prompting AI Effectively', optimized: { lectures: 9, duration: '53m' }, expanded: { lectures: 18, duration: '2h 30m' } },
  { id: 'hallucination-mgmt', title: 'Hallucination Management for Generative AI', lectures: 23, duration: '2h 58m', skillTag: 'Evaluating AI Outputs', optimized: { lectures: 16, duration: '2h 05m' }, expanded: { lectures: 28, duration: '3h 40m' } },
  { id: 'responsible-ai', title: 'Responsible AI: Principles, Risk & Governance', lectures: 18, duration: '2h 12m', skillTag: 'Responsible AI Usage', optimized: { lectures: 12, duration: '1h 25m' }, expanded: { lectures: 23, duration: '2h 50m' } },
])

/** What kind of hands-on practice the learner asked Altus to add to the flex path. */
export type FlexExtraChoice = 'both' | 'roleplay' | 'lab'

// Title templates — a few phrasings per type so the generated items don't all
// read identically across skills. Picked by a stable hash of the skill id.
const ROLEPLAY_TITLES = [
  (n: string) => `Role Play: ${n} in Real Scenarios`,
  (n: string) => `Practice ${n} with an AI Partner`,
  (n: string) => `${n} — Live Role Play Simulation`,
  (n: string) => `On-the-Job Role Play: ${n}`,
]
const LAB_TITLES = [
  (n: string) => `Hands-On Lab: Build with ${n}`,
  (n: string) => `${n} in Action — Guided Lab`,
  (n: string) => `Applied ${n}: Project Lab`,
  (n: string) => `${n} Workshop: Hands-On Practice`,
]

/**
 * Flex: build Role Play / Hands-on Lab extras — one of each requested type per
 * skill, titled to the skill with some variety (each skill gets a different
 * phrasing). Thumbnails use the dedicated role-play / lab art. Callers pass only
 * skills that haven't reached target yet.
 */
export function makeFlexExtras(skills: Skill[], choice: FlexExtraChoice): Course[] {
  const out: Course[] = []
  skills.forEach((s, i) => {
    if (choice === 'roleplay' || choice === 'both') {
      out.push({
        id: `roleplay-${s.id}`,
        title: ROLEPLAY_TITLES[i % ROLEPLAY_TITLES.length](s.name),
        lectures: 0,
        duration: '',
        skillTag: s.name,
        kind: 'roleplay',
        metaText: 'Role Play • Gen AI • 1hr - 2hr',
        progress: 0,
        image: thumbRoleplay,
      })
    }
    if (choice === 'lab' || choice === 'both') {
      out.push({
        id: `lab-${s.id}`,
        // Offset so a skill's lab phrasing differs from its role-play phrasing.
        title: LAB_TITLES[(i + 1) % LAB_TITLES.length](s.name),
        lectures: 0,
        duration: '',
        skillTag: s.name,
        kind: 'lab',
        metaText: 'Labs • Gen AI • 1hr - 2hr',
        progress: 0,
        image: thumbLab,
      })
    }
  })
  return out
}

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

// ── Custom-scenario Product Designer skills (mapped by role) ──────────────
export const SKILLS_CUSTOM_DESIGN: Skill[] = [
  { id: 'ai-native-ux', name: 'Designing AI-Native Experiences', description: 'Design intuitive product experiences where AI is a core part of the interface and user flow.', estimated: 40, selfReported: 78, target: 130 },
  { id: 'ai-proto-design', name: 'AI-Powered Prototyping', description: 'Use generative AI and vibe-coding tools to rapidly prototype and test design concepts.', estimated: 40, selfReported: 45, target: 130 },
  { id: 'ai-visual', name: 'Generative AI for Visual Design', description: 'Apply generative AI to create visuals, design systems, and content at scale.', estimated: 40, selfReported: 78, target: 130 },
]

// ── Custom: Altus-built Product Designer path (one course per skill) ───────
export const COURSES_CUSTOM_DESIGN = courses([
  { id: 'design-ai-native', title: 'Designing AI-Native Experiences: A UX Playbook', lectures: 21, duration: '1h 42m', skillTag: 'Designing AI-Native Experiences' },
  { id: 'ux-proto-vibe', title: 'Rapid UX Prototyping with AI and Vibe Coding', lectures: 18, duration: '2h 03m', skillTag: 'AI-Powered Prototyping' },
  { id: 'genai-visual', title: 'Generative AI for Visual & Product Design', lectures: 20, duration: '1h 55m', skillTag: 'Generative AI for Visual Design' },
])

// ── Custom-scenario DS skills (Altus-defined) ─────────────────────────────
export const SKILLS_CUSTOM_DS: Skill[] = [
  { id: 'ai-model-dev', name: 'AI Model Development', description: 'Build, fine-tune, and deploy machine learning models that leverage generative AI capabilities.', estimated: 75, selfReported: 78, target: 175 },
  { id: 'ai-eval-bench', name: 'AI Evaluation and Benchmarking', description: 'Design and run evaluation pipelines to measure AI model quality, reliability, and alignment.', estimated: 75, selfReported: 45, target: 175 },
  { id: 'ai-ops-monitor', name: 'AI Operations and Monitoring', description: 'Operate AI models in production, including monitoring, alerting, and continuous improvement.', estimated: 25, selfReported: 78, target: 125 },
]

// ── Custom: Altus-built DS path (DS-specific skills) ──────────────────────
// One course per skill so every below-target skill always has a suggestion.
export const COURSES_CUSTOM_DS = courses([
  { id: 'genai-model-dev', title: 'Fine-Tuning and Deploying Generative AI Models', lectures: 22, duration: '2h 31m', skillTag: 'AI Model Development' },
  { id: 'llm-eval', title: 'LLM Evaluation and Benchmarking in Practice', lectures: 25, duration: '2h 14m', skillTag: 'AI Evaluation and Benchmarking' },
  { id: 'mlops-ai', title: 'MLOps and AI Monitoring Essentials', lectures: 17, duration: '1h 49m', skillTag: 'AI Operations and Monitoring' },
])

/** Goal meta shared across all scenarios (timeline + weekly commitment). */
export const GOAL_META = {
  tag: 'Organization goal',
  daysLeft: '72 more days',
  dueDate: 'By Aug 31, 2026',
  commitment: '1 hour',
  commitmentUnit: '/week',
}
