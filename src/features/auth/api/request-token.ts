import type { AuthResponse, LoginCredentials } from '../types'

const API_BASE_URL = 'https://api.energy.zeia.com.pe/api/v1'

type AuthErrorCode = 'NETWORK_ERROR' | 'SERVER_ERROR' | 'INVALID_RESPONSE' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR'

export class AuthError extends Error {
  code: AuthErrorCode

  constructor(message: string, code: AuthErrorCode) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

function isValidAuthResponse(data: unknown): data is AuthResponse {
  if (typeof data !== 'object' || data === null) return false
  const d = data as Record<string, unknown>
  if (typeof d.token !== 'string' || d.token.length === 0) return false
  if (typeof d.user !== 'object' || d.user === null) return false
  const user = d.user as Record<string, unknown>
  if (typeof user.id !== 'number') return false
  if (typeof user.email !== 'string') return false
  return true
}

export async function requestToken(credentials: LoginCredentials): Promise<AuthResponse> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/accounts/request-token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
  } catch {
    throw new AuthError(
      'No se pudo conectar con el servidor. Verifique su conexión a internet.',
      'NETWORK_ERROR'
    )
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new AuthError(
      'La respuesta del servidor no es válida. Intente nuevamente más tarde.',
      'INVALID_RESPONSE'
    )
  }

  if (!response.ok) {
    const errorBody = body as Record<string, unknown>
    const message = typeof errorBody.message === 'string'
      ? errorBody.message
      : 'Error al iniciar sesión. Verifique sus credenciales.'
    throw new AuthError(message, 'SERVER_ERROR')
  }

  if (!isValidAuthResponse(body)) {
    throw new AuthError(
      'La respuesta del servidor está incompleta. Contacte al administrador.',
      'INVALID_RESPONSE'
    )
  }

  return body
}
