import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchDeviceMeasurementPointsList, fetchMeasurementPoints } from './measurement-points'
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

describe('fetchDeviceMeasurementPointsList', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('pide la primera página con page_size=100 (el backend pagina de a 10)', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 0,
      next: null,
      previous: null,
      results: [],
    })

    await fetchDeviceMeasurementPointsList(1, 2)

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/1/electrical_panel/2/devices/measurement-points/list/?page=1&page_size=100'
    )
  })

  it('devuelve topología, tensión nominal y bandas phase/line', async () => {
    // Ejemplo del backend: punto 40, 3F-3H, tolerancias 1.9% / 7.35%
    const band = { lower_threshold: 215.82, upper_threshold: 236.17, nominal_voltage: 220.0 }
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 40,
          name: 'Data center UPS / Transformadores',
          is_active: true,
          channel: 'Pinza 1',
          type: 'trifasico',
          key: null,
          capacity: '220v/220A',
          capacity_voltage: 220,
          monitoring_topology: 'three_phase_3w',
          hardware: 'Analizador Pro',
          device: 'Medidor TGA',
          electrical_panel: 'Tablero TGA',
          location_reference: 'Sala de tableros',
          thresholds: {
            voltage: { ...band, phase: band, line: band },
          },
        },
      ],
    })

    const result = await fetchDeviceMeasurementPointsList(1, 2)
    const point = result.results[0]

    expect(point.monitoring_topology).toBe('three_phase_3w')
    expect(point.capacity_voltage).toBe(220)
    expect(point.key).toBeNull()
    expect(point.thresholds?.voltage?.phase).toEqual(band)
    expect(point.thresholds?.voltage?.line).toEqual(band)
  })
})
