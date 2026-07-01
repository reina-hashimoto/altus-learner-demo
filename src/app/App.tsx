import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom'
import { getFlow } from '@/flows/registry'
import FlowIndex from '@/screens/FlowIndex'
import LearningGoalsPage from '@/screens/LearningGoalsPage'

function FlowRoute() {
  const { flowId } = useParams()
  const flow = getFlow(flowId)
  if (!flow?.component) return <Navigate to="/learning-goals" replace />
  const Page = flow.component
  return <Page key={flow.id} />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<FlowIndex />} />
        <Route path="/learning-goals" element={<LearningGoalsPage />} />
        <Route path="/:flowId" element={<FlowRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
