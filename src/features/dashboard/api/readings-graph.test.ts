import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchReadingsGraph } from './readings-graph'
import * as apiClient from '@/lib/api-client'

describe('fetchReadingsGraph', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct URL and query params', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue([])

    await fetchReadingsGraph(67, 39, 77, '2026-05-26', '2026-05-26', 'P')

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/67/electrical_panel/39/measurement_points/77/readings/graph?date_after=2026-05-26&date_before=2026-05-26&indicador=P&last_by=minute'
    )
  })

  it('returns array of ReadingGraphPoint', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue([
      {
        period: '2026-05-26T00:08:00-05:00',
        first_reading: '2026-05-26T00:00:24.022981-05:00',
        last_reading: '2026-05-26T00:00:24.022981-05:00',
        indicator: 'P',
        unit: 'KW',
        first_value: 0.0,
        last_value: 0.0,
        difference: null,
        device: '00956906000ab814',
        measurement_point: 'Chiller 1',
      },
      {
        period: '2026-05-26T00:09:00-05:00',
        first_reading: '2026-05-26T00:01:26.019807-05:00',
        last_reading: '2026-05-26T00:01:26.019807-05:00',
        indicator: 'P',
        unit: 'KW',
        first_value: 0.0,
        last_value: 0.0,
        difference: null,
        device: '00956906000ab814',
        measurement_point: 'Chiller 1',
      },
    ])

    const result = await fetchReadingsGraph(67, 39, 77, '2026-05-26', '2026-05-26', 'P')

    expect(Array.isArray(result)).toBe(true)
    expect(result).toHaveLength(2)
    expect(result[0].indicator).toBe('P')
    expect(result[0].unit).toBe('KW')
    expect(result[0].first_value).toBe(0.0)
  })
})
