import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { getFlow } from '@/flows/registry'
import FlowIndex from '@/screens/FlowIndex'
import LearningGoalsPage from '@/screens/LearningGoalsPage'
import PlayerPage from '@/screens/beta/personal/PlayerPage'
import SkillsProfilePage from '@/screens/beta/skills-profile/SkillsProfilePage'

function FlowRoute() {
  const { flowId } = useParams()
  const flow = getFlow(flowId)
  if (!flow?.component) return <Navigate to="/learning-goals" replace />
  const Page = flow.component
  return <Page key={flow.id} />
}

// When hosted under a sub-path (GitHub Pages project site), Vite sets BASE_URL to
// e.g. "/altus-learner-demo/". Strip the trailing slash for the router basename.
const BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <BrowserRouter basename={BASENAME}>
      <Routes>
        <Route path="/" element={<LearningGoalsPage />} />
        <Route path="/learning-goals" element={<LearningGoalsPage />} />
        {/* Full list of prototype scenario variants — reachable only via the
            "View all scenario variants" link at the bottom of Learning goals. */}
        <Route path="/scenarios" element={<FlowIndex />} />
        <Route path="/skills-profile" element={<SkillsProfilePage />} />
        <Route path="/:flowId/player" element={<PlayerPage />} />
        <Route path="/:flowId" element={<FlowRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
