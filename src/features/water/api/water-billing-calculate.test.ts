import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchWaterBillingCalculate } from './water-billing-calculate'
import * as apiClient from '@/lib/api-client'

describe('fetchWaterBillingCalculate', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with start_date and end_date query params', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      headquarter_id: 199,
      start_date: '2026-09-01',
      end_date: '2026-09-30',
      results: [],
      total_amount: 0,
      currency: 'PEN',
      totals_by_currency: { PEN: 0 },
    })

    await fetchWaterBillingCalculate(199, '2026-09-01', '2026-09-30')

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/199/water/billing-calculate/?start_date=2026-09-01&end_date=2026-09-30'
    )
  })

  it('returns WaterBillingCalculateResponse shape with factor details', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      headquarter_id: 199,
      start_date: '2026-09-01',
      end_date: '2026-09-30',
      results: [
        {
          code: 'agua_potable',
          name: 'Consumo de agua potable',
          value: 1225.98,
          currency: 'PEN',
          details: {
            consumption: 139.0,
            unit: 'm³',
            rate: 8.82,
            rate_unit: 'PEN/m³',
          },
        },
        {
          code: 'alcantarillado',
          name: 'Consumo de alcantarillado',
          value: 468.152,
          currency: 'PEN',
          details: {
            consumption: 139.0,
            factor: 0.8,
            billed_volume: 111.2,
            unit: 'm³',
            rate: 4.21,
            rate_unit: 'PEN/m³',
          },
        },
      ],
      total_amount: 1694.13,
      currency: 'PEN',
      totals_by_currency: { PEN: 1694.13 },
    })

    const result = await fetchWaterBillingCalculate(199, '2026-09-01', '2026-09-30')

    expect(result.headquarter_id).toBe(199)
    expect(result.results).toHaveLength(2)
    expect(result.results[1].details?.factor).toBe(0.8)
    expect(result.results[1].details?.billed_volume).toBe(111.2)
    expect(result.totals_by_currency).toEqual({ PEN: 1694.13 })
  })
})
