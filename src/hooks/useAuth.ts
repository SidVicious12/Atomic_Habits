import { useState, useEffect } from 'react'
import { User, Provider } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export interface UserProfile {
  id: string
  email: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  created_at?: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
      }
      
      if (data) {
        setProfile(data)
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err)
    }
  }

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setLoading(false)
      return
    }

    // Set a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.warn('Auth check timed out, proceeding without authentication')
      setLoading(false)
    }, 5000) // 5 second timeout

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      clearTimeout(timeout)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id)
      }
      setLoading(false)
    }).catch((error) => {
      clearTimeout(timeout)
      console.error('Error getting session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)

        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }

        setLoading(false)
      }
    )

    return () => {
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [])

  // Email/Password sign in
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  // Email/Password sign up with profile
  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    })
    if (error) throw error
    return data
  }

  // OAuth sign in (Google, GitHub, etc.)
  const signInWithOAuth = async (provider: Provider) => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/`,
      }
    })
    if (error) throw error
    return data
  }

  // Sign in with Google
  const signInWithGoogle = () => signInWithOAuth('google')

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setProfile(null)
  }

  // Update user profile
  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) throw new Error('No user logged in')
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: user.email,
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()
    
    if (error) throw error
    setProfile(data)
    return data
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated: !!user,
    isConfigured: isSupabaseConfigured(),
    signIn,
    signUp,
    signInWithGoogle,
    signInWithOAuth,
    signOut,
    updateProfile,
    fetchProfile,
  }
}
