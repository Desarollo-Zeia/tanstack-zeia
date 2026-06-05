const API_BASE_URL = 'https://api.zeia.com.pe'
const AUTH_STORAGE_KEY = 'zeia-ocupacional-auth'

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

function extractErrorMessage(body: unknown): string {
  if (typeof body !== 'object' || body === null) return ''
  const errorBody = body as Record<string, unknown>

  if (typeof errorBody.detail === 'string') return errorBody.detail
  if (typeof errorBody.message === 'string') return errorBody.message

  const arrayKeys = ['error', 'non_field_errors']
  for (const key of arrayKeys) {
    const arr = errorBody[key]
    if (Array.isArray(arr) && typeof arr[0] === 'string') return arr[0]
  }

  return ''
}

export async function apiOcupacionalFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Token ${token}`,
      ...options?.headers,
    },
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}))
    const message = extractErrorMessage(errorBody)
    throw new Error(message || `HTTP ${response.status}: ${response.statusText}`)
  }

  return response.json()
}
