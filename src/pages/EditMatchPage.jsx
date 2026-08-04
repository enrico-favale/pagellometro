import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import AppButton from '../components/ui/AppButton.jsx'
import AppLogo from '../components/ui/AppLogo.jsx'
import { useMatchEdit } from '../hooks/useMatchEdit.js'

function formatDateTimeLocal(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function PerformanceRow({
  performance,
  member,
  onRemove,
  onAdd,
  selected,
}) {
  const user = member?.profile || performance?.user

  return (
    <li className="flex items-center justify-between rounded-2xl border border-app-border bg-app-surface px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-app-text">
          {user?.nome || 'Utente'}
        </p>
        <p className="truncate text-xs text-app-text-muted">
          @{user?.username || 'username non disponibile'}
        </p>
      </div>

      {selected ? (
        <button
          type="button"
          onClick={onRemove}
          className="ml-4 text-xs font-semibold text-rose-300 transition hover:text-rose-200"
        >
          Rimuovi
        </button>
      ) : (
        <button
          type="button"
          disabled={!member}
          onClick={onAdd}
          className="ml-4 text-xs font-semibold text-brand-primary transition hover:text-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          Aggiungi
        </button>
      )}
    </li>
  )
}

function PerformanceEditor({
  performance,
  member,
  onChange,
  onRemove,
}) {
  const user = member?.profile || performance?.user

  const [valutazione, setValutazione] = useState(
    performance?.valutazione != null ? String(performance.valutazione) : '6'
  )
  const [squadra, setSquadra] = useState(performance?.squadra || '')
  const [descrizione, setDescrizione] = useState(performance?.descrizione || '')

  useEffect(() => {
    onChange({
      user_id: member.user_id,
      valutazione: Number(valutazione),
      squadra,
      descrizione,
    })
  }, [valutazione, squadra, descrizione, member.user_id, onChange])

  return (
    <div className="rounded-2xl border border-app-border bg-app-surface-2 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-app-text">
            {user?.nome || 'Utente'}
          </p>
          <p className="truncate text-xs text-app-text-muted">
            @{user?.username || 'username non disponibile'}
          </p>
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="text-xs font-semibold text-rose-300 transition hover:text-rose-200"
        >
          Rimuovi
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-app-text">
            Squadra
          </span>
          <input
            type="text"
            value={squadra}
            onChange={(e) => setSquadra(e.target.value)}
            placeholder="Es. Squadra A"
            className="min-h-10 w-full rounded-2xl border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text outline-none transition focus:border-brand-primary"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-xs font-semibold text-app-text">
            Voto
          </span>
          <input
            type="number"
            step="0.1"
            min="0"
            max="10"
            value={valutazione}
            onChange={(e) => setValutazione(e.target.value)}
            className="min-h-10 w-full rounded-2xl border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text outline-none transition focus:border-brand-primary"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-2 block text-xs font-semibold text-app-text">
            Descrizione
          </span>
          <textarea
            rows="3"
            value={descrizione}
            onChange={(e) => setDescrizione(e.target.value)}
            placeholder="Note sulla performance"
            className="w-full rounded-2xl border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text outline-none transition focus:border-brand-primary"
          />
        </label>
      </div>
    </div>
  )
}

function EditMatchPage() {
  const { matchId } = useParams()
  const navigate = useNavigate()
  const {
    getMatchForEdit,
    getCompetitionMembers,
    updateMatchAndPerformances,
  } = useMatchEdit()

  const [match, setMatch] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [matchForm, setMatchForm] = useState({
    data: '',
    luogo: '',
    squadra_a: '',
    squadra_b: '',
    risultato: '',
    vincitore: '',
  })

  const [performancesMap, setPerformancesMap] = useState({})
  const [selectedUserIds, setSelectedUserIds] = useState([])
  const [saving, setSaving] = useState(false)
  const [submitError, setSubmitError] = useState('')

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        setLoading(true)
        setError('')

        const matchData = await getMatchForEdit(matchId)
        const membersData = await getCompetitionMembers(matchData.competition_id)

        if (!ignore) {
          setMatch(matchData)
          setMembers(membersData)

          setMatchForm({
            data: formatDateTimeLocal(matchData.data),
            luogo: matchData.luogo || '',
            squadra_a: matchData.squadra_a || '',
            squadra_b: matchData.squadra_b || '',
            risultato: matchData.risultato || '',
            vincitore: matchData.vincitore || '',
          })

          const existingMap = {}
          const existingIds = []

          matchData.performances.forEach((p) => {
            existingMap[p.user_id] = {
              user_id: p.user_id,
              valutazione: p.valutazione,
              squadra: p.squadra || '',
              descrizione: p.descrizione || '',
            }
            existingIds.push(p.user_id)
          })

          setPerformancesMap(existingMap)
          setSelectedUserIds(existingIds)
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

    load()

    return () => {
      ignore = true
    }
  }, [matchId, getMatchForEdit, getCompetitionMembers])

  const membersMap = useMemo(() => {
    const map = {}
    members.forEach((m) => {
      map[m.user_id] = m
    })
    return map
  }, [members])

  function handleMatchChange(event) {
    const { name, value } = event.target
    setMatchForm((current) => ({ ...current, [name]: value }))
  }

  function handleAddMember(userId) {
    if (selectedUserIds.includes(userId)) return

    setSelectedUserIds((current) => [...current, userId])
    setPerformancesMap((current) => ({
      ...current,
      [userId]: {
        user_id: userId,
        valutazione: 6,
        squadra: '',
        descrizione: '',
      },
    }))
  }

  function handleRemoveMember(userId) {
    setSelectedUserIds((current) =>
      current.filter((id) => id !== userId),
    )
    setPerformancesMap((current) => {
      const copy = { ...current }
      delete copy[userId]
      return copy
    })
  }

  function handlePerformanceChange(userId, data) {
    setPerformancesMap((current) => ({
      ...current,
      [userId]: data,
    }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    if (!matchForm.data) {
      setSubmitError('Inserisci data e ora del match.')
      return
    }

    if (!matchForm.squadra_a.trim() || !matchForm.squadra_b.trim()) {
      setSubmitError('Inserisci entrambe le squadre.')
      return
    }

    if (selectedUserIds.length === 0) {
      setSubmitError('Aggiungi almeno un giocatore al match.')
      return
    }

    try {
      setSaving(true)

      const performances = selectedUserIds
        .map((userId) => performancesMap[userId])
        .filter(Boolean)

      await updateMatchAndPerformances({
        matchId,
        matchData: new Date(matchForm.data).toISOString(),
        matchLuogo: matchForm.luogo,
        matchSquadraA: matchForm.squadra_a,
        matchSquadraB: matchForm.squadra_b,
        matchRisultato: matchForm.risultato,
        matchVincitore: matchForm.vincitore,
        performances,
      })

      navigate(`/matches/${matchId}`, { replace: true })
    } catch (err) {
      setSubmitError(err.message || 'Impossibile salvare il match.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-app-bg px-4 py-8">
        <section className="mx-auto max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
          <p className="text-sm text-app-text-muted">Caricamento match...</p>
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

  const nonSelectedMembers = members.filter(
    (m) => !selectedUserIds.includes(m.user_id),
  )

  return (
    <main className="min-h-screen bg-app-bg px-4 py-8">
      <section className="mx-auto max-w-5xl rounded-card border border-app-border bg-app-surface p-8 shadow-app">
        <AppLogo />

        <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-app-text">
              Modifica match
            </h1>

            <p className="mt-2 text-sm text-app-text-muted">
              {match.squadra_a} vs {match.squadra_b}
            </p>
          </div>

          <div className="w-full md:w-auto md:min-w-56">
            <AppButton to={`/matches/${match.id}`} variant="secondary">
              Torna ai dettagli
            </AppButton>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-5xl space-y-8">
        <section className="rounded-card border border-app-border bg-app-surface p-8 shadow-app">
          <h2 className="text-2xl font-black tracking-tight text-app-text">
            Dati match
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
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
        </section>

        <section className="rounded-card border border-app-border bg-app-surface p-8 shadow-app">
          <h2 className="text-2xl font-black tracking-tight text-app-text">
            Giocatori e performance
          </h2>

          <p className="mt-3 text-sm text-app-text-muted">
            Aggiungi i giocatori che fanno parte di questa competizione e assegna loro voto, squadra e descrizione.
          </p>

          <div className="mt-6">
            {nonSelectedMembers.length > 0 ? (
              <div className="rounded-2xl border border-app-border bg-app-bg p-3">
                <ul className="space-y-2">
                  {nonSelectedMembers.map((member) => (
                    <PerformanceRow
                      key={member.user_id}
                      member={member}
                      selected={false}
                      onAdd={() => handleAddMember(member.user_id)}
                      onRemove={() => { }}
                    />
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-app-border bg-app-surface-2 px-4 py-4 text-sm text-app-text-muted">
                Tutti i giocatori della competizione sono già stati aggiunti.
              </div>
            )}
          </div>

          {selectedUserIds.length > 0 ? (
            <div className="mt-6 space-y-4">
              {selectedUserIds.map((userId) => (
                <PerformanceEditor
                  key={userId}
                  performance={performancesMap[userId]}
                  member={membersMap[userId]}
                  onChange={(data) => handlePerformanceChange(userId, data)}
                  onRemove={() => handleRemoveMember(userId)}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-app-border bg-app-surface-2 px-4 py-4 text-sm text-app-text-muted">
              Nessun giocatore aggiunto al match.
            </div>
          )}
        </section>

        {submitError ? (
          <div className="mx-auto max-w-5xl rounded-2xl border border-state-danger/30 bg-state-danger/10 px-4 py-3 text-sm text-rose-200">
            {submitError}
          </div>
        ) : null}

        <div className="mx-auto max-w-5xl flex flex-col gap-3 md:flex-row md:justify-end">
          <div className="w-full md:w-auto md:min-w-48">
            <AppButton to={`/matches/${match.id}`} variant="secondary">
              Annulla
            </AppButton>
          </div>

          <div className="w-full md:w-auto md:min-w-56">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl bg-brand-primary px-5 py-3 text-sm font-semibold text-slate-50 transition hover:bg-brand-primary-hover disabled:cursor-not-allowed disabled:opacity-70"
            >
              {saving ? 'Salvataggio...' : 'Salva modifiche'}
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}

export default EditMatchPage