import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppButton from '../components/ui/AppButton.jsx'
import AppLogo from '../components/ui/AppLogo.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useCompetitionManagement } from '../hooks/useCompetitionManagement.js'

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

function ParticipantItem({
  member,
  canRemove,
  isOwner,
  onRemove,
}) {
  const profile = member.profile

  return (
    <li className="flex items-center justify-between rounded-2xl border border-app-border bg-app-surface px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-app-text">
          {profile?.username || 'Utente'}
        </p>

        <p className="truncate text-xs text-app-text-muted">
          {profile?.nome || 'Nome non impostato'}
          {profile?.email ? ` • ${profile.email}` : ''}
        </p>

        <p className="mt-1 text-xs text-app-text-muted">
          Ruolo: {member.ruolo}
        </p>
      </div>

      {isOwner ? (
        <span className="ml-4 text-xs font-semibold text-brand-primary">
          Creatore
        </span>
      ) : canRemove ? (
        <button
          type="button"
          onClick={() => onRemove(member.user_id)}
          className="ml-4 text-xs font-semibold text-rose-300 transition hover:text-rose-200"
        >
          Rimuovi
        </button>
      ) : null}
    </li>
  )
}

function SearchUserItem({ user, disabled, onAdd }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onAdd(user)}
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

function MatchListItem({ match }) {
  return (
    <li className="rounded-2xl border border-app-border bg-app-surface px-4 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-app-text">
            {match.squadra_a} vs {match.squadra_b}
          </p>
          <p className="mt-1 text-xs text-app-text-muted">
            {formatDateTime(match.data)}
          </p>
        </div>

        <div className="flex flex-col items-start gap-1 text-xs text-app-text-muted md:items-end">
          <span>{match.luogo || 'Luogo non specificato'}</span>
          <span>{match.risultato || 'Risultato non disponibile'}</span>
          <span>{match.vincitore ? `Vincitore: ${match.vincitore}` : 'Vincitore non disponibile'}</span>
        </div>
      </div>
    </li>
  )
}

function ManageCompetitionPage() {
  const { competitionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    getCompetitionById,
    updateCompetition,
    searchProfiles,
    addCompetitionMember,
    removeCompetitionMember,
    createMatch,
  } = useCompetitionManagement()

  const [competition, setCompetition] = useState(null)
  const [loading, setLoading] = useState(true)
  const [pageError, setPageError] = useState('')

  const [detailsForm, setDetailsForm] = useState({
    nome: '',
    data_inizio: '',
    data_fine: '',
    sport: '',
    descrizione: '',
  })
  const [detailsSaving, setDetailsSaving] = useState(false)
  const [detailsMessage, setDetailsMessage] = useState('')
  const [detailsError, setDetailsError] = useState('')

  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [membersError, setMembersError] = useState('')
  const [membersMessage, setMembersMessage] = useState('')

  const [matchForm, setMatchForm] = useState({
    data: '',
    luogo: '',
    squadra_a: '',
    squadra_b: '',
    risultato: '',
    vincitore: '',
  })
  const [matchSaving, setMatchSaving] = useState(false)
  const [matchError, setMatchError] = useState('')
  const [matchMessage, setMatchMessage] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadCompetition() {
      try {
        setLoading(true)
        setPageError('')

        const data = await getCompetitionById(competitionId)

        if (ignore) return

        setCompetition(data)
        setDetailsForm({
          nome: data.nome || '',
          data_inizio: data.data_inizio || '',
          data_fine: data.data_fine || '',
          sport: data.sport || '',
          descrizione: data.descrizione || '',
        })
      } catch (error) {
        if (!ignore) {
          setPageError(error.message || 'Impossibile caricare la competizione.')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadCompetition()

    return () => {
      ignore = true
    }
  }, [competitionId, getCompetitionById])

  useEffect(() => {
    let ignore = false

    async function runSearch() {
      const trimmed = searchTerm.trim()

      if (trimmed.length < 2) {
        setSearchResults([])
        return
      }

      try {
        setSearchLoading(true)
        const results = await searchProfiles(trimmed)

        if (!ignore) {
          setSearchResults(results || [])
        }
      } catch (error) {
        if (!ignore) {
          setMembersError(error.message || 'Impossibile cercare gli utenti.')
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

  const members = useMemo(() => {
    return [...(competition?.competition_members || [])].sort((a, b) => {
      if (a.user_id === competition?.owner_id) return -1
      if (b.user_id === competition?.owner_id) return 1

      const aName = a.profile?.username || ''
      const bName = b.profile?.username || ''

      return aName.localeCompare(bName, 'it')
    })
  }, [competition])

  const memberIds = useMemo(() => {
    return new Set(members.map((member) => member.user_id))
  }, [members])

  const canManageCompetition = competition?.owner_id === user?.id

  function handleDetailsChange(event) {
    const { name, value } = event.target
    setDetailsForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function handleMatchChange(event) {
    const { name, value } = event.target
    setMatchForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  async function handleSaveDetails(event) {
    event.preventDefault()
    setDetailsError('')
    setDetailsMessage('')

    if (!detailsForm.nome.trim()) {
      setDetailsError('Inserisci il nome della competizione.')
      return
    }

    if (!detailsForm.data_inizio) {
      setDetailsError('Inserisci la data di inizio.')
      return
    }

    if (!detailsForm.sport) {
      setDetailsError('Seleziona uno sport.')
      return
    }

    if (detailsForm.data_fine && detailsForm.data_fine < detailsForm.data_inizio) {
      setDetailsError('La data di fine non può essere precedente alla data di inizio.')
      return
    }

    try {
      setDetailsSaving(true)

      const updatedCompetition = await updateCompetition({
        competitionId,
        ...detailsForm,
      })

      setCompetition((current) => ({
        ...current,
        ...updatedCompetition,
      }))
      setDetailsMessage('Dati della competizione aggiornati con successo.')
    } catch (error) {
      setDetailsError(error.message || 'Impossibile aggiornare la competizione.')
    } finally {
      setDetailsSaving(false)
    }
  }

  async function handleAddMember(profile) {
    setMembersError('')
    setMembersMessage('')

    try {
      const insertedMember = await addCompetitionMember({
        competitionId,
        userId: profile.id,
        ruolo: 'membro',
      })

      setCompetition((current) => ({
        ...current,
        competition_members: [...(current?.competition_members || []), insertedMember],
      }))
      setMembersMessage('Utente aggiunto correttamente.')
    } catch (error) {
      setMembersError(error.message || 'Impossibile aggiungere il membro.')
    }
  }

  async function handleRemoveMember(userId) {
    setMembersError('')
    setMembersMessage('')

    try {
      await removeCompetitionMember({ competitionId, userId })

      setCompetition((current) => ({
        ...current,
        competition_members: (current?.competition_members || []).filter(
          (member) => member.user_id !== userId,
        ),
      }))
      setMembersMessage('Utente rimosso correttamente.')
    } catch (error) {
      setMembersError(error.message || 'Impossibile rimuovere il membro.')
    }
  }

  async function handleCreateMatch(event) {
    event.preventDefault()
    setMatchError('')
    setMatchMessage('')

    if (!matchForm.data) {
      setMatchError('Inserisci data e ora del match.')
      return
    }

    if (!matchForm.squadra_a.trim() || !matchForm.squadra_b.trim()) {
      setMatchError('Inserisci entrambe le squadre.')
      return
    }

    if (matchForm.squadra_a.trim().toLowerCase() === matchForm.squadra_b.trim().toLowerCase()) {
      setMatchError('Le due squadre devono essere diverse.')
      return
    }

    try {
      setMatchSaving(true)

      const insertedMatch = await createMatch({
        competitionId,
        ...matchForm,
      })

      setCompetition((current) => ({
        ...current,
        matches: [...(current?.matches || []), insertedMatch].sort(
          (a, b) => new Date(a.data).getTime() - new Date(b.data).getTime(),
        ),
      }))

      setMatchForm({
        data: '',
        luogo: '',
        squadra_a: '',
        squadra_b: '',
        risultato: '',
        vincitore: '',
      })
      setMatchMessage('Match creato correttamente.')
    } catch (error) {
      setMatchError(error.message || 'Impossibile creare il match.')
    } finally {
      setMatchSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-8">
        <section className="mx-auto max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
          <p className="text-sm text-app-text-muted">Caricamento competizione...</p>
        </section>
      </main>
    )
  }

  if (pageError || !competition) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-8">
        <section className="mx-auto max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
          <AppLogo />

          <p className="mt-6 text-sm text-rose-200">
            {pageError || 'Competizione non trovata.'}
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

  if (!canManageCompetition) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-8">
        <section className="mx-auto max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
          <AppLogo />

          <p className="mt-6 text-sm text-rose-200">
            Non hai i permessi per gestire questa competizione.
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
      <section className="mx-auto flex max-w-5xl flex-col gap-4 rounded-card border border-app-border bg-app-surface p-6 shadow-app md:flex-row md:items-center md:justify-between">
        <AppLogo />

        <div className="w-full max-w-xs">
          <AppButton to="/dashboard" variant="secondary">
            Torna alla dashboard
          </AppButton>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
        <h1 className="text-3xl font-black tracking-tight text-app-text">
          Gestisci <span className="text-brand-primary">{competition.nome}</span>
        </h1>

        <p className="mt-3 text-sm leading-6 text-app-text-muted">
          Da qui puoi modificare i dati della competizione, gestire gli utenti iscritti e creare nuovi match.
        </p>
      </section>

      <section className="mx-auto mt-8 max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
        <h2 className="text-2xl font-black tracking-tight text-app-text">
          Dati iniziali
        </h2>

        <form onSubmit={handleSaveDetails} className="mt-6 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-app-text">
                Nome competizione
              </span>
              <input
                type="text"
                name="nome"
                value={detailsForm.nome}
                onChange={handleDetailsChange}
                className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-app-text">
                Sport
              </span>
              <select
                name="sport"
                value={detailsForm.sport}
                onChange={handleDetailsChange}
                className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
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
                name="data_inizio"
                value={detailsForm.data_inizio}
                onChange={handleDetailsChange}
                className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-app-text">
                Data fine
              </span>
              <input
                type="date"
                name="data_fine"
                value={detailsForm.data_fine}
                onChange={handleDetailsChange}
                className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-semibold text-app-text">
                Descrizione
              </span>
              <textarea
                rows="4"
                name="descrizione"
                value={detailsForm.descrizione}
                onChange={handleDetailsChange}
                className="w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
              />
            </label>
          </div>

          {detailsError ? (
            <div className="rounded-2xl border border-state-danger/30 bg-state-danger/10 px-4 py-3 text-sm text-rose-200">
              {detailsError}
            </div>
          ) : null}

          {detailsMessage ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {detailsMessage}
            </div>
          ) : null}

          <div className="flex justify-end">
            <div className="w-full md:w-auto md:min-w-56">
              <button
                type="submit"
                disabled={detailsSaving}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-slate-50 transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {detailsSaving ? 'Salvataggio...' : 'Salva modifiche'}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="mx-auto mt-8 max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
        <h2 className="text-2xl font-black tracking-tight text-app-text">
          Utenti iscritti
        </h2>

        <p className="mt-3 text-sm text-app-text-muted">
          Cerca utenti nel database e aggiungili alla competizione. Il creatore resta admin.
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
              className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
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
            ) : searchResults.length === 0 ? (
              <p className="text-sm text-app-text-muted">
                Nessun utente trovato.
              </p>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result) => (
                  <SearchUserItem
                    key={result.id}
                    user={result}
                    disabled={memberIds.has(result.id)}
                    onAdd={handleAddMember}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {membersError ? (
          <div className="mt-6 rounded-2xl border border-state-danger/30 bg-state-danger/10 px-4 py-3 text-sm text-rose-200">
            {membersError}
          </div>
        ) : null}

        {membersMessage ? (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            {membersMessage}
          </div>
        ) : null}

        <div className="mt-6">
          {members.length > 0 ? (
            <ul className="space-y-3">
              {members.map((member) => (
                <ParticipantItem
                  key={member.user_id}
                  member={member}
                  isOwner={member.user_id === competition.owner_id}
                  canRemove={member.user_id !== competition.owner_id}
                  onRemove={handleRemoveMember}
                />
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-dashed border-app-border bg-app-surface-2 px-4 py-4 text-sm text-app-text-muted">
              Nessun utente iscritto alla competizione.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
        <h2 className="text-2xl font-black tracking-tight text-app-text">
          Crea match
        </h2>

        <form onSubmit={handleCreateMatch} className="mt-6 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-app-text">
                Data e ora
              </span>
              <input
                type="datetime-local"
                name="data"
                value={matchForm.data}
                onChange={handleMatchChange}
                className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-app-text">
                Luogo
              </span>
              <input
                type="text"
                name="luogo"
                value={matchForm.luogo}
                onChange={handleMatchChange}
                placeholder="Es. Campo 1"
                className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-app-text">
                Squadra A
              </span>
              <input
                type="text"
                name="squadra_a"
                value={matchForm.squadra_a}
                onChange={handleMatchChange}
                className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-app-text">
                Squadra B
              </span>
              <input
                type="text"
                name="squadra_b"
                value={matchForm.squadra_b}
                onChange={handleMatchChange}
                className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-app-text">
                Risultato
              </span>
              <input
                type="text"
                name="risultato"
                value={matchForm.risultato}
                onChange={handleMatchChange}
                placeholder="Es. 3-2"
                className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-app-text">
                Vincitore
              </span>
              <input
                type="text"
                name="vincitore"
                value={matchForm.vincitore}
                onChange={handleMatchChange}
                placeholder="Es. Team Rossi"
                className="min-h-11 w-full rounded-2xl border border-app-border bg-app-surface-2 px-4 py-3 text-sm text-app-text outline-none transition focus:border-brand-primary"
              />
            </label>
          </div>

          {matchError ? (
            <div className="rounded-2xl border border-state-danger/30 bg-state-danger/10 px-4 py-3 text-sm text-rose-200">
              {matchError}
            </div>
          ) : null}

          {matchMessage ? (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {matchMessage}
            </div>
          ) : null}

          <div className="flex justify-end">
            <div className="w-full md:w-auto md:min-w-56">
              <button
                type="submit"
                disabled={matchSaving}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-slate-50 transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
              >
                {matchSaving ? 'Creazione...' : 'Crea match'}
              </button>
            </div>
          </div>
        </form>

        <div className="mt-8">
          <h3 className="text-lg font-black tracking-tight text-app-text">
            Match esistenti
          </h3>

          {competition.matches?.length > 0 ? (
            <ul className="mt-4 space-y-3">
              {competition.matches.map((match) => (
                <MatchListItem key={match.id} match={match} />
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border border-dashed border-app-border bg-app-surface-2 px-4 py-4 text-sm text-app-text-muted">
              Nessun match creato per questa competizione.
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default ManageCompetitionPage