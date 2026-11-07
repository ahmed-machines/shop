import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, SETUP_MESSAGE } from '../services/supabase'
import { getProfile } from '../services/orderService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true) // true while we check if someone is already logged in

  // Loads the profile row (it contains the role: customer or admin).
  async function loadProfile(currentUser) {
    if (!currentUser) {
      setProfile(null)
      return
    }
    try {
      setProfile(await getProfile(currentUser.id))
    } catch {
      setProfile(null)
    }
  }

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // 1) Is there an existing session (user logged in earlier)?
    supabase.auth.getSession().then(async ({ data }) => {
      const currentUser = data.session?.user ?? null
      setUser(currentUser)
      await loadProfile(currentUser)
      setLoading(false)
    })

    // 2) Listen for login / logout events.
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      // setTimeout avoids calling Supabase inside its own auth callback (known deadlock).
      setTimeout(() => loadProfile(currentUser), 0)
    })

    // Cleanup: stop listening when the provider is removed.
    return () => listener.subscription.unsubscribe()
  }, [])

  async function register(fullName, email, password) {
    if (!supabase) throw new Error(SETUP_MESSAGE)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    if (error) throw new Error(error.message)
    // When "Confirm email" is enabled in Supabase there is no session yet.
    return { needsEmailConfirmation: !data.session }
  }

  async function login(email, password) {
    if (!supabase) throw new Error(SETUP_MESSAGE)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw new Error(error.message)
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  async function refreshProfile() {
    await loadProfile(user)
  }

  const value = {
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
    register,
    login,
    logout,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}

