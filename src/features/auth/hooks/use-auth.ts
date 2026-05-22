import { useCallback, useState } from 'react'
import type { AuthResponse, User } from '@/features/auth/types'

const AUTH_STORAGE_KEY = 'zeia-auth'

interface AuthState {
  token: string
  user: User
}

function getStoredAuth(): AuthState | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as AuthState
  } catch {
    return null
  }
}

export function useAuth() {
  const [auth, setAuthState] = useState<AuthState | null>(getStoredAuth)

  const setAuth = useCallback((data: AuthResponse) => {
    const state: AuthState = {
      token: data.token,
      user: data.user,
    }
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state))
    setAuthState(state)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setAuthState(null)
  }, [])

  return {
    token: auth?.token ?? null,
    user: auth?.user ?? null,
    isAuthenticated: !!auth?.token,
    setAuth,
    logout,
  }
}
