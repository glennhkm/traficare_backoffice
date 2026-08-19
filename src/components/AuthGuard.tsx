"use client";

import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'
import { LoadingSpinner } from '@/components/LoadingComponents'

interface AuthGuardProps {
  children: React.ReactNode
  isPreAuthenticated: boolean
}

export default function AuthGuard({ children, isPreAuthenticated }: AuthGuardProps) {
  const { user, loading } = useAuth()

  // Show protected content immediately if pre-authenticated during loading,
  // or show the LoginForm immediately to avoid any flashing loading screens.
  if (loading) {
    if (isPreAuthenticated) {
      return <>{children}</>
    }
    return <LoginForm />
  }

  // Show login form if user is not authenticated
  if (!user) {
    return <LoginForm />
  }

  // Show protected content if user is authenticated
  return <>{children}</>
}
