import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchWaterConsumptionCycleDetail } from './water-consumption-cycle-detail'
import * as apiClient from '@/lib/api-client'

describe('fetchWaterConsumptionCycleDetail', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with the water consumption-cycle detail path', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      water_discharge_factor: 0.8,
      billing_cycle_start: '2026-09-01',
      billing_cycle_end: '2026-09-30',
      ratedays: 14,
      totalratedays: 30,
      water_pipes: [],
    })

    await fetchWaterConsumptionCycleDetail(199)

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/199/water/consumption-cycle/detail/'
    )
  })

  it('returns WaterConsumptionCycleDetail shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      water_discharge_factor: 0.8,
      billing_cycle_start: '2026-09-01',
      billing_cycle_end: '2026-09-30',
      ratedays: 14,
      totalratedays: 30,
      water_pipes: [
        { id: 1, name: 'Tuberia Principal Test', is_main: true, measurement_points: 3 },
        { id: 2, name: 'Tuberia Secundaria Test', is_main: false, measurement_points: 1 },
      ],
    })

    const result = await fetchWaterConsumptionCycleDetail(199)

    expect(result.water_discharge_factor).toBe(0.8)
    expect(result.ratedays).toBe(14)
    expect(result.totalratedays).toBe(30)
    expect(result.water_pipes).toHaveLength(2)
    expect(result.water_pipes[0].is_main).toBe(true)
  })
})
