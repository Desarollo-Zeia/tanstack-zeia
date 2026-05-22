import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchMeasurementPoints } from './measurement-points'
import * as apiClient from '@/lib/api-client'

describe('fetchMeasurementPoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct path', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 1,
      results: [],
    })

    await fetchMeasurementPoints(67)

    expect(apiFetchSpy).toHaveBeenCalledWith('/headquarter/67/measurement-points/')
  })

  it('returns MeasurementPointsResponse shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 1,
      results: [
        {
          id: 39,
          name: 'TG-TR2 (TF-AA) - HVAC',
          is_active: true,
          type: 'trifasico',
          threads: 3,
          devices: [
            {
              id: 70,
              name: 'Analizador de red Trifásico - 4000A',
              dev_eui: '00956906000ab9b5',
              measurement_points: [
                {
                  id: 76,
                  name: 'TG-TR2 (TF-AA)',
                  is_active: true,
                  channel: 'channel 1',
                  type: 'trifasico',
                  key: 'IG',
                  capacity: '460v/2000A',
                  hardware: 'Analizador de red Trifásico - 4000A',
                  location_reference: '',
                  installation_date: null,
                  energy_thresholds: {
                    thresholds_values: {
                      workdays: { superior: 0.0, inferior: 0.0 },
                      saturday: { superior: 0.0, inferior: 0.0 },
                      sunday: { superior: 0.0, inferior: 0.0 },
                    },
                    last_threshold_calculation: null,
                  },
                },
              ],
            },
          ],
        },
      ],
    })

    const result = await fetchMeasurementPoints(67)

    expect(result.count).toBe(1)
    expect(result.results[0].id).toBe(39)
    expect(result.results[0].devices).toHaveLength(1)
    expect(result.results[0].devices[0].measurement_points[0].id).toBe(76)
  })
})
