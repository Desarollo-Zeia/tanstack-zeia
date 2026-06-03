const AUTH_STORAGE_KEY = 'zeia-auth'

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
