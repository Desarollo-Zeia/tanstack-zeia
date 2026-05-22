import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiFetch } from './api-client'

describe('apiFetch', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
  })

  it('throws error when no token is found', async () => {
    await expect(apiFetch('/test')).rejects.toThrow('No authentication token found')
  })

  it('includes Authorization header with token from localStorage', async () => {
    localStorage.setItem('zeia-auth', JSON.stringify({ token: 'my-test-token' }))

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ data: true }), { status: 200 })
    )

    await apiFetch('/test-endpoint')

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.energy.zeia.com.pe/api/v1/test-endpoint',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Token my-test-token',
          'Content-Type': 'application/json',
        }),
      })
    )
  })

  it('returns parsed JSON on success', async () => {
    localStorage.setItem('zeia-auth', JSON.stringify({ token: 'abc123' }))

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ count: 1, results: [] }), { status: 200 })
    )

    const result = await apiFetch('/user/headquarters/')
    expect(result).toEqual({ count: 1, results: [] })
  })

  it('throws error with message from API response', async () => {
    localStorage.setItem('zeia-auth', JSON.stringify({ token: 'abc123' }))

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ message: 'Sede no encontrada' }), { status: 404 })
    )

    await expect(apiFetch('/bad-endpoint')).rejects.toThrow('Sede no encontrada')
  })

  it('throws generic error when API returns non-JSON error', async () => {
    localStorage.setItem('zeia-auth', JSON.stringify({ token: 'abc123' }))

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('Internal Server Error', { status: 500, statusText: 'Internal Server Error' })
    )

    await expect(apiFetch('/server-error')).rejects.toThrow('HTTP 500: Internal Server Error')
  })
})
