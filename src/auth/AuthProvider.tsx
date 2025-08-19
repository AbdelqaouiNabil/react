import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

export type UserRole = 'admin' | 'student'

export interface ProfileRow {
  user_id: string
  role: UserRole
  created_at?: string
}

interface AuthContextValue {
  loading: boolean
  user: User | null
  session: Session | null
  role: UserRole | null
  profile: ProfileRow | null
  signInWithPassword: (email: string, password: string) => Promise<void>
  signUpWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<ProfileRow | null>(null)

  const role: UserRole | null = profile?.role ?? null

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return
      setSession(data.session)
      setUser(data.session?.user ?? null)
      // do not set loading false yet; wait for profile phase
    }

    init()

    const { data: sub } = supabase.auth.onAuthStateChange((_event: any, newSession: Session | null) => {
      if (!mounted) return
      setSession(newSession)
      setUser(newSession?.user ?? null)
      // when user changes, profile effect will re-run
    })

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    let active = true

    const loadProfile = async () => {
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, role, created_at')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!active) return

      if (error) {
        console.error('Failed to load profile', error)
        setProfile(null)
        setLoading(false)
        return
      }

      if (!data) {
        // Attempt to create a default profile for new users
        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({ user_id: user.id, role: 'student' })
          .select()
          .single()
        if (!active) return
        if (insertError) {
          console.error('Failed to create profile', insertError)
          setProfile(null)
        } else {
          setProfile(inserted)
        }
      } else {
        setProfile(data)
      }
      setLoading(false)
    }

    loadProfile()

    return () => {
      active = false
    }
  }, [user])

  const signInWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  const signUpWithPassword = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const value = useMemo<AuthContextValue>(() => ({
    loading,
    user,
    session,
    role,
    profile,
    signInWithPassword,
    signUpWithPassword,
    signOut,
  }), [loading, user, session, role, profile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
