import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCurrentImbalanced } from './current-imbalanced'
import * as apiClient from '@/lib/api-client'

const mockResponse = {
  count: 1,
  next: null,
  previous: null,
  results: [
    {
      id: 5381768,
      created_at: '2026-05-20T11:18:57.085659-05:00',
      device: {
        name: 'Analizador de red Trifásico - 4000A',
        dev_eui: '00956906000ab814',
      },
      values_per_channel: [
        {
          channel: 1,
          values: {
            Ia: 28.19,
            Ib: 26.0,
            Ic: 23.06,
          },
        },
      ],
      balance_status: 'Desbalanceado',
      cuf_percentage: 10,
    },
  ],
}

describe('fetchCurrentImbalanced', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct URL, status and date params', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue(mockResponse)

    await fetchCurrentImbalanced(67, 39, 77, '2026-05-01', '2026-05-31', 2)

    expect(apiFetchSpy).toHaveBeenCalledWith(
      '/headquarter/67/electrical_panel/39/measurement_point/77/current-imbalanced?status=unbalanced&date_after=2026-05-01&date_before=2026-05-31&page=2'
    )
  })

  it('returns ImbalancedEventsResponse shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue(mockResponse)

    const result = await fetchCurrentImbalanced(67, 39, 77, '2026-05-01', '2026-05-31')

    expect(result.count).toBe(1)
    expect(result.results).toHaveLength(1)
    expect(result.results[0].cuf_percentage).toBe(10)
    expect(result.results[0].values_per_channel[0].values.Ia).toBe(28.19)
  })
})
