import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchVoltageImbalanced } from './voltage-imbalanced'
import * as apiClient from '@/lib/api-client'

const mockResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 12345,
      created_at: '2026-05-20T11:18:57.085659-05:00',
      device: {
        name: 'Analizador de red Trifásico - 4000A',
        dev_eui: '00956906000ab814',
      },
      values_per_channel: [
        {
          channel: 1,
          values: {
            Uab: 454.04,
            Ubc: 454.95,
            Uac: 455.98,
          },
        },
      ],
      balance_status: 'Desbalanceado',
      cuf_percentage: 5,
    },
  ],
}

describe('fetchVoltageImbalanced', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct URL, status and date params', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue(mockResponse)

    await fetchVoltageImbalanced(67, 39, 77, '2026-05-01', '2026-05-31', 3)

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/67/electrical_panel/39/measurement_point/77/voltage-imbalanced?status=unbalanced&date_after=2026-05-01&date_before=2026-05-31&page=3'
    )
  })

  it('returns ImbalancedEventsResponse shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue(mockResponse)

    const result = await fetchVoltageImbalanced(67, 39, 77, '2026-05-01', '2026-05-31')

    expect(result.count).toBe(1)
    expect(result.results).toHaveLength(1)
    expect(result.results[0].cuf_percentage).toBe(5)
    expect(result.results[0].values_per_channel[0].values.Uab).toBe(454.04)
  })
})
