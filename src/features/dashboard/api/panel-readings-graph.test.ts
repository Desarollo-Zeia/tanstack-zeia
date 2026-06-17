import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchPanelReadingsGraph } from './panel-readings-graph'
import * as apiClient from '@/lib/api-client'

describe('fetchPanelReadingsGraph', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct path, last_by=day and weekday=1,2,3,4,5', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue([])

    await fetchPanelReadingsGraph(
      67,
      39,
      77,
      '2026-06-01',
      '2026-06-30',
      'EPpos',
      '1,2,3,4,5'
    )

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/67/electrical_panel/39/measurement_points/77/readings/graph?date_after=2026-06-01&date_before=2026-06-30&indicador=EPpos&last_by=day&weekday=1%2C2%2C3%2C4%2C5'
    )
  })

  it('sends weekday=6 for Saturday selection', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue([])

    await fetchPanelReadingsGraph(67, 39, 77, '2026-06-01', '2026-06-30', 'P', '6')

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/67/electrical_panel/39/measurement_points/77/readings/graph?date_after=2026-06-01&date_before=2026-06-30&indicador=P&last_by=day&weekday=6'
    )
  })

  it('sends weekday=7 for Sunday selection', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue([])

    await fetchPanelReadingsGraph(67, 39, 77, '2026-06-01', '2026-06-30', 'Q', '7')

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/67/electrical_panel/39/measurement_points/77/readings/graph?date_after=2026-06-01&date_before=2026-06-30&indicador=Q&last_by=day&weekday=7'
    )
  })

  it('returns ReadingGraphPoint[] shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue([
      {
        period: '2026-06-01',
        first_reading: '2026-06-01T00:00:00Z',
        last_reading: '2026-06-01T23:59:59Z',
        indicator: 'EPpos',
        unit: 'KWh',
        first_value: 100,
        last_value: 120.5,
        difference: 20.5,
        device: 'Analizador de red Trifásico - 4000A',
        measurement_point: 'Chiller 1',
      },
    ])

    const result = await fetchPanelReadingsGraph(
      67,
      39,
      77,
      '2026-06-01',
      '2026-06-30',
      'EPpos',
      '1,2,3,4,5'
    )

    expect(result).toHaveLength(1)
    expect(result[0].indicator).toBe('EPpos')
    expect(result[0].unit).toBe('KWh')
    expect(result[0].first_value).toBe(100)
    expect(result[0].last_value).toBe(120.5)
    expect(result[0].difference).toBe(20.5)
  })
})
