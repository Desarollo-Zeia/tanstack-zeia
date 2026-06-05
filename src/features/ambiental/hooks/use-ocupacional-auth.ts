import { useCallback, useState } from 'react'
import type { OcupacionalAuthResponse } from '@/features/auth/types'

const AUTH_STORAGE_KEY = 'zeia-ocupacional-auth'

export interface OcupacionalAuthState {
  token: string
  user: Omit<OcupacionalAuthResponse, 'token'>
}

function getStoredAuth(): OcupacionalAuthState | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored) as OcupacionalAuthState
  } catch {
    return null
  }
}

export function useOcupacionalAuth() {
  const [auth, setAuthState] = useState<OcupacionalAuthState | null>(getStoredAuth)

  const setAuth = useCallback((data: OcupacionalAuthResponse) => {
    const { token, ...user } = data
    const state: OcupacionalAuthState = { token, user }
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
