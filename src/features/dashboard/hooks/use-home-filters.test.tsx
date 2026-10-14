import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useHomeFilters } from './use-home-filters'

const mockNavigate = vi.fn()
let mockSearch: Record<string, string | undefined> = {}

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearch,
}))

vi.mock('../api/headquarters', () => ({
  fetchHeadquarters: vi.fn().mockResolvedValue({
    count: 2,
    results: [
      {
        id: 67,
        name: 'Salaverry',
        is_active: true,
        electrical_panels: [
          { id: 39, name: 'TG-TR2', is_active: true, type: 'trifasico', threads: 3 },
          { id: 34, name: 'TTA-TR1', is_active: true, type: 'trifasico', threads: 3 },
        ],
      },
      {
        id: 68,
        name: 'Lima HQ',
        is_active: true,
        electrical_panels: [
          { id: 40, name: 'Panel A', is_active: true, type: 'trifasico', threads: 3 },
        ],
      },
    ],
  }),
}))

vi.mock('../api/measurement-points', () => ({
  fetchDeviceMeasurementPointsList: vi.fn().mockResolvedValue({
    count: 1,
    next: null,
    previous: null,
    results: [
      {
        id: 77,
        name: 'Chiller 1',
        is_active: true,
        channel: 'channel 1',
        type: 'trifasico',
        key: 'chiller-1',
        capacity: '460v/2000A',
        hardware: 'Analizador',
        device: 'ADW300',
        dev_eui: '00956906000ab814',
        electrical_panel: 'TG-TR2',
        location_reference: 'Sala de máquinas',
        installation_date: '2024-01-01',
      },
    ],
  }),
}))

vi.mock('../api/favorite-points', () => ({
  fetchFavoritePoints: vi.fn().mockResolvedValue({ count: 0, results: [] }),
}))

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useHomeFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearch = {}
  })

  it('auto-selects first active headquarter, panel and category when URL is empty', async () => {
    renderHook(() => useHomeFilters(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })

    const lastCall = mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1]
    expect(lastCall[0].search).toMatchObject({
      sede: '67',
      panel: '39',
      categoria: 'power',
    })
  })

  it('auto-selects first panel of the new sede when sede changes', async () => {
    mockSearch = {
      sede: '67',
      panel: '34',
      categoria: 'power',
      desde: '2026-05-01',
      hasta: '2026-05-10',
    }

    const { result } = renderHook(() => useHomeFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.headquarters.length).toBe(2)
    })

    result.current.setSedeId(68)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({
            sede: '68',
            panel: '40',
            punto: undefined,
          }),
        })
      )
    })
  })

  it('auto-selects first measurement point when punto is missing', async () => {
    mockSearch = {
      sede: '67',
      panel: '39',
      categoria: 'power',
      desde: '2026-05-01',
      hasta: '2026-05-10',
    }

    renderHook(() => useHomeFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({
            sede: '67',
            panel: '39',
            punto: '77',
          }),
        })
      )
    })
  })
})
