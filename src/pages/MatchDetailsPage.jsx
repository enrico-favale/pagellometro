import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import AppButton from '../components/ui/AppButton.jsx'
import AppLogo from '../components/ui/AppLogo.jsx'
import { useMatchDetails } from '../hooks/useMatchDetails.js'

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

function PerformanceItem({ performance }) {
  const user = performance.user

  const valutazione = performance.valutazione
  const squadra = performance.squadra
  const descrizione = performance.descrizione

  return (
    <li className="rounded-2xl border border-app-border bg-app-surface px-4 py-4">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full border border-app-border bg-app-surface-2">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={`Avatar di ${user.username || user.nome}`}
              className="h-full w-full object-cover"
              onError={(event) => {
                event.currentTarget.onerror = null
                event.currentTarget.src = '/avatar-placeholder.png'
              }}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-app-text-muted">
              N/A
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="truncate text-base font-bold text-app-text">
                {user?.nome || 'Utente'}
              </p>
              <p className="text-xs text-app-text-muted">
                @{user?.username || 'username non disponibile'}
              </p>
              <p className="text-xs text-app-text-muted">
                Squadra: {squadra || 'Non specificata'}
              </p>
            </div>

            {valutazione != null ? (
              <div className="shrink-0 text-sm font-black text-brand-primary">
                Voto: {Number(valutazione).toFixed(1)}
              </div>
            ) : (
              <div className="shrink-0 text-sm font-semibold text-app-text-muted">
                Voto non disponibile
              </div>
            )}
          </div>

          {descrizione ? (
            <p className="mt-2 text-xs italic text-app-text-muted">
              {descrizione}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  )
}

function MatchDetailsPage() {
  const { matchId } = useParams()
  const { getMatchById } = useMatchDetails()

  const [match, setMatch] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadMatch() {
      try {
        setLoading(true)
        setError('')

        const data = await getMatchById(matchId)

        if (!ignore) {
          setMatch(data)
        }
      } catch (err) {
        if (!ignore) {
          setError(err.message || 'Impossibile caricare il match.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadMatch()

    return () => {
      ignore = true
    }
  }, [matchId, getMatchById])

  const performances = useMemo(
    () => match?.performances || [],
    [match],
  )

  if (loading) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-8">
        <section className="mx-auto max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
          <p className="text-sm text-app-text-muted">Caricamento dettagli match...</p>
        </section>
      </main>
    )
  }

  if (error || !match) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-8">
        <section className="mx-auto max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
          <AppLogo />

          <p className="mt-6 text-sm text-rose-200">
            {error || 'Match non trovato.'}
          </p>

          <div className="mt-6 max-w-xs">
            <AppButton to="/dashboard" variant="secondary">
              Torna alla dashboard
            </AppButton>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <section className="mx-auto max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
        <AppLogo />

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <h1 className="text-3xl font-black tracking-tight text-app-text">
              {match.squadra_a} vs {match.squadra_b}
            </h1>

            <div className="mt-2 flex flex-col gap-1 text-sm text-app-text-muted">
              <span>Data: {formatDateTime(match.data)}</span>
              <span>{match.luogo || 'Luogo non specificato'}</span>
              <span>
                {match.risultato
                  ? `Risultato: ${match.risultato}`
                  : 'Risultato non disponibile'}
              </span>
              <span>
                {match.vincitore
                  ? `Vincitore: ${match.vincitore}`
                  : 'Vincitore non disponibile'}
              </span>
            </div>
          </div>

          <div className="w-full md:w-auto md:min-w-56">
            <Link to={`/matches/${match.id}/edit`}>
              <AppButton variant="secondary">
                Modifica match
              </AppButton>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
        <h2 className="text-2xl font-black tracking-tight text-app-text">
          Giocatori e valutazioni
        </h2>

        <p className="mt-3 text-sm text-app-text-muted">
          Elenco di tutti i giocatori che hanno partecipato al match con i relativi dati di valutazione.
        </p>

        <div className="mt-6">
          {performances.length > 0 ? (
            <ul className="space-y-4">
              {performances.map((performance) => (
                <PerformanceItem
                  key={performance.id}
                  performance={performance}
                />
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-app-border bg-app-surface-2 px-4 py-4 text-sm text-app-text-muted">
              Nessun giocatore inserito per questo match.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl">
        <div className="max-w-xs">
          <AppButton to="/dashboard" variant="secondary">
            Torna alla dashboard
          </AppButton>
        </div>
      </section>
    </main>
  )
}

export default MatchDetailsPage