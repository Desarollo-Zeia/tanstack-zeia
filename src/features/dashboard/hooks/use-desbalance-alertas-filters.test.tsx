import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDesbalanceAlertasFilters } from './use-desbalance-alertas-filters'

const mockNavigate = vi.fn()
let mockSearch: Record<string, string | undefined> = {}

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearch,
}))

vi.mock('../api/headquarters', () => ({
  fetchHeadquarters: vi.fn().mockResolvedValue({
    count: 1,
    results: [
      {
        id: 67,
        name: 'Salaverry',
        is_active: true,
        electrical_panels: [
          { id: 39, name: 'TG-TR2', is_active: true, type: 'trifasico', threads: 3 },
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useDesbalanceAlertasFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearch = {}
  })

  it('auto-selects first active headquarter, panel, punto and current date range', async () => {
    renderHook(() => useDesbalanceAlertasFilters(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })

    const lastCall = mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1]
    const search = lastCall[0].search
    expect(search.sede).toBe('67')
    expect(search.panel).toBe('39')
    expect(search.desde).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(search.hasta).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('reads initial state from URL params', async () => {
    mockSearch = {
      sede: '67',
      panel: '39',
      punto: '77',
      desde: '2026-05-01',
      hasta: '2026-05-10',
    }

    const { result } = renderHook(() => useDesbalanceAlertasFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.puntoId).toBe(77)
    })

    expect(result.current.sedeId).toBe(67)
    expect(result.current.panelId).toBe(39)
    expect(result.current.dateAfter).toBeInstanceOf(Date)
    expect(result.current.dateBefore).toBeInstanceOf(Date)
    expect(result.current.dateAfter?.getDate()).toBe(1)
    expect(result.current.dateBefore?.getDate()).toBe(10)
  })

  it('updates URL when punto changes', async () => {
    mockSearch = {
      sede: '67',
      panel: '39',
      punto: '77',
      desde: '2026-05-01',
      hasta: '2026-05-10',
    }

    const { result } = renderHook(() => useDesbalanceAlertasFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.puntoId).toBe(77)
    })

    result.current.setPuntoId(88)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({ punto: '88' }),
          resetScroll: false,
        })
      )
    })
  })

  it('reports isReady when all filters are set in URL', async () => {
    mockSearch = {
      sede: '67',
      panel: '39',
      punto: '77',
      desde: '2026-05-01',
      hasta: '2026-05-10',
    }

    const { result } = renderHook(() => useDesbalanceAlertasFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
  })
})
