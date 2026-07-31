import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppButton from '../components/ui/AppButton.jsx'
import AppLogo from '../components/ui/AppLogo.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useCompetitionCreation } from '../hooks/useCompetitionCreation.js'

const sportOptions = [
  { value: 'calcio', label: 'Calcio' },
  { value: 'calcetto', label: 'Calcetto' },
  { value: 'basket', label: 'Basket' },
  { value: 'pallavolo', label: 'Pallavolo' },
  { value: 'tennis', label: 'Tennis' },
  { value: 'padel', label: 'Padel' },
  { value: 'ping_pong', label: 'Ping pong' },
  { value: 'beach_volley', label: 'Beach volley' },
  { value: 'biliardino', label: 'Biliardino' },
  { value: 'freccette', label: 'Freccette' },
  { value: 'rugby', label: 'Rugby' },
  { value: 'baseball', label: 'Baseball' },
  { value: 'futsal', label: 'Futsal' },
  { value: 'altro', label: 'Altro' },
]

function UserSearchResult({ user, onAdd, disabled }) {
  return (
    <button
      type="button"
      onClick={() => onAdd(user)}
      disabled={disabled}
      className="flex w-full items-center justify-between rounded-2xl border border-app-border bg-app-surface px-4 py-3 text-left transition hover:border-brand-primary disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-app-text">
          {user.username}
        </p>
        <p className="truncate text-xs text-app-text-muted">
          {user.nome || 'Nome non impostato'}
          {user.email ? ` • ${user.email}` : ''}
        </p>
      </div>

      <span className="ml-4 text-xs font-semibold text-brand-primary">
        Aggiungi
      </span>
    </button>
  )
}

function SelectedMemberItem({ user, onRemove, isOwner }) {
  return (
    <li className="flex items-center justify-between rounded-2xl border border-app-border bg-app-surface px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-app-text">
          {user.username}
        </p>
        <p className="truncate text-xs text-app-text-muted">
          {isOwner ? 'Creatore della competizione' : user.nome || user.email || 'Utente selezionato'}
        </p>
      </div>

      {!isOwner ? (
        <button
          type="button"
          onClick={() => onRemove(user.id)}
          className="text-xs font-semibold text-rose-300 transition hover:text-rose-200"
        >
          Rimuovi
        </button>
      ) : (
        <span className="text-xs font-semibold text-brand-primary">
          Admin
        </span>
      )}
    </li>
  )
}

function NewCompetitionPage() {
  const { user, getMyProfile } = useAuth()
  const { searchProfiles, createCompetition } = useCompetitionCreation()
  const navigate = useNavigate()

  const [profile, setProfile] = useState(null)

  const [nome, setNome] = useState('')
  const [dataInizio, setDataInizio] = useState('')
  const [dataFine, setDataFine] = useState('')
  const [sport, setSport] = useState('')
  const [descrizione, setDescrizione] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  const [selectedMembers, setSelectedMembers] = useState([])
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let ignore = false

    async function loadProfile() {
      try {
        const data = await getMyProfile()
        if (!ignore) {
          setProfile(data)
        }
      } catch {
        if (!ignore) {
          setProfile(null)
        }
      }
    }

    loadProfile()

    return () => {
      ignore = true
    }
  }, [getMyProfile])

  useEffect(() => {
    let ignore = false

    async function runSearch() {
      const trimmed = searchTerm.trim()

      if (trimmed.length < 2) {
        setSearchResults([])
        setSearchError('')
        return
      }

      try {
        setSearchLoading(true)
        setSearchError('')
        const results = await searchProfiles(trimmed)

        if (!ignore) {
          setSearchResults(results || [])
        }
      } catch (error) {
        if (!ignore) {
          setSearchResults([])
          setSearchError(error.message || 'Impossibile cercare gli utenti.')
        }
      } finally {
        if (!ignore) {
          setSearchLoading(false)
        }
      }
    }

    const timeoutId = window.setTimeout(runSearch, 300)

    return () => {
      ignore = true
      window.clearTimeout(timeoutId)
    }
  }, [searchProfiles, searchTerm])

  const ownerUser = useMemo(() => {
    if (!user?.id) return null

    return {
      id: user.id,
      username: profile?.username || profile?.nome || user.email || 'Tu',
      nome: profile?.nome || '',
      email: profile?.email || user.email || '',
    }
  }, [profile, user])

  const selectedMemberIds = useMemo(
    () => new Set(selectedMembers.map((member) => member.id)),
    [selectedMembers],
  )

  function handleAddMember(member) {
    if (selectedMemberIds.has(member.id) || member.id === user?.id) {
      return
    }

    setSelectedMembers((current) => [...current, member])
  }

  function handleRemoveMember(memberId) {
    setSelectedMembers((current) =>
      current.filter((member) => member.id !== memberId),
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    if (!nome.trim()) {
      setSubmitError('Inserisci il nome della competizione.')
      return
    }

    if (!dataInizio) {
      setSubmitError('Inserisci la data di inizio.')
      return
    }

    if (!sport) {
      setSubmitError('Seleziona uno sport.')
      return
    }

    if (dataFine && dataFine < dataInizio) {
      setSubmitError('La data di fine non può essere precedente alla data di inizio.')
      return
    }

    try {
      setSubmitting(true)

      const competition = await createCompetition({
        nome: nome.trim(),
        data_inizio: dataInizio,
        data_fine: dataFine || null,
        sport,
        descrizione: descrizione.trim(),
        memberIds: selectedMembers.map((member) => member.id),
      })

      navigate(`/competitions/${competition.id}/manage`, { replace: true })
    } catch (error) {
      setSubmitError(error.message || 'Impossibile creare la competizione.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <section className="mx-auto max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
        <AppLogo />

        <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-app-text">
              Crea una nuova competizione
            </h1>

            <p className="mt-2 text-sm leading-6 text-app-text-muted">
              Inserisci i dati della competizione e seleziona le persone che
              potranno partecipare.
            </p>
          </div>

          <div className="w-full max-w-xs">
            <AppButton to="/dashboard" variant="secondary">
              Torna alla dashboard
            </AppButton>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <section className="rounded-2xl border border-app-border bg-app-surface-2 p-6">
            <h2 className="text-lg font-black tracking-tight text-app-text">
              Dati competizione
            </h2>

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-app-text">
                  Nome competizione
                </span>
                <input
                  type="text"
                  value={nome}
                  onChange={(event) => setNome(event.target.value)}
                  placeholder="Es. Torneo del sabato"
                  className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-app-text">
                  Sport
                </span>
                <select
                  value={sport}
                  onChange={(event) => setSport(event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
                >
                  <option value="">Seleziona uno sport</option>
                  {sportOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-app-text">
                  Data inizio
                </span>
                <input
                  type="date"
                  value={dataInizio}
                  onChange={(event) => setDataInizio(event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-app-text">
                  Data fine
                </span>
                <input
                  type="date"
                  value={dataFine}
                  onChange={(event) => setDataFine(event.target.value)}
                  className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-app-text">
                  Descrizione
                </span>
                <textarea
                  rows="4"
                  value={descrizione}
                  onChange={(event) => setDescrizione(event.target.value)}
                  placeholder="Descrivi brevemente la competizione"
                  className="w-full rounded-2xl border border-app-border bg-app-surface px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-app-border bg-app-surface-2 p-6">
            <h2 className="text-lg font-black tracking-tight text-app-text">
              Partecipanti
            </h2>

            <p className="mt-2 text-sm text-app-text-muted">
              Cerca gli utenti registrati e aggiungili alla competizione. Tu
              sarai inserito automaticamente come creatore e admin.
            </p>

            <div className="mt-6">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-app-text">
                  Cerca utenti
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Cerca per username, nome o email"
                  className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
                />
              </label>

              <div className="mt-4 rounded-2xl border border-app-border bg-app-bg p-3">
                {searchTerm.trim().length < 2 ? (
                  <p className="text-sm text-app-text-muted">
                    Inserisci almeno 2 caratteri per cercare un utente.
                  </p>
                ) : searchLoading ? (
                  <p className="text-sm text-app-text-muted">
                    Ricerca in corso...
                  </p>
                ) : searchError ? (
                  <p className="text-sm text-rose-200">
                    {searchError}
                  </p>
                ) : searchResults.length === 0 ? (
                  <p className="text-sm text-app-text-muted">
                    Nessun utente trovato.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {searchResults.map((result) => (
                      <UserSearchResult
                        key={result.id}
                        user={result}
                        onAdd={handleAddMember}
                        disabled={selectedMemberIds.has(result.id) || result.id === user?.id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-sm font-bold text-app-text">
                  Creatore
                </h3>

                <ul className="mt-3 space-y-2">
                  {ownerUser ? (
                    <SelectedMemberItem
                      user={ownerUser}
                      onRemove={() => {}}
                      isOwner
                    />
                  ) : null}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-app-text">
                  Utenti selezionati
                </h3>

                {selectedMembers.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {selectedMembers.map((member) => (
                      <SelectedMemberItem
                        key={member.id}
                        user={member}
                        onRemove={handleRemoveMember}
                        isOwner={false}
                      />
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3 rounded-2xl border border-dashed border-app-border bg-app-surface px-4 py-4 text-sm text-app-text-muted">
                    Non hai ancora selezionato partecipanti.
                  </div>
                )}
              </div>
            </div>
          </section>

          {submitError ? (
            <div className="rounded-2xl border border-state-danger/30 bg-state-danger/10 px-4 py-3 text-sm text-rose-200">
              {submitError}
            </div>
          ) : null}

          <div className="flex flex-col gap-3 md:flex-row md:justify-end">
            <div className="w-full md:w-auto md:min-w-48">
              <AppButton to="/dashboard" variant="secondary">
                Annulla
              </AppButton>
            </div>

            <div className="w-full md:w-auto md:min-w-56">
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-slate-50 transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? 'Creazione in corso...' : 'Crea competizione'}
              </button>
            </div>
          </div>
        </form>
      </section>
    </main>
  )
}

export default NewCompetitionPage