import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchWaterBillingCycles } from './water-billing-cycles'
import * as apiClient from '@/lib/api-client'

describe('fetchWaterBillingCycles', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with the water billing-cycles path', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 0,
      results: [],
    })

    await fetchWaterBillingCycles(199)

    expect(apiFetchSpy).toHaveBeenCalledWith('/headquarter/199/water/billing-cycles/')
  })

  it('returns WaterBillingCyclesResponse shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 2,
      results: [
        {
          id: 30,
          energy_headquarter: 200,
          name: 'Octubre 2026',
          start_date: '2026-09-30',
          end_date: '2026-10-29',
          is_current: true,
          billing_type: 'water',
        },
        {
          id: 28,
          energy_headquarter: 200,
          name: 'Septiembre 2026',
          start_date: '2026-09-04',
          end_date: '2026-09-29',
          is_current: false,
          billing_type: 'water',
        },
      ],
    })

    const result = await fetchWaterBillingCycles(200)

    expect(result.count).toBe(2)
    expect(result.results).toHaveLength(2)
    expect(result.results[0].name).toBe('Octubre 2026')
    expect(result.results[1].name).toBe('Septiembre 2026')
    expect(result.results[0].is_current).toBe(true)
    expect(result.results[0].billing_type).toBe('water')
  })
})
