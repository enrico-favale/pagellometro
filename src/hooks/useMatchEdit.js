import { useCallback } from 'react'
import { supabase } from '../services/supabaseClient.js'

export function useMatchEdit() {
  const getMatchForEdit = useCallback(async (matchId) => {
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
          squadra,
          valutazione,
          descrizione,
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

  const getCompetitionMembers = useCallback(async (competitionId) => {
    const { data, error } = await supabase
      .from('competition_members')
      .select(`
        user_id,
        ruolo,
        profiles (
          id,
          username,
          nome,
          email,
          avatar_url
        )
      `)
      .eq('competition_id', competitionId)

    if (error) throw error

    return (data || []).map((m) => ({
      user_id: m.user_id,
      ruolo: m.ruolo,
      profile: Array.isArray(m.profiles) ? m.profiles[0] : m.profiles,
    }))
  }, [])

  const updateMatchAndPerformances = useCallback(async ({
    matchId,
    matchData,
    matchLuogo,
    matchSquadraA,
    matchSquadraB,
    matchRisultato,
    matchVincitore,
    performances,
  }) => {
    const { error } = await supabase.rpc('update_match_and_performances', {
      p_match_id: matchId,
      p_match_data: matchData,
      p_match_luogo: matchLuogo,
      p_match_squadra_a: matchSquadraA,
      p_match_squadra_b: matchSquadraB,
      p_match_risultato: matchRisultato,
      p_match_vincitore: matchVincitore,
      p_performances: performances,
    })

    if (error) throw error
  }, [])

  return {
    getMatchForEdit,
    getCompetitionMembers,
    updateMatchAndPerformances,
  }
}