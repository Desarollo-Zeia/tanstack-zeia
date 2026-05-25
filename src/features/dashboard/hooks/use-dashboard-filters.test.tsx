import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardFilters } from './use-dashboard-filters'

// Mock TanStack Router
const mockNavigate = vi.fn()
let mockSearch: Record<string, string | undefined> = {}

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
  useSearch: () => mockSearch,
}))

// Mock API
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

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe('useDashboardFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearch = {}
  })

  it('auto-selects first active headquarter and panel when URL is empty', async () => {
    renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })

    const lastCall = mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1]
    expect(lastCall[0].search).toMatchObject({
      sede: '67',
      panel: '39',
    })
  })

  it('reads initial state from URL params', async () => {
    mockSearch = {
      sede: '68',
      panel: '40',
      desde: '2026-05-01',
      hasta: '2026-05-10',
    }

    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.sedeId).toBe(68)
      expect(result.current.panelId).toBe(40)
    })

    expect(result.current.dateAfter).toBeInstanceOf(Date)
    expect(result.current.dateBefore).toBeInstanceOf(Date)
    expect(result.current.dateAfter?.getDate()).toBe(1)
    expect(result.current.dateBefore?.getDate()).toBe(10)
  })

  it('updates URL when panel changes', async () => {
    mockSearch = {
      sede: '67',
      panel: '39',
      desde: '2026-05-01',
      hasta: '2026-05-10',
    }

    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.sedeId).toBe(67)
    })

    result.current.setPanelId(34)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({ panel: '34' }),
        })
      )
    })
  })

  it('resets panel and navigates when sede changes', async () => {
    mockSearch = {
      sede: '67',
      panel: '34',
      desde: '2026-05-01',
      hasta: '2026-05-10',
    }

    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.sedeId).toBe(67)
    })

    result.current.setSedeId(68)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({
            sede: '68',
            panel: undefined,
          }),
        })
      )
    })
  })

  it('reports isReady when all filters are set in URL', async () => {
    mockSearch = {
      sede: '67',
      panel: '39',
      desde: '2026-05-01',
      hasta: '2026-05-10',
    }

    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
  })

  it('reports isReady false when URL params are missing', async () => {
    mockSearch = {}

    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    // Before auto-select navigation completes
    expect(result.current.isReady).toBe(false)
  })

  it('does not auto-select again after initial navigation', async () => {
    mockSearch = {}

    renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1)
    })

    // Wait a bit and ensure no additional navigations
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(mockNavigate).toHaveBeenCalledTimes(1)
  })
})
