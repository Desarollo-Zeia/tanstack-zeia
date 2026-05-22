const API_BASE_URL = 'https://api.energy.zeia.com.pe/api/v1'
const AUTH_STORAGE_KEY = 'zeia-auth'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  const stored = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!stored) return null
  try {
    const parsed = JSON.parse(stored)
    return parsed.token ?? null
  } catch {
    return null
  }
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Token ${token}`,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}
