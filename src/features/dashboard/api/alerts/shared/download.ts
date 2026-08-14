const AUTH_STORAGE_KEY = 'zeia-auth'

export function parseContentDispositionFilename(disposition: string | null): string | null {
  if (!disposition) return null

  // RFC 5987: filename*=UTF-8''encoded-name (soporta acentos/espacios)
  const starMatch = /filename\*=UTF-8''([^;]+)/i.exec(disposition)
  if (starMatch) {
    try {
      return decodeURIComponent(starMatch[1])
    } catch {
      // encoding inválido, caer al formato simple
    }
  }

  const plainMatch = /filename="?([^";]+)"?/i.exec(disposition)
  return plainMatch ? plainMatch[1].trim() : null
}

export async function downloadExcelFile(
  url: string,
  filename: string
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('downloadExcelFile is only available in the browser')
  }

  const authData = localStorage.getItem(AUTH_STORAGE_KEY)
  if (!authData) {
    throw new Error('No authentication token found')
  }

  const { token } = JSON.parse(authData)

  const response = await fetch(url, {
    headers: {
      'Authorization': `Token ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to download report')
  }

  // Si el backend envía nombre en Content-Disposition, lo usamos;
  // si no, usamos el nombre definido en el frontend
  const serverFilename = parseContentDispositionFilename(
    response.headers.get('Content-Disposition')
  )
  const finalFilename = serverFilename ?? filename

  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = finalFilename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(blobUrl)
  document.body.removeChild(a)
}
