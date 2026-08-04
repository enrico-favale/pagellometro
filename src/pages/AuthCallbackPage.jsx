import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../services/supabaseClient.js'

function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    let ignore = false

    async function handleCallback() {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()

      if (ignore) return

      if (error || !session) {
        navigate('/login', { replace: true })
        return
      }

      navigate('/dashboard', { replace: true })
    }

    handleCallback()

    return () => {
      ignore = true
    }
  }, [navigate])

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <section className="mx-auto max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
        <p className="text-sm text-app-text-muted">Completamento accesso in corso...</p>
      </section>
    </main>
  )
}

export default AuthCallbackPage