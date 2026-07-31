import { useCallback } from 'react'
import { supabase } from '../services/supabaseClient.js'

function normalizeSearchTerm(value) {
  return value.trim().replace(/\s+/g, ' ')
}

export function useCompetitionManagement() {
  const getCompetitionById = useCallback(async (competitionId) => {
    const { data, error } = await supabase
      .from('competitions')
      .select(`
        id,
        nome,
        data_inizio,
        data_fine,
        sport,
        descrizione,
        owner_id,
        created_at,
        updated_at,
        competition_members (
          competition_id,
          user_id,
          ruolo,
          joined_at,
          created_at,
          profile:profiles!competition_members_user_id_fkey (
            id,
            username,
            nome,
            email,
            avatar_url
          )
        ),
        matches (
          id,
          competition_id,
          data,
          luogo,
          squadra_a,
          squadra_b,
          risultato,
          vincitore,
          created_at,
          updated_at
        )
      `)
      .eq('id', competitionId)
      .single()

    if (error) throw error

    return {
      ...data,
      competition_members: data?.competition_members || [],
      matches: data?.matches || [],
    }
  }, [])

  const updateCompetition = useCallback(async ({
    competitionId,
    nome,
    data_inizio,
    data_fine,
    sport,
    descrizione,
  }) => {
    const { data, error } = await supabase
      .from('competitions')
      .update({
        nome: nome.trim(),
        data_inizio,
        data_fine: data_fine || null,
        sport,
        descrizione: descrizione?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', competitionId)
      .select(`
        id,
        nome,
        data_inizio,
        data_fine,
        sport,
        descrizione,
        owner_id,
        created_at,
        updated_at
      `)
      .single()

    if (error) throw error
    return data
  }, [])

  const searchProfiles = useCallback(async (query) => {
    const term = normalizeSearchTerm(query)

    if (term.length < 2) {
      return []
    }

    const escapedTerm = term.replace(/[%_]/g, '\\$&')
    const pattern = `%${escapedTerm}%`

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, nome, email, avatar_url')
      .or(`username.ilike.${pattern},nome.ilike.${pattern},email.ilike.${pattern}`)
      .order('username', { ascending: true })
      .limit(10)

    if (error) throw error
    return data || []
  }, [])

  const addCompetitionMember = useCallback(async ({
    competitionId,
    userId,
    ruolo = 'membro',
  }) => {
    const { error } = await supabase
      .from('competition_members')
      .insert({
        competition_id: competitionId,
        user_id: userId,
        ruolo,
      })

    if (error) throw error

    const { data, error: fetchError } = await supabase
      .from('competition_members')
      .select(`
        competition_id,
        user_id,
        ruolo,
        joined_at,
        created_at,
        profile:profiles!competition_members_user_id_fkey (
          id,
          username,
          nome,
          email,
          avatar_url
        )
      `)
      .eq('competition_id', competitionId)
      .eq('user_id', userId)
      .single()

    if (fetchError) throw fetchError

    return data
  }, [])

  const removeCompetitionMember = useCallback(async ({
    competitionId,
    userId,
  }) => {
    const { error } = await supabase
      .from('competition_members')
      .delete()
      .eq('competition_id', competitionId)
      .eq('user_id', userId)

    if (error) throw error
  }, [])

  const createMatch = useCallback(async ({
    competitionId,
    data,
    luogo,
    squadra_a,
    squadra_b,
    risultato,
    vincitore,
  }) => {
    const { data: insertedMatch, error } = await supabase
      .from('matches')
      .insert({
        competition_id: competitionId,
        data,
        luogo: luogo?.trim() || null,
        squadra_a: squadra_a.trim(),
        squadra_b: squadra_b.trim(),
        risultato: risultato?.trim() || null,
        vincitore: vincitore?.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .select(`
        id,
        competition_id,
        data,
        luogo,
        squadra_a,
        squadra_b,
        risultato,
        vincitore,
        created_at,
        updated_at
      `)
      .single()

    if (error) throw error
    return insertedMatch
  }, [])

  return {
    getCompetitionById,
    updateCompetition,
    searchProfiles,
    addCompetitionMember,
    removeCompetitionMember,
    createMatch,
  }
}