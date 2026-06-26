import GoalPage from '@/screens/GoalPage'
import type { Flow } from './types'

/**
 * The prototype flow registry — 4 scenarios × 2 personas. Flows flip from
 * `planned` to `ready` (with a component) as each is built.
 */
export const flows: Flow[] = [
  // 1) Fixed LP
  {
    id: 'fixed-lp-pm',
    scenarioId: 'fixed-lp',
    scenario: '1) Fixed LP',
    scenarioBlurb: 'Org-curated learning path is fixed up front; the learner self-assesses against it.',
    persona: 'product-manager',
    status: 'ready',
    figmaNodes: ['7012:70549', '7012:76886', '7012:78718', '7012:80263', '7012:81380', '7012:84343'],
    component: GoalPage,
  },
  {
    id: 'fixed-lp-ds',
    scenarioId: 'fixed-lp',
    scenario: '1) Fixed LP',
    scenarioBlurb: 'Org-curated learning path is fixed up front; the learner self-assesses against it.',
    persona: 'data-scientist',
    status: 'planned',
    figmaNodes: ['7012:85306', '7012:85826', '7012:86346', '7012:86866', '7012:87386', '7012:87906'],
  },
  // 2) Suggested LP
  {
    id: 'suggested-lp-pm',
    scenarioId: 'suggested-lp',
    scenario: '2) Suggested LP',
    scenarioBlurb: 'Altus suggests a learning path the learner reviews and approves. (Longest flow.)',
    persona: 'product-manager',
    status: 'planned',
    figmaNodes: ['7021:15769', '7021:16808', '7021:17847', '7021:18886', '7021:19925', '7021:20964', '7021:30771', '7021:27603', '7021:39827'],
  },
  {
    id: 'suggested-lp-ds',
    scenarioId: 'suggested-lp',
    scenario: '2) Suggested LP',
    scenarioBlurb: 'Altus suggests a learning path the learner reviews and approves. (Longest flow.)',
    persona: 'data-scientist',
    status: 'planned',
    figmaNodes: ['7021:31722', '7021:32242', '7021:32762', '7021:33282', '7021:33802', '7021:34322', '7021:34848', '7021:35374', '7021:40347'],
  },
  // 3) No LP
  {
    id: 'no-lp-pm',
    scenarioId: 'no-lp',
    scenario: '3) No LP',
    scenarioBlurb: 'No learning path exists yet; Altus builds one from the goal and skills.',
    persona: 'product-manager',
    status: 'planned',
    figmaNodes: ['7021:41705', '7021:43978', '7021:48914', '7021:49943', '7021:50972', '7021:52133'],
  },
  {
    id: 'no-lp-ds',
    scenarioId: 'no-lp',
    scenario: '3) No LP',
    scenarioBlurb: 'No learning path exists yet; Altus builds one from the goal and skills.',
    persona: 'data-scientist',
    status: 'planned',
    figmaNodes: ['7021:53026', '7021:53571', '7021:54116', '7021:54661', '7021:55206', '7021:55712'],
  },
  // 4) No Skills + LP
  {
    id: 'no-skills-lp-pm',
    scenarioId: 'no-skills-lp',
    scenario: '4) No Skills + LP',
    scenarioBlurb: 'Neither skills nor a path are predefined; Altus defines both with the learner.',
    persona: 'product-manager',
    status: 'planned',
    figmaNodes: ['7021:58693', '7036:97888', '7036:98754', '7036:99722', '7036:100710', '7036:101746'],
  },
  {
    id: 'no-skills-lp-ds',
    scenarioId: 'no-skills-lp',
    scenario: '4) No Skills + LP',
    scenarioBlurb: 'Neither skills nor a path are predefined; Altus defines both with the learner.',
    persona: 'data-scientist',
    status: 'planned',
    figmaNodes: ['7036:103030', '7036:103586', '7036:104132', '7036:104626', '7036:104986', '7036:105441'],
  },
]

export const defaultFlowId = 'fixed-lp-pm'

export function getFlow(id: string | undefined): Flow | undefined {
  return flows.find((f) => f.id === id)
}
