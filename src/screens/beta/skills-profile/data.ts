/**
 * Local mock data for the Skills profile page — a Sales Representative's skill
 * set. Separate from the goal-flow data on purpose (different directory / page).
 */

export type SkillSource = 'estimated' | 'self-reported' | 'verified'

export interface ProfileSkill {
  id: string
  name: string
  description: string
  source: SkillSource
  /** Current proficiency on the 0–200 scale (band centre for estimated/self-reported). */
  current: number
  /** Target proficiency on the 0–200 scale. */
  target: number
  /** Topic filter bucket. */
  topic: string
  /** Learning-goal filter bucket (goal name). */
  goal: string
  /**
   * Score a Udemy assessment would award for this skill (only for skills with a
   * matching assessment, i.e. not `estimated`). Some exceed the target (→ green
   * bar + sparkle), some don't (→ Udemy-Verified purple bar, animation only).
   */
  assessScore?: number
}

/** Chart scale + bands. */
export const SCALE_MAX = 200
export const TICKS = [0, 50, 100, 150, 200]
export const BANDS = ['Beginning', 'Developing', 'Established', 'Advanced'] as const

/** Topic filter options (assessment team's topic list — keep aligned). */
export const TOPIC_OPTIONS = [
  'Business (role-based)',
  'Business (soft skills)',
  'Cloud',
  'Cybersecurity',
  'Data & Analytics',
  'Design',
  'IT Operations',
  'Software & Development',
  'Tech',
]

/** Assessment-type (source) filter options. */
export const SOURCE_OPTIONS: { label: string; value: SkillSource }[] = [
  { label: 'Estimated', value: 'estimated' },
  { label: 'Self-reported', value: 'self-reported' },
  { label: 'Udemy Verified', value: 'verified' },
]

/** Learning-goal filter options — the goals listed on the Learning goals page. */
export const GOAL_OPTIONS = [
  'Upskilling in generative AI',
  'AI benchmark fluency',
  'Upskilling in AI',
  'Build AI expertise',
  'Upskilling in Generative AI',
]

export const SALES_SKILLS: ProfileSkill[] = [
  {
    id: 'ai-sales-comm',
    name: 'AI-assisted Sales Communication',
    description: 'Use AI to draft, personalize, and refine outreach and customer conversations.',
    source: 'self-reported',
    current: 75,
    target: 130,
    topic: 'Business (soft skills)',
    goal: 'Upskilling in generative AI',
    assessScore: 142, // exceeds target → green + sparkle
  },
  {
    id: 'market-analysis',
    name: 'Market Analysis with AI',
    description: 'Analyze market trends and opportunities with AI-assisted research tools.',
    source: 'self-reported',
    current: 25,
    target: 120,
    topic: 'Data & Analytics',
    goal: 'AI benchmark fluency',
    assessScore: 95, // below target → Udemy Verified purple
  },
  {
    id: 'sales-content',
    name: 'AI-powered Sales Content Development',
    description: 'Generate and iterate on sales collateral, decks, and one-pagers with AI.',
    source: 'verified',
    current: 109,
    target: 130,
    topic: 'Business (role-based)',
    goal: 'Upskilling in AI',
    assessScore: 152, // retake exceeds target → green + sparkle
  },
  {
    id: 'sales-data',
    name: 'Sales Data Analysis',
    description: 'Interpret pipeline and performance data to guide decisions with AI support.',
    source: 'self-reported',
    current: 25,
    target: 90,
    topic: 'Data & Analytics',
    goal: 'Build AI expertise',
    assessScore: 78, // below target → purple
  },
  {
    id: 'crm-optimization',
    name: 'CRM Optimization',
    description: 'Configure and optimize CRM workflows and automation for sales productivity.',
    source: 'verified',
    current: 118,
    target: 130,
    topic: 'IT Operations',
    goal: 'AI benchmark fluency',
    assessScore: 120, // retake still below target → purple
  },
  {
    id: 'customer-segmentation',
    name: 'Customer Segmentation',
    description: 'Group and prioritize customers using AI-driven segmentation techniques.',
    source: 'verified',
    current: 108,
    target: 130,
    topic: 'Data & Analytics',
    goal: 'Build AI expertise',
    assessScore: 145, // retake exceeds → green + sparkle
  },
  {
    id: 'ai-prompting-sales',
    name: 'AI Prompting for Sales',
    description: 'Craft effective prompts to get reliable, on-brand outputs for sales tasks.',
    source: 'self-reported',
    current: 25,
    target: 130,
    topic: 'Business (role-based)',
    goal: 'Upskilling in generative AI',
    assessScore: 138, // exceeds → green + sparkle
  },
  {
    id: 'prompt-to-ui',
    name: 'Prompt-to-UI Prototyping',
    description: 'Use AI to quickly turn ideas and prompts into UI concepts and interactive prototypes.',
    source: 'estimated',
    current: 130,
    target: 130,
    topic: 'Design',
    goal: 'Upskilling in Generative AI',
    // no assessScore → estimated skills open the Set-proficiency modal
  },
  {
    id: 'sales-forecasting',
    name: 'Sales Forecasting',
    description: 'Predict revenue and pipeline outcomes with AI-assisted forecasting models.',
    source: 'verified',
    current: 120,
    target: 140,
    topic: 'Data & Analytics',
    goal: 'Build AI expertise',
    assessScore: 128, // retake below target → purple
  },
  {
    id: 'competitive-analysis',
    name: 'Competitive Analysis',
    description: 'Assess competitors and positioning using AI-gathered market intelligence.',
    source: 'self-reported',
    current: 25,
    target: 130,
    topic: 'Business (role-based)',
    goal: 'Upskilling in AI',
    assessScore: 140, // exceeds → green + sparkle
  },
  {
    id: 'presentation-skills',
    name: 'Presentation Skills',
    description: 'Structure and deliver compelling sales presentations with AI assistance.',
    source: 'self-reported',
    current: 25,
    target: 130,
    topic: 'Business (soft skills)',
    goal: 'Upskilling in generative AI',
    assessScore: 85, // below target → purple
  },
]

export const PROFILE_ROLE_DEFAULT = 'Sales Representative'
