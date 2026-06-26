import { useState } from 'react'
import { SetupScreen } from './SetupScreen'
import { StreakHomeScreen } from './StreakHomeScreen'
import { GoalDetailScreen } from './GoalDetailScreen'

type AdminScreen = 'setup' | 'streak-home' | 'goal-detail'

/**
 * Admin goal end-to-end prototype. Click-through:
 *   setup → (submit prompt / pick suggestion) → streak-home
 *   streak-home → (See details) → goal-detail
 * State is held locally; no router dependency.
 */
export default function AdminGoalFlow() {
  const [screen, setScreen] = useState<AdminScreen>('setup')

  if (screen === 'setup') {
    return <SetupScreen onSubmit={() => setScreen('streak-home')} />
  }
  if (screen === 'streak-home') {
    return <StreakHomeScreen onSeeDetails={() => setScreen('goal-detail')} />
  }
  return <GoalDetailScreen />
}
