import { useState } from 'react'
import { useParams } from 'react-router-dom'
import GoalPage from '@/screens/GoalPage'
import CustomGoalFlow from '@/screens/beta/custom/CustomGoalFlow'
import { AssignedGoalHome } from './AssignedGoalHome'

/**
 * Entry gate for admin-assigned scenarios: shows the Udemy Business homepage with
 * the assigned-goal banner first, then renders the goal's dashboard flow when the
 * learner clicks "View the plan". Banner copy matches each scenario's own goal.
 */
interface HomeEntry {
  assigner: string
  goalTitle: string
  dueLabel: string
  /** Which dashboard flow to render after the homepage. */
  inner: 'goalpage' | 'custom'
}

const HOME_CONFIG: Record<string, HomeEntry> = {
  'flex-pm': {
    assigner: 'VP of Product, Marcus G.',
    goalTitle: 'Upskilling in Generative AI',
    dueLabel: 'the end of August, 2026',
    inner: 'goalpage',
  },
  'custom-pm': {
    assigner: 'CPO, John D.',
    goalTitle: 'Upskilling in Generative AI',
    dueLabel: 'the end of August, 2026',
    inner: 'custom',
  },
  'custom-design': {
    assigner: 'CPO, John D.',
    goalTitle: 'Upskilling in Generative AI',
    dueLabel: 'the end of August, 2026',
    inner: 'custom',
  },
}

export default function HomeGate() {
  const { flowId } = useParams()
  const cfg = HOME_CONFIG[flowId ?? '']
  const [entered, setEntered] = useState(false)

  if (cfg && !entered) {
    return (
      <AssignedGoalHome
        assigner={cfg.assigner}
        goalTitle={cfg.goalTitle}
        dueLabel={cfg.dueLabel}
        onViewPlan={() => setEntered(true)}
      />
    )
  }
  return cfg?.inner === 'custom' ? <CustomGoalFlow /> : <GoalPage />
}
