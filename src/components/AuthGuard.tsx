"use client";

import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user } = useAuth()

  // Show login form if user is not authenticated
  if (!user) {
    return <LoginForm />
  }

  // Show protected content if user is authenticated
  return <>{children}</>
}
