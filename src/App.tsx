import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import MobileNav from './components/layout/MobileNav'
import Dashboard from './pages/Dashboard'
import Plan from './pages/Plan'
import Workout from './pages/Workout'
import History from './pages/History'
import Settings from './pages/Settings'

export default function App() {
  return (
    <div className="min-h-full flex">
      <Sidebar />
      <div className="flex-1">
        
        <main className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/plan" element={<Plan />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
        <MobileNav />
      </div>
    </div>
  )
}
