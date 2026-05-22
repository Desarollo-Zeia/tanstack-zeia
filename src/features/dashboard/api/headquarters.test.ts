import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchHeadquarters } from './headquarters'
import * as apiClient from '@/lib/api-client'

describe('fetchHeadquarters', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct path', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 1,
      results: [{ id: 67, name: 'Salaverry', is_active: true, electrical_panels: [] }],
    })

    await fetchHeadquarters()

    expect(apiFetchSpy).toHaveBeenCalledWith('/user/headquarters/')
  })

  it('returns HeadquartersResponse shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      count: 1,
      results: [
        {
          id: 67,
          name: 'Salaverry',
          is_active: true,
          electrical_panels: [
            { id: 39, name: 'TG-TR2 (TF-AA) - HVAC', is_active: true, type: 'trifasico', threads: 3 },
          ],
        },
      ],
    })

    const result = await fetchHeadquarters()

    expect(result.count).toBe(1)
    expect(result.results[0].id).toBe(67)
    expect(result.results[0].electrical_panels).toHaveLength(1)
  })
})
