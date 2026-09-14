import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchWaterBillingConcepts } from './water-billing-concepts'
import * as apiClient from '@/lib/api-client'

describe('fetchWaterBillingConcepts', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with the water billing-concepts path', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    })

    await fetchWaterBillingConcepts(199)

    expect(apiFetchSpy).toHaveBeenCalledWith('/headquarter/199/water/billing-concepts/')
  })

  it('returns WaterBillingConceptsResponse shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 2,
      next: null,
      previous: null,
      results: [
        {
          id: 10,
          billing_permission: {
            id: 21,
            code: 'agua_potable',
            name: 'Consumo de agua potable',
            billing_type: 'water',
            is_active: true,
          },
          currency: 'PEN',
          rate: 8.82,
          is_active: true,
          created_at: '2026-09-14T10:00:00-05:00',
          modified_at: '2026-09-14T10:00:00-05:00',
        },
        {
          id: 11,
          billing_permission: {
            id: 22,
            code: 'alcantarillado',
            name: 'Consumo de alcantarillado',
            billing_type: 'water',
            is_active: true,
          },
          currency: 'PEN',
          rate: null,
          is_active: true,
          created_at: '2026-09-14T10:00:00-05:00',
          modified_at: '2026-09-14T10:00:00-05:00',
        },
      ],
    })

    const result = await fetchWaterBillingConcepts(199)

    expect(result.count).toBe(2)
    expect(result.results).toHaveLength(2)
    expect(result.results[0].billing_permission.billing_type).toBe('water')
    expect(result.results[0].rate).toBe(8.82)
    expect(result.results[1].rate).toBeNull()
  })
})
