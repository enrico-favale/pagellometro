import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AuthDivider from '../components/auth/AuthDivider.jsx'
import GoogleAuthButton from '../components/auth/GoogleAuthButton.jsx'
import AuthShell from '../components/layout/AuthShell.jsx'
import AppButton from '../components/ui/AppButton.jsx'
import { useAuth } from '../hooks/useAuth.js'

function RegisterPage() {
  const { signInWithGoogle, signUpWithPassword, isAuthenticated, loading } =
    useAuth()

  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [submitting, setSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

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
    setSuccessMessage('')

    const normalizedUsername = formData.username.trim()

    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Le password non coincidono.')
      return
    }

    if (!/^[A-Za-z0-9_]+$/.test(normalizedUsername)) {
      setErrorMessage(
        'Lo username può contenere solo lettere, numeri e underscore.',
      )
      return
    }

    if (normalizedUsername.length < 3 || normalizedUsername.length > 30) {
      setErrorMessage('Lo username deve essere lungo tra 3 e 30 caratteri.')
      return
    }

    setSubmitting(true)

    try {
      await signUpWithPassword({
        email: formData.email.trim(),
        password: formData.password,
        username: normalizedUsername,
        nome: formData.nome.trim(),
        cognome: formData.cognome.trim(),
      })

      setSuccessMessage(
        "Registrazione completata. Se la conferma email è attiva su Supabase, controlla l'email prima di accedere.",
      )
    } catch (error) {
      setErrorMessage(error.message || 'Impossibile completare la registrazione.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleGoogleAuth() {
    setErrorMessage('')
    setSuccessMessage('')
    setSubmitting(true)

    try {
      await signInWithGoogle()
    } catch (error) {
      setErrorMessage(
        error.message || 'Impossibile avviare la registrazione con Google.',
      )
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Registrati"
      subtitle="Crea il tuo profilo per iniziare a gestire competizioni, partite e pagelle."
    >
      <GoogleAuthButton onClick={handleGoogleAuth} disabled={submitting}>
        Registrati con Google
      </GoogleAuthButton>

      <AuthDivider />

      <form className="space-y-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="nome"
            className="mb-2 block text-sm font-medium text-app-text"
          >
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            value={formData.nome}
            onChange={handleChange}
            placeholder="Mario"
            className="w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
          />
        </div>

        <div>
          <label
            htmlFor="cognome"
            className="mb-2 block text-sm font-medium text-app-text"
          >
            Cognome
          </label>
          <input
            id="cognome"
            name="cognome"
            type="text"
            value={formData.cognome}
            onChange={handleChange}
            placeholder="Rossi"
            className="w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
          />
        </div>

        <div>
          <label
            htmlFor="username"
            className="mb-2 block text-sm font-medium text-app-text"
          >
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            placeholder="mario_rossi"
            className="w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
            required
          />
          <p className="mt-2 text-xs text-app-text-faint">
            Solo lettere, numeri e underscore. Da 3 a 30 caratteri.
          </p>
        </div>

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
            placeholder="Crea una password"
            className="w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
            required
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-2 block text-sm font-medium text-app-text"
          >
            Conferma password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Ripeti la password"
            className="w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
            required
          />
        </div>

        {errorMessage ? (
          <p className="rounded-2xl border border-state-danger/30 bg-state-danger/10 px-4 py-3 text-sm text-rose-200">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="rounded-2xl border border-state-success/30 bg-state-success/10 px-4 py-3 text-sm text-emerald-200">
            {successMessage}
          </p>
        ) : null}

        <AppButton type="submit">
          {submitting ? 'Creazione account...' : 'Crea account'}
        </AppButton>
      </form>

      <p className="mt-6 text-center text-sm text-app-text-muted">
        Hai già un account?{' '}
        <Link
          to="/login"
          className="font-medium text-brand-primary hover:text-brand-primary-hover"
        >
          Accedi
        </Link>
      </p>
    </AuthShell>
  )
}

export default RegisterPage