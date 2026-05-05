import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { logout } from '@/lib/api/admin'

interface AuthContextValue {
  isAuthenticated: boolean
  signIn: (accessToken: string) => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => !!localStorage.getItem('access_token'),
  )

  const signIn = useCallback((accessToken: string) => {
    localStorage.setItem('access_token', accessToken)
    setIsAuthenticated(true)
  }, [])

  const signOut = useCallback(async () => {
    try {
      await logout()
    } finally {
      localStorage.removeItem('access_token')
      setIsAuthenticated(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
