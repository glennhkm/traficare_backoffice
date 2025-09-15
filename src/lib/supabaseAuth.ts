import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client for auth
export const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
})

// Auth types
export interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string | null
}

export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

// Auth functions
export const authService = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabaseAuth.auth.signOut()
    return { error }
  },

  // Get current user
  getUser: async () => {
    const { data: { user }, error } = await supabaseAuth.auth.getUser()
    return { user, error }
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string) => {
    // First verify current password by attempting to sign in
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user?.email) {
      return { error: { message: 'User not found' } }
    }

    // Verify current password
    const { error: verifyError } = await supabaseAuth.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (verifyError) {
      return { error: { message: 'Password lama salah' } }
    }

    // Update to new password
    const { data, error } = await supabaseAuth.auth.updateUser({
      password: newPassword
    })

    return { data, error }
  },

  // Get session
  getSession: async () => {
    const { data: { session }, error } = await supabaseAuth.auth.getSession()
    return { session, error }
  }
}
