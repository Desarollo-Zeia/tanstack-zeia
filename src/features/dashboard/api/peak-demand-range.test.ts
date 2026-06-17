import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPeakDemandRange } from './peak-demand-range'
import * as apiClient from '@/lib/api-client'

describe('fetchPeakDemandRange', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct path', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      date: '2026-06-19',
      hour_start: '18:00',
      hour_end: '19:00',
      description: 'Rango de máxima demanda programada COES',
    })

    await fetchPeakDemandRange()

    expect(apiFetchSpy).toHaveBeenCalledWith('/coes/peak-demand-range/')
  })
})
