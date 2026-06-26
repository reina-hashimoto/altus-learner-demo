import GoalPage from '@/screens/GoalPage'
import type { Flow } from './types'

/**
 * The prototype flow registry — 4 scenarios × 2 personas, all driven by the
 * config-driven GoalPage. Scenario names + numbering match the Figma "Flows"
 * menu (Fixed / Flex / Open / Custom).
 */
function flow(
  id: string,
  scenarioId: string,
  scenario: string,
  scenarioBlurb: string,
  persona: Flow['persona'],
  figmaNodes: string[],
): Flow {
  return { id, scenarioId, scenario, scenarioBlurb, persona, status: 'ready', figmaNodes, component: GoalPage }
}

export const flows: Flow[] = [
  flow('fixed-pm', 'fixed', '2) Fixed', 'Org-curated learning path is fixed up front; the learner self-assesses against it.', 'product-manager', ['7012:70549', '7012:76886', '7012:78718', '7012:80263', '7012:81380', '7012:84343']),
  flow('fixed-ds', 'fixed', '2) Fixed', 'Org-curated learning path is fixed up front; the learner self-assesses against it.', 'data-scientist', ['7012:85306', '7012:85826', '7012:86346', '7012:86866', '7012:87386', '7012:87906']),

  flow('flex-pm', 'flex', '3) Flex', 'Altus tailors a suggested learning path the learner can review and adjust.', 'product-manager', ['7021:15769', '7021:16808', '7021:17847', '7021:18886', '7021:19925', '7021:20964', '7021:30771', '7021:27603', '7021:39827']),
  flow('flex-ds', 'flex', '3) Flex', 'Altus tailors a suggested learning path the learner can review and adjust.', 'data-scientist', ['7021:31722', '7021:32242', '7021:32762', '7021:33282', '7021:33802', '7021:34322', '7021:34848', '7021:35374', '7021:40347']),

  flow('open-pm', 'open', '4) Open', 'No learning path exists yet; Altus builds one from the goal and the learner’s skills.', 'product-manager', ['7021:41705', '7021:43978', '7021:48914', '7021:49943', '7021:50972', '7021:52133']),
  flow('open-ds', 'open', '4) Open', 'No learning path exists yet; Altus builds one from the goal and the learner’s skills.', 'data-scientist', ['7021:53026', '7021:53571', '7021:54116', '7021:54661', '7021:55206', '7021:55712']),

  flow('custom-pm', 'custom', '5) Custom', 'Neither skills nor a path are predefined; Altus defines both with the learner.', 'product-manager', ['7021:58693', '7036:97888', '7036:98754', '7036:99722', '7036:100710', '7036:101746']),
  flow('custom-ds', 'custom', '5) Custom', 'Neither skills nor a path are predefined; Altus defines both with the learner.', 'data-scientist', ['7036:103030', '7036:103586', '7036:104132', '7036:104626', '7036:104986', '7036:105441']),
]

export const defaultFlowId = 'fixed-pm'

export function getFlow(id: string | undefined): Flow | undefined {
  return flows.find((f) => f.id === id)
}
