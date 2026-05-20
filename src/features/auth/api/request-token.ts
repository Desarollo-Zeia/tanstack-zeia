import type { AuthResponse, LoginCredentials } from '../types'

const API_BASE_URL = 'https://api.energy.zeia.com.pe/api/v1'

export async function requestToken(credentials: LoginCredentials): Promise<AuthResponse> {
  const response = await fetch(`${API_BASE_URL}/accounts/request-token/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.message || 'Error al iniciar sesión')
  }

  return response.json()
}
