'use client'

import { AuthProvider, useAuth } from '@/components/AuthContext'
import LoginScreen from '@/components/LoginScreen'
import PbdApp from '@/components/PbdApp'

function AppGate() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
        <p>Memuatkan...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginScreen />
  }

  return <PbdApp />
}

export default function AppShell() {
  return (
    <AuthProvider>
      <AppGate />
    </AuthProvider>
  )
}
