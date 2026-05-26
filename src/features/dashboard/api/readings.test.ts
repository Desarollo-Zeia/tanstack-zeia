import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchReadings } from './readings'
import * as apiClient from '@/lib/api-client'

describe('fetchReadings', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct URL and query params', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 946,
      next: null,
      previous: null,
      results: [],
    })

    await fetchReadings(67, 39, 77, '2026-05-26', '2026-05-26', 'power')

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/67/electrical_panel/39/measurement_points/77/readings?date_after=2026-05-26&date_before=2026-05-26&category=power&page=1'
    )
  })

  it('calls apiFetch with page parameter', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 946,
      next: null,
      previous: null,
      results: [],
    })

    await fetchReadings(67, 39, 77, '2026-05-26', '2026-05-26', 'power', 2)

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/67/electrical_panel/39/measurement_points/77/readings?date_after=2026-05-26&date_before=2026-05-26&category=power&page=2'
    )
  })

  it('returns ReadingsResponse shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 946,
      next: 'https://api.energy.zeia.com.pe/api/v1/headquarter/67/electrical_panel/39/measurement_points/77/readings?category=power&date_after=2026-05-26&date_before=2026-05-26&page=2',
      previous: null,
      results: [
        {
          created_at: '2026-05-26T16:16:51.036513-05:00',
          device: {
            id: 72,
            name: 'Analizador de red Trifásico - 4000A',
            model: 'ADW300',
            dev_eui: '00956906000ab814',
          },
          indicators: {
            id: 5648818,
            values: { P: 100.07, Q: 101.84 },
            measurement_point_name: 'Chiller 1',
          },
        },
        {
          created_at: '2026-05-26T16:15:49.053389-05:00',
          device: {
            id: 72,
            name: 'Analizador de red Trifásico - 4000A',
            model: 'ADW300',
            dev_eui: '00956906000ab814',
          },
          indicators: {
            id: 5648787,
            values: { P: 99.76, Q: 102.32 },
            measurement_point_name: 'Chiller 1',
          },
        },
      ],
    })

    const result = await fetchReadings(67, 39, 77, '2026-05-26', '2026-05-26', 'power')

    expect(result.count).toBe(946)
    expect(result.results).toHaveLength(2)
    expect(result.results[0].created_at).toBe('2026-05-26T16:16:51.036513-05:00')
    expect(result.results[0].indicators.values).toHaveProperty('P')
    expect(result.results[0].indicators.values).toHaveProperty('Q')
    expect(result.results[0].indicators.measurement_point_name).toBe('Chiller 1')
  })
})
