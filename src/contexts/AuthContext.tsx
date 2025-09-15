"use client";

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabaseAuth, type User, type AuthState } from '@/lib/supabaseAuth'
import { type Session } from '@supabase/supabase-js'

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error?: any }>
  signOut: () => Promise<void>
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error?: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabaseAuth.auth.getSession()
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at || null,
          })
        }
      } catch (err) {
        console.error('Error getting initial session:', err)
        setError('Failed to load session')
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabaseAuth.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at,
            last_sign_in_at: session.user.last_sign_in_at || null,
          })
        } else {
          setUser(null)
        }
        setLoading(false)
        setError(null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error: signInError } = await supabaseAuth.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return { error: signInError }
      }

      return { error: null }
    } catch (err) {
      const errorMessage = 'Login failed'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      await supabaseAuth.auth.signOut()
      setUser(null)
    } catch (err) {
      console.error('Sign out error:', err)
      setError('Failed to sign out')
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    setLoading(true)
    setError(null)

    try {
      if (!user?.email) {
        return { error: { message: 'User not found' } }
      }

      // Verify current password by attempting to sign in
      const { error: verifyError } = await supabaseAuth.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      })

      if (verifyError) {
        setError('Password lama salah')
        return { error: { message: 'Password lama salah' } }
      }

      // Update to new password
      const { error: updateError } = await supabaseAuth.auth.updateUser({
        password: newPassword
      })

      if (updateError) {
        setError(updateError.message)
        return { error: updateError }
      }

      return { error: null }
    } catch (err) {
      const errorMessage = 'Failed to update password'
      setError(errorMessage)
      return { error: { message: errorMessage } }
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    error,
    signIn,
    signOut,
    updatePassword,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
