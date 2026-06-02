import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/LoginPage'
import { Portal } from '@/views/Portal'
import { Kanban } from '@/views/Kanban'
import { Dashboard } from '@/views/Dashboard'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/portal" element={<Portal />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/kanban" replace />} />
              <Route path="/kanban" element={<Kanban />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/kanban" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
