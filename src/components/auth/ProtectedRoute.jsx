import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'

function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth()

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-app-bg px-4">
        <p className="text-sm text-app-text-muted">Caricamento sessione...</p>
      </main>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute