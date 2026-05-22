import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchConsumptionDistribution } from './consumption'
import * as apiClient from '@/lib/api-client'

describe('fetchConsumptionDistribution', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct URL and query params', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      headquarter_id: 67,
      electrical_panel_id: 39,
      main_consumption_kwh: 3176.71,
      total_measurement_points: 9,
      date_range: { type: 'custom', start_date: '2026-05-13', end_date: '2026-05-13' },
      results: [],
    })

    await fetchConsumptionDistribution(67, 39, '2026-05-13', '2026-05-13')

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/67/electrical_panel/39/consumption-distribution/?date_after=2026-05-13&date_before=2026-05-13'
    )
  })

  it('returns ConsumptionDistributionResponse shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      headquarter_id: 67,
      electrical_panel_id: 39,
      electrical_panel_name: 'TG-TR2 (TF-AA) - HVAC',
      main_consumption_kwh: 3176.71,
      total_measurement_points: 9,
      date_range: { type: 'custom', start_date: '2026-05-13', end_date: '2026-05-13' },
      results: [
        {
          measurement_point_id: 76,
          measurement_point_name: 'TG-TR2 (TF-AA)',
          device_name: 'Analizador de red Trifásico - 4000A',
          is_main: true,
          is_active: true,
          consumption_kwh: 3176.71,
          consumption_percentage: 100.0,
          channel: 'channel 1',
          type: 'trifasico',
          capacity: '460v/2000A',
          hardware: 'Analizador de red Trifásico - 4000A',
          first_reading_value: 272113.97,
          last_reading_value: 275290.68,
          first_reading_time: '2026-05-13T05:00:58.324595Z',
          last_reading_time: '2026-05-14T04:59:18.523209Z',
        },
      ],
    })

    const result = await fetchConsumptionDistribution(67, 39, '2026-05-13', '2026-05-13')

    expect(result.headquarter_id).toBe(67)
    expect(result.electrical_panel_id).toBe(39)
    expect(result.main_consumption_kwh).toBe(3176.71)
    expect(result.results).toHaveLength(1)
    expect(result.results[0].is_main).toBe(true)
  })
})
