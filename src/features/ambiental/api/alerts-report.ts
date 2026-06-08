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

export async function downloadAlertsReport(
  dateAfter: string,
  dateBefore: string,
  filename: string
): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error('downloadAlertsReport is only available in the browser')
  }

  const token = getToken()
  if (!token) {
    throw new Error('No authentication token found')
  }

  const params = new URLSearchParams({
    date_after: dateAfter,
    date_before: dateBefore,
  })

  const url = `${API_BASE_URL}/alerts/api/rooms/report/?${params.toString()}`

  const response = await fetch(url, {
    headers: {
      Authorization: `Token ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error('Failed to download report')
  }

  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = blobUrl
  a.download = filename
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(blobUrl)
  document.body.removeChild(a)
}
