import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AppButton from '../components/ui/AppButton.jsx'
import AppLogo from '../components/ui/AppLogo.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useCompetitions } from '../hooks/useCompetitions.js'

function formatDateTime(value) {
  if (!value) return 'Data non disponibile'

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatDateOnly(value) {
  if (!value) return 'Data non disponibile'

  const date = new Date(`${value}T00:00:00`)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('it-IT', {
    dateStyle: 'medium',
  }).format(date)
}

function formatCompetitionPeriod(startDate, endDate) {
  if (!startDate && !endDate) return 'Periodo non disponibile'
  if (startDate && !endDate) return `Dal ${formatDateOnly(startDate)}`
  if (!startDate && endDate) return `Fino al ${formatDateOnly(endDate)}`
  return `${formatDateOnly(startDate)} - ${formatDateOnly(endDate)}`
}

function getMatchesLabel(count) {
  if (count === 1) return '1 match'
  return `${count} match`
}

function MatchActions({ matchId, canEdit }) {
  return (
    <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center">
      <Link
        to={`/matches/${matchId}`}
        className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-app-border bg-app-surface-2 px-4 py-2 text-sm font-semibold text-app-text transition hover:border-brand-primary hover:text-brand-primary"
      >
        Visualizza dettagli
      </Link>

      {canEdit ? (
        <Link
          to={`/matches/${matchId}/edit`}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brand-primary px-4 py-2 text-sm font-semibold text-slate-50 transition hover:bg-brand-primary-hover"
        >
          Modifica match
        </Link>
      ) : null}
    </div>
  )
}

function MatchItem({ match, canEdit }) {
  return (
    <li className="rounded-2xl border border-app-border bg-app-surface px-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-bold text-app-text">
            {match.squadra_a} vs {match.squadra_b}
          </p>

          <p className="mt-1 text-xs text-app-text-muted">
            {formatDateTime(match.data)}
          </p>
        </div>

        <div className="flex flex-col items-start gap-1 text-xs text-app-text-muted md:items-end">
          <span>{match.luogo || 'Luogo non specificato'}</span>
          <span>{match.risultato || 'Risultato non disponibile'}</span>
          <span>
            {match.vincitore
              ? `Vincitore: ${match.vincitore}`
              : 'Vincitore non disponibile'}
          </span>
        </div>
      </div>

      <MatchActions matchId={match.id} canEdit={canEdit} />
    </li>
  )
}

function CompetitionSection({ competition, currentUserId }) {
  const isOwner = competition.owner_id === currentUserId
  const matches = competition.matches || []

  return (
    <section className="rounded-card border border-app-border bg-app-surface p-6 shadow-app">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h2 className="text-xl font-black tracking-tight text-app-text">
            {competition.nome}
          </h2>

          <p className="mt-2 text-sm leading-6 text-app-text-muted">
            {competition.descrizione || 'Nessuna descrizione disponibile.'}
          </p>

          <div className="mt-2 flex flex-col gap-1 text-xs text-app-text-muted">
            <span>Sport: {competition.sport}</span>
            <span>{formatCompetitionPeriod(competition.data_inizio, competition.data_fine)}</span>
            <span>{getMatchesLabel(matches.length)}</span>
          </div>
        </div>

        {isOwner ? (
          <div className="w-full md:w-auto md:min-w-48">
            <AppButton
              to={`/competitions/${competition.id}/manage`}
              variant="secondary"
            >
              Gestisci competizione
            </AppButton>
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        {matches.length > 0 ? (
          <ul className="space-y-3">
            {matches.map((match) => (
              <MatchItem
                key={match.id}
                match={match}
                canEdit={isOwner}
              />
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-app-border bg-app-surface-2 px-4 py-4 text-sm text-app-text-muted">
            Nessun match presente in questa competizione.
          </div>
        )}
      </div>
    </section>
  )
}

function DashboardPage() {
  const { user, signOut, getMyProfile } = useAuth()
  const { getMyCompetitions } = useCompetitions()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)
  const [profileError, setProfileError] = useState('')

  const [competitions, setCompetitions] = useState([])
  const [competitionsError, setCompetitionsError] = useState('')
  const [loadingCompetitions, setLoadingCompetitions] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadProfile() {
      try {
        const data = await getMyProfile()

        if (!ignore) {
          setProfile(data)
          setProfileError('')
        }
      } catch (error) {
        if (!ignore) {
          setProfileError(error.message || 'Impossibile caricare il profilo.')
        }
      }
    }

    async function loadCompetitions() {
      try {
        setLoadingCompetitions(true)
        const data = await getMyCompetitions()

        if (!ignore) {
          setCompetitions(data || [])
          setCompetitionsError('')
        }
      } catch (error) {
        if (!ignore) {
          setCompetitionsError(
            error.message || 'Impossibile caricare le competizioni.',
          )
        }
      } finally {
        if (!ignore) {
          setLoadingCompetitions(false)
        }
      }
    }

    loadProfile()
    loadCompetitions()

    return () => {
      ignore = true
    }
  }, [getMyProfile, getMyCompetitions])

  async function handleSignOut() {
    await signOut()
    navigate('/', { replace: true })
  }

  const displayName = useMemo(() => {
    return profile?.username || profile?.nome || user?.email || 'Utente'
  }, [profile, user])

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <section className="mx-auto flex max-w-5xl items-center justify-between gap-4 rounded-card border border-app-border bg-app-surface p-6 shadow-app">
        <AppLogo />

        <div className="flex items-center gap-4">
          <Link
            to="/profile"
            aria-label="Apri il tuo profilo"
            className="block h-11 w-11 overflow-hidden rounded-full border border-app-border bg-app-surface-2 transition hover:border-brand-primary"
          >
            <img
              src={profile?.avatar_url || '/avatar-placeholder.png'}
              alt="Avatar profilo"
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = '/avatar-placeholder.png'
              }}
            />
          </Link>

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
          Benvenuto <span className="text-brand-primary">{displayName}!</span>
        </h1>

        <p className="mt-3 text-sm leading-6 text-app-text-muted">
          Qui trovi tutte le competizioni in cui partecipi o hai partecipato,
          organizzate per sezione con i match che le compongono.
        </p>
      </section>

      {/* <section className="mx-auto mt-8 max-w-5xl">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-black tracking-tight text-app-text">
            Le tue statistiche
          </h2>
        </div>

        <div className="mt-6 rounded-card border border-app-border bg-app-surface p-6 text-sm text-app-text-muted shadow-app">
          Non ci sono statistiche disponibili al momento. Le statistiche saranno visibili una volta che avrai partecipato a competizioni e match.
        </div>
      </section> */}

      <section className="mx-auto mt-8 max-w-5xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-app-text">
              Le tue competizioni
            </h2>
            <p className="mt-2 text-sm text-app-text-muted">
              Apri una competizione per vedere i match già presenti oppure
              creane una nuova.
            </p>
          </div>

          <div className="w-full md:w-auto md:min-w-56">
            <AppButton to="/competitions/new">
              Crea nuova competizione
            </AppButton>
          </div>
        </div>

        {loadingCompetitions ? (
          <div className="mt-6 rounded-card border border-app-border bg-app-surface p-6 text-sm text-app-text-muted shadow-app">
            Caricamento competizioni...
          </div>
        ) : null}

        {competitionsError ? (
          <div className="mt-6 rounded-2xl border border-state-danger/30 bg-state-danger/10 px-4 py-3 text-sm text-rose-200">
            {competitionsError}
          </div>
        ) : null}

        {!loadingCompetitions && !competitionsError && competitions.length === 0 ? (
          <div className="mt-6 rounded-card border border-app-border bg-app-surface p-6 shadow-app">
            <p className="text-sm text-app-text-muted">
              Non partecipi ancora a nessuna competizione.
            </p>
          </div>
        ) : null}

        {!loadingCompetitions && !competitionsError && competitions.length > 0 ? (
          <div className="mt-6 space-y-6">
            {competitions.map((competition) => (
              <CompetitionSection
                key={competition.id}
                competition={competition}
                currentUserId={user?.id}
              />
            ))}
          </div>
        ) : null}
      </section>

      <section className="mx-auto mt-8 max-w-5xl">
        <div className="max-w-xs">
          <AppButton to="/" variant="secondary">
            Torna alla homepage
          </AppButton>
        </div>
      </section>
    </main>
  )
}

export default DashboardPage