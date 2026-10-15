import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAlertasFilters } from './use-alertas-filters'

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
        ],
      },
      {
        id: 68,
        name: 'Jockey Plaza',
        is_active: true,
        electrical_panels: [
          { id: 40, name: 'Tablero General TG', is_active: true, type: 'trifasico', threads: 3 },
        ],
      },
    ],
  }),
}))

vi.mock('../api/measurement-points', () => ({
  fetchDeviceMeasurementPointsList: vi.fn().mockResolvedValue({
    count: 2,
    results: [
      { id: 77, name: 'Punto 1', is_active: true },
      { id: 78, name: 'Punto 2', is_active: true },
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

describe('useAlertasFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearch = {}
  })

  it('restores the last selected sede and panel when URL is empty', async () => {
    localStorage.setItem(
      'zeia-filter-selection',
      JSON.stringify({ energy: { sede: 68, panel: 40, punto: 78 } })
    )

    renderHook(() => useAlertasFilters(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({ sede: '68', panel: '40' }),
        })
      )
    })
  })

  it('restores the last selected punto when URL has sede and panel but no punto', async () => {
    localStorage.setItem(
      'zeia-filter-selection',
      JSON.stringify({ energy: { sede: 68, panel: 40, punto: 78 } })
    )
    mockSearch = { sede: '68', panel: '40', desde: '2026-05-01', hasta: '2026-05-10' }

    renderHook(() => useAlertasFilters(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({ punto: '78' }),
        })
      )
    })
  })

  it('falls back to the first active point when the persisted punto is stale', async () => {
    localStorage.setItem(
      'zeia-filter-selection',
      JSON.stringify({ energy: { sede: 68, panel: 40, punto: 9999 } })
    )
    mockSearch = { sede: '68', panel: '40', desde: '2026-05-01', hasta: '2026-05-10' }

    renderHook(() => useAlertasFilters(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({ punto: '77' }),
        })
      )
    })
  })

  it('persists the effective selection so other modules can restore it', async () => {
    mockSearch = {
      sede: '68',
      panel: '40',
      punto: '78',
      desde: '2026-05-01',
      hasta: '2026-05-10',
    }

    renderHook(() => useAlertasFilters(), { wrapper: createWrapper() })

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem('zeia-filter-selection') || '{}')
      expect(stored.energy).toMatchObject({ sede: 68, panel: 40, punto: 78 })
    })
  })
})
