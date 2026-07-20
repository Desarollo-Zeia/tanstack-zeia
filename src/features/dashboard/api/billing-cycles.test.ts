import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchBillingCycles } from './billing-cycles'
import * as apiClient from '@/lib/api-client'

describe('fetchBillingCycles', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct path', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 0,
      results: [],
    })

    await fetchBillingCycles(67)

    expect(apiFetchSpy).toHaveBeenCalledWith('/headquarter/67/billing-cycles/')
  })

  it('returns BillingCyclesResponse shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 1,
      results: [
        {
          id: 1,
          energy_headquarter: 67,
          start_date: '2026-07-01',
          end_date: '2026-07-31',
          is_current: true,
        },
      ],
    })

    const result = await fetchBillingCycles(67)

    expect(result.count).toBe(1)
    expect(result.results).toHaveLength(1)
    expect(result.results[0].energy_headquarter).toBe(67)
    expect(result.results[0].start_date).toBe('2026-07-01')
    expect(result.results[0].end_date).toBe('2026-07-31')
    expect(result.results[0].is_current).toBe(true)
  })
})
