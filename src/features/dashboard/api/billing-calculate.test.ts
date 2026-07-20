import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchBillingCalculate } from './billing-calculate'
import * as apiClient from '@/lib/api-client'

describe('fetchBillingCalculate', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct path and query params', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      headquarter_id: 67,
      start_date: '2026-03-01',
      end_date: '2026-03-30',
      results: [],
      total_amount: 0,
      currency: 'USD',
    })

    await fetchBillingCalculate(67, '2026-03-01', '2026-03-30')

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/67/billing-calculate/?start_date=2026-03-01&end_date=2026-03-30'
    )
  })

  it('returns BillingCalculateResponse shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      headquarter_id: 67,
      start_date: '2026-03-01',
      end_date: '2026-03-30',
      results: [
        {
          code: 'cargo_fijo_mensual',
          name: 'Cargo fijo mensual',
          value: 1.0,
          currency: 'USD',
          details: null,
        },
        {
          code: 'energia_activa_horas_punta',
          name: 'Cargo por energía activa en horas punta',
          value: 1263.4338518000013,
          currency: 'USD',
          details: {
            consumption: 33.091510000000035,
            unit: 'MWh',
            rate: 38.18,
            rate_unit: 'USD/MWh',
          },
        },
        {
          code: 'potencia_activa_generacion_punta',
          name: 'Cargo por potencia activa de generación en horas punta',
          value: 2712.5625,
          currency: 'USD',
          details: {
            max_power: 434.01,
            max_power_datetime: '2026-03-25T19:48:00-05:00',
            rate: 6.25,
            rate_unit: 'USD/kW',
          },
        },
      ],
      total_amount: 3976.99,
      currency: 'USD',
    })

    const result = await fetchBillingCalculate(67, '2026-03-01', '2026-03-30')

    expect(result.headquarter_id).toBe(67)
    expect(result.results).toHaveLength(3)
    expect(result.results[0].code).toBe('cargo_fijo_mensual')
    expect(result.results[0].details).toBeNull()
    expect(result.results[1].details).toMatchObject({ unit: 'MWh', rate_unit: 'USD/MWh' })
    expect(result.results[2].details).toMatchObject({ max_power: 434.01 })
    expect(result.total_amount).toBe(3976.99)
    expect(result.currency).toBe('USD')
  })
})
