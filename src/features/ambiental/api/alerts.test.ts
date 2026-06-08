import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchAlerts } from './alerts'
import * as apiClient from '@/lib/ocupacional-api-client'

describe('fetchAlerts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiOcupacionalFetch with correct path and params', async () => {
    const apiFetchSpy = vi
      .spyOn(apiClient, 'apiOcupacionalFetch')
      .mockResolvedValue({
        count: 2,
        next: null,
        previous: null,
        results: [
          {
            indicator: 'CO2',
            unit: 'PPM',
            value: '1004',
            level: 'UNHEALTHY',
            resolved: false,
            hours: '03:56 PM',
            date: '2026-06-03',
          },
        ],
      })

    await fetchAlerts({
      roomId: 364,
      indicator: 'CO2',
      dateAfter: '2026-06-01',
      dateBefore: '2026-06-03',
      page: 2,
    })

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/alerts/api/room/364/alerts/?indicator=CO2&date_after=2026-06-01&date_before=2026-06-03&page=2'
    )
  })

  it('calls apiOcupacionalFetch without optional params when not provided', async () => {
    const apiFetchSpy = vi
      .spyOn(apiClient, 'apiOcupacionalFetch')
      .mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      })

    await fetchAlerts({ roomId: 364 })

    expect(apiFetchSpy).toHaveBeenCalledWith('/alerts/api/room/364/alerts/')
  })

  it('does not include page when page is 1', async () => {
    const apiFetchSpy = vi
      .spyOn(apiClient, 'apiOcupacionalFetch')
      .mockResolvedValue({
        count: 0,
        next: null,
        previous: null,
        results: [],
      })

    await fetchAlerts({ roomId: 364, page: 1 })

    expect(apiFetchSpy).toHaveBeenCalledWith('/alerts/api/room/364/alerts/')
  })
})
