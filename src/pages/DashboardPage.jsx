import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppButton from '../components/ui/AppButton.jsx'
import AppLogo from '../components/ui/AppLogo.jsx'
import { useAuth } from '../hooks/useAuth.js'

function DashboardPage() {
  const { user, signOut, getMyProfile } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadProfile() {
      try {
        const data = await getMyProfile()
        if (!ignore) {
          setProfile(data)
        }
      } catch (error) {
        if (!ignore) {
          setProfileError(error.message || 'Impossibile caricare il profilo.')
        }
      }
    }

    loadProfile()

    return () => {
      ignore = true
    }
  }, [getMyProfile])

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <section className="mx-auto flex max-w-5xl items-center justify-between rounded-card border border-app-border bg-app-surface p-6 shadow-app">
        <AppLogo />
        <div className="flex items-center gap-4">
          <p className="hidden text-sm text-app-text-muted sm:block">
            {profile?.username || user?.email}
          </p>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-2xl border border-app-border bg-app-surface-2 px-4 py-2 text-sm font-semibold text-app-text transition hover:bg-slate-800"
          >
            Esci
          </button>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
        <h1 className="text-3xl font-black tracking-tight text-app-text">
          Dashboard
        </h1>

        <p className="mt-3 text-sm leading-6 text-app-text-muted">
          Accesso effettuato correttamente.
        </p>

        {profile ? (
          <div className="mt-6 space-y-2 rounded-2xl border border-app-border bg-app-surface-2 p-5 text-sm text-app-text-muted">
            <p>
              <span className="font-semibold text-app-text">Username:</span>{' '}
              {profile.username}
            </p>
            <p>
              <span className="font-semibold text-app-text">Nome:</span>{' '}
              {profile.nome || 'Non impostato'}
            </p>
            <p>
              <span className="font-semibold text-app-text">Cognome:</span>{' '}
              {profile.cognome || 'Non impostato'}
            </p>
            <p>
              <span className="font-semibold text-app-text">Email:</span>{' '}
              {profile.email || user?.email}
            </p>
          </div>
        ) : null}

        {profileError ? (
          <p className="mt-6 rounded-2xl border border-state-danger/30 bg-state-danger/10 px-4 py-3 text-sm text-rose-200">
            {profileError}
          </p>
        ) : null}

        <div className="mt-8 max-w-xs">
          <AppButton to="/" variant="secondary">
            Torna alla homepage
          </AppButton>
        </div>
      </section>
    </main>
  )
}

export default DashboardPage