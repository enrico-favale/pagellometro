import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import NewCompetitionPage from './pages/NewCompetitionPage.jsx'
import ManageCompetitionPage from './pages/ManageCompetitionPage.jsx'
import MatchDetailsPage from './pages/MatchDetailsPage.jsx'
import EditMatchPage from './pages/EditMatchPage.jsx'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/competitions/new"
        element={
          <ProtectedRoute>
            <NewCompetitionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/competitions/:competitionId/manage"
        element={
          <ProtectedRoute>
            <ManageCompetitionPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/matches/:matchId"
        element={
          <ProtectedRoute>
            <MatchDetailsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/matches/:matchId/edit"
        element={
          <ProtectedRoute>
            <EditMatchPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return <AppRoutes />
}

export default App