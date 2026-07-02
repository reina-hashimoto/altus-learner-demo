/**
 * Local mock data for the Personal goal E2E flow.
 *
 * Conforms to the shared `@/data/goal` `Skill` / `Course` types so the flow can
 * reuse the polished flex-pm components (SkillChart, SkillProficiencyForm,
 * LearningPathCard, AltusPanel, AssessmentModal) for full visual parity.
 *
 * There is no pre-existing recommended path for this scenario: the plan is
 * generated fresh at Confirm as a final set of five items (one course per target
 * skill + one Role Play + one Hands-on Lab), so courses carry no optimize/expand
 * variants and every skill keeps a card until it's individually verified.
 */
import type { Skill, Course } from '@/data/goal'
import illusDesignThinking from '@/assets/illus-design-thinking.png'
import illusVibeCoding from '@/assets/illus-vibe-coding.png'
import illusGenAi from '@/assets/illus-gen-ai.png'
import thumbRolePlay from '@/assets/thumb-roleplay.png'
import thumbLab from '@/assets/thumb-lab.png'

/** The three target skills for "Upskilling in generative AI" (with descriptions). */
export const PERSONAL_SKILLS: Skill[] = [
  {
    id: 'prompt-to-ui',
    name: 'Prompt-to-UI Prototyping',
    description:
      'Turn natural-language prompts into working UI prototypes with AI tools, iterating quickly from idea to interactive mockup.',
    estimated: 40,
    selfReported: 78,
    target: 130,
  },
  {
    id: 'ai-design-thinking',
    name: 'AI-powered Design Thinking',
    description:
      'Apply design-thinking methods augmented by AI to research, ideate, and validate product experiences faster.',
    estimated: 40,
    selfReported: 78,
    target: 130,
  },
  {
    id: 'ai-ml-foundations',
    name: 'AI/ML Foundations',
    description:
      'Understand core generative-AI and machine-learning concepts — models, prompting, and evaluation — enough to collaborate confidently.',
    estimated: 40,
    selfReported: 45,
    // Intermediate target (band 50–99) — a lower bar than the other two skills.
    target: 75,
  },
]

/**
 * Per-skill assessment score (0–200). Each is distinct and lands above the
 * skill's target (130) within the Established band, so no two skills show 148.
 */
export const PERSONAL_EARNED_SCORES: Record<string, number> = {
  'prompt-to-ui': 141, // Established target (130) → 141
  'ai-design-thinking': 147, // Established target (130) → 147
  'ai-ml-foundations': 88, // Intermediate target (75) → 88 (Intermediate band, above target)
}

/**
 * The final learning path shown all at once after the build loading bar:
 * one video course per target skill (3) + one Role Play + one Hands-on Lab, so
 * every skill has at least one card until it's individually verified.
 */
export const PERSONAL_COURSES: Course[] = [
  {
    id: 'ai-design-thinking-fundamentals',
    title: 'AI Design Thinking : the fundamentals',
    lectures: 14,
    duration: '2h',
    instructor: 'Mei Chen',
    skillTag: 'AI-powered Design Thinking',
    progress: 0,
    image: illusDesignThinking,
  },
  {
    id: 'vibe-coding-ux-ui',
    title: 'The Complete Vibe Coding for UX/UI Designers',
    lectures: 23,
    duration: '3h',
    instructor: 'Daniel Walter Scott',
    skillTag: 'Prompt-to-UI Prototyping',
    progress: 0,
    image: illusVibeCoding,
  },
  {
    id: 'gen-ai-beginners',
    title: 'Generative AI for Beginners',
    lectures: 9,
    duration: '1h 30m',
    instructor: 'Anton Voroniuk',
    skillTag: 'AI/ML Foundations',
    progress: 0,
    image: illusGenAi,
  },
  {
    id: 'roleplay-design-critique',
    title: 'Role Play: Facilitate an AI-assisted Design Critique',
    lectures: 0,
    duration: '',
    skillTag: 'AI-powered Design Thinking',
    progress: 0,
    image: thumbRolePlay,
    kind: 'roleplay',
    metaText: 'Role Play • Gen AI • 1hr - 2hr',
  },
  {
    id: 'lab-prototype-build',
    title: 'Hands-on Lab: Build a Prompt-to-UI Prototype',
    lectures: 0,
    duration: '',
    skillTag: 'Prompt-to-UI Prototyping',
    progress: 0,
    image: thumbLab,
    kind: 'lab',
    metaText: 'Labs • Gen AI • 1hr - 2hr',
  },
]

/** Instructor shown in the video player, keyed by course id. */
export const COURSE_INSTRUCTOR: Record<string, string> = {
  'ai-design-thinking-fundamentals': 'Mei Chen',
  'vibe-coding-ux-ui': 'Daniel Walter Scott',
  'gen-ai-beginners': 'Anton Voroniuk',
  'ai-design-thinking-alt': 'Vandana Verma',
  'roleplay-design-critique': 'Altus practice',
  'lab-prototype-build': 'Altus practice',
}

/**
 * Alternate-instructor version of a video course. When the learner says an
 * instructor's teaching style doesn't click and asks for someone else on the
 * same topic, the matching path card swaps to this one. Keyed by original id.
 */
export const INSTRUCTOR_SWAPS: Record<string, Course> = {
  'ai-design-thinking-fundamentals': {
    id: 'ai-design-thinking-alt',
    title: 'Design Thinking with AI: A Hands-first Approach',
    lectures: 12,
    duration: '1h 30m',
    instructor: 'Vandana Verma',
    skillTag: 'AI-powered Design Thinking',
    progress: 0,
    image: illusDesignThinking,
  },
}

/** Goal header meta for the personal goal (mutable weeklyTime lives in flow state). */
export const PERSONAL_GOAL = {
  title: 'Upskilling in generative AI',
  daysLeft: '120 more days',
  dueDate: 'By Jun 30, 2026',
  defaultWeekly: '1 hour/week',
  targetDate: 'June 30, 2026',
}
