"use client";

import { useAuth } from '@/contexts/AuthContext'
import LoginForm from '@/components/LoginForm'
import { LoadingSpinner } from '@/components/LoadingComponents'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()

  // Show loading spinner while loading initial auth session to prevent flash of login screen on page refresh
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center justify-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-slate-500 animate-pulse select-none">Memuat Sesi...</p>
        </div>
      </div>
    );
  }

  // Show login form if user is not authenticated
  if (!user) {
    return <LoginForm />
  }

  // Show protected content if user is authenticated
  return <>{children}</>
}
