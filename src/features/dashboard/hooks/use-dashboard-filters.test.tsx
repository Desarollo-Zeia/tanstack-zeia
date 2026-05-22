import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useDashboardFilters } from './use-dashboard-filters'

// Mock TanStack Router
const mockNavigate = vi.fn()
const mockSearch: Record<string, string | undefined> = {}

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
    // Clear search params
    Object.keys(mockSearch).forEach((key) => delete mockSearch[key])
  })

  it('auto-selects first active headquarter on mount', async () => {
    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.sedeId).toBe(67)
    })
  })

  it('auto-selects first panel of the selected headquarter', async () => {
    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.panelId).toBe(39)
    })
  })

  it('sets default dates to today', async () => {
    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.dateAfter).toBeInstanceOf(Date)
      expect(result.current.dateBefore).toBeInstanceOf(Date)
    })

    const today = new Date()
    expect(result.current.dateAfter?.getDate()).toBe(today.getDate())
    expect(result.current.dateBefore?.getDate()).toBe(today.getDate())
  })

  it('updates panelId when sede changes', async () => {
    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.sedeId).toBe(67)
    })

    // Change sede
    result.current.setSedeId(68)

    await waitFor(() => {
      expect(result.current.sedeId).toBe(68)
      expect(result.current.panelId).toBe(40) // First panel of Lima HQ
    })
  })

  it('updates URL params when filters change', async () => {
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

  it('reads initial state from URL params', async () => {
    mockSearch.sede = '68'
    mockSearch.panel = '40'
    mockSearch.desde = '2026-05-01'
    mockSearch.hasta = '2026-05-10'

    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.sedeId).toBe(68)
      expect(result.current.panelId).toBe(40)
      expect(result.current.dateAfter).toBeInstanceOf(Date)
      expect(result.current.dateBefore).toBeInstanceOf(Date)
    })

    expect(result.current.dateAfter?.getDate()).toBe(1)
    expect(result.current.dateBefore?.getDate()).toBe(10)
  })

  it('reports isReady when all filters are set', async () => {
    const { result } = renderHook(() => useDashboardFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
  })
})
