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
          id: 35,
          energy_headquarter: 199,
          start_date: '2026-09-01',
          end_date: '2026-09-30',
          is_current: true,
          billing_type: 'water',
        },
        {
          id: 24,
          energy_headquarter: 199,
          start_date: '2026-08-01',
          end_date: '2026-08-31',
          is_current: false,
          billing_type: 'water',
        },
      ],
    })

    const result = await fetchWaterBillingCycles(199)

    expect(result.count).toBe(2)
    expect(result.results).toHaveLength(2)
    expect(result.results[0].is_current).toBe(true)
    expect(result.results[0].billing_type).toBe('water')
  })
})
