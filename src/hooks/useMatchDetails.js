import { useCallback } from 'react'
import { supabase } from '../services/supabaseClient.js'

export function useMatchDetails() {
  const getMatchById = useCallback(async (matchId) => {
    const { data, error } = await supabase
      .from('matches')
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
        updated_at,
        performances (
          id,
          user_id,
          match_id,
          squadra,
          valutazione,
          descrizione,
          created_at,
          updated_at,
          user:profiles (
            id,
            username,
            nome,
            email,
            avatar_url
          )
        )
      `)
      .eq('id', matchId)
      .single()

    if (error) throw error

    return {
      ...data,
      performances: data?.performances || [],
    }
  }, [])

  return {
    getMatchById,
  }
}