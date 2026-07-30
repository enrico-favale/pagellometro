import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import AuthDivider from '../components/auth/AuthDivider.jsx'
import GoogleAuthButton from '../components/auth/GoogleAuthButton.jsx'
import AuthShell from '../components/layout/AuthShell.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import { useAuth } from '../hooks/useAuth.js'

function LoginPage() {
  const { signInWithGoogle, signInWithPassword, isAuthenticated, loading } =
    useAuth()

  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrorMessage('')
    setSubmitting(true)

    try {
      await signInWithPassword(formData)
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setErrorMessage(
        error.message ||
          'Credenziali non valide oppure account disponibile solo con login social.',
      )
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleAuth() {
    setErrorMessage('')
    setSubmitting(true)

    try {
      await signInWithGoogle()
    } catch (error) {
      setErrorMessage(error.message || 'Impossibile avviare il login con Google.')
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Accedi"
      subtitle="Entra nel tuo account per gestire competizioni, partite e pagelle."
    >
      <GoogleAuthButton onClick={handleGoogleAuth} disabled={submitting}>
        Continua con Google
      </GoogleAuthButton>

      <AuthDivider />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="mb-2 block text-sm font-medium text-app-text"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="nome@email.com"
            className="w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-sm font-medium text-app-text"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Inserisci la password"
            className="w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
            required
          />
        </div>

        {errorMessage ? (
          <p className="rounded-2xl border border-state-danger/30 bg-state-danger/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </p>
        ) : null}

        <AppButton type="submit" className="disabled:opacity-60">
          {submitting ? 'Accesso in corso...' : 'Accedi'}
        </AppButton>
      </form>

      <p className="mt-6 text-center text-sm text-app-text-muted">
        Non hai un account?{' '}
        <Link
          to="/register"
          className="font-medium text-brand-primary hover:text-brand-primary-hover"
        >
          Registrati
        </Link>
      </p>
    </AuthShell>
  )
}

export default LoginPage