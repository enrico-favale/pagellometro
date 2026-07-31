import { createContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../services/supabaseClient.js'

export const AuthContext = createContext(null)

function buildRedirectUrl(path = '/dashboard') {
  return `${window.location.origin}${path}`
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!mounted) return

      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      isAuthenticated: Boolean(user),

      async signInWithPassword({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error
        return data
      },

      async signUpWithPassword({
        email,
        password,
        username,
        nome,
      }) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: buildRedirectUrl('/dashboard'),
            data: {
              username,
              full_name: nome,
            },
          },
        })

        if (error) throw error
        return data
      },

      async signInWithGoogle() {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: buildRedirectUrl('/dashboard'),
          },
        })

        if (error) throw error
        return data
      },

      async getMyProfile() {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          return null
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, nome, username, avatar_url, created_at')
          .eq('id', currentUser.id)
          .maybeSingle()

        if (error) throw error
        return data
      },

      async updateMyProfile({ username, nome, avatar_url }) {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          throw new Error('Utente non autenticato.')
        }

        const updates = {
          username,
          nome,
          avatar_url,
          updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', currentUser.id)
          .select('id, email, nome, username, avatar_url, created_at, updated_at')
          .single()

        if (error) throw error
        return data
      },

      async uploadAvatar(file) {
        const {
          data: { user: currentUser },
        } = await supabase.auth.getUser()

        if (!currentUser) {
          throw new Error('Utente non autenticato.')
        }

        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
        const filePath = `${currentUser.id}/avatar.${fileExt}`

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
          })

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

        return data.publicUrl
      },

      async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      },
    }),
    [session, user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}