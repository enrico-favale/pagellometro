import { useCallback } from 'react'
import { supabase } from '../services/supabaseClient.js'

export function useCompetitions() {
  const getMyCompetitions = useCallback(async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError) throw authError

    if (!user) {
      throw new Error('Utente non autenticato.')
    }

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
      .order('data_inizio', { ascending: false })
      .order('data', { foreignTable: 'matches', ascending: true })

    if (error) throw error

    return data || []
  }, [])

  return {
    getMyCompetitions,
  }
}