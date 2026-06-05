import type { LoginCredentials, OcupacionalAuthResponse } from '../types'

const API_BASE_URL = 'https://api.zeia.com.pe'

type ErrorCode = 'NETWORK_ERROR' | 'SERVER_ERROR' | 'INVALID_RESPONSE' | 'UNKNOWN_ERROR'

export class OcupacionalAuthError extends Error {
  code: ErrorCode

  constructor(message: string, code: ErrorCode) {
    super(message)
    this.name = 'OcupacionalAuthError'
    this.code = code
  }
}

function extractErrorMessage(body: unknown): string | undefined {
  if (typeof body !== 'object' || body === null) return undefined
  const errorBody = body as Record<string, unknown>

  if (typeof errorBody.detail === 'string') return errorBody.detail
  if (typeof errorBody.message === 'string') return errorBody.message

  const arrayKeys = ['error', 'non_field_errors']
  for (const key of arrayKeys) {
    const arr = errorBody[key]
    if (Array.isArray(arr) && typeof arr[0] === 'string') return arr[0]
  }

  return undefined
}

export async function requestOcupacionalToken(
  credentials: LoginCredentials
): Promise<OcupacionalAuthResponse> {
  let response: Response

  try {
    response = await fetch(`${API_BASE_URL}/account/api/token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })
  } catch {
    throw new OcupacionalAuthError(
      'No se pudo conectar con el servidor. Verifique su conexión a internet.',
      'NETWORK_ERROR'
    )
  }

  let body: unknown
  try {
    body = await response.json()
  } catch {
    throw new OcupacionalAuthError(
      'La respuesta del servidor no es válida. Intente nuevamente más tarde.',
      'INVALID_RESPONSE'
    )
  }

  if (!response.ok) {
    throw new OcupacionalAuthError(
      extractErrorMessage(body) ??
        'Error al iniciar sesión. Verifique sus credenciales.',
      'SERVER_ERROR'
    )
  }

  const data = body as Partial<OcupacionalAuthResponse>
  if (
    typeof data.token !== 'string' ||
    data.token.length === 0 ||
    typeof data.user_id !== 'number' ||
    typeof data.email !== 'string'
  ) {
    throw new OcupacionalAuthError(
      'La respuesta del servidor está incompleta. Contacte al administrador.',
      'INVALID_RESPONSE'
    )
  }

  return data as OcupacionalAuthResponse
}
