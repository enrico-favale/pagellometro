import { useCallback } from 'react'
import { supabase } from '../services/supabaseClient.js'

function normalizeSearchTerm(value) {
  return value.trim().replace(/\s+/g, ' ')
}

export function useCompetitionCreation() {
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

  const createCompetition = useCallback(async ({
    nome,
    data_inizio,
    data_fine,
    sport,
    descrizione,
    memberIds,
  }) => {
    const { data, error } = await supabase.rpc('create_competition_with_members', {
      p_nome: nome,
      p_data_inizio: data_inizio,
      p_data_fine: data_fine || null,
      p_sport: sport,
      p_descrizione: descrizione || null,
      p_member_ids: memberIds || [],
    })

    if (error) throw error

    return data
  }, [])

  return {
    searchProfiles,
    createCompetition,
  }
}