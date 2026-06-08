import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAlertsFilters } from './use-alerts-filters'

const mockedNavigate = vi.fn()

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockedNavigate,
  useSearch: () => ({
    sala: undefined,
    indicador: undefined,
    desde: undefined,
    hasta: undefined,
    pagina: undefined,
  }),
}))

vi.mock('../api/rooms', () => ({
  fetchOcupacionalRooms: vi.fn().mockResolvedValue({
    count: 2,
    next: null,
    previous: null,
    results: [
      { id: 1, name: 'Sala A', status: 'GOOD', headquarter: { id: 1, name: 'Sede 1' }, devices: [], report_link: null, is_activated: true, has_reports: true, co2_monitoring_time: 0 },
      { id: 2, name: 'Sala B', status: 'GOOD', headquarter: { id: 1, name: 'Sede 1' }, devices: [], report_link: null, is_activated: true, has_reports: true, co2_monitoring_time: 0 },
    ],
  }),
  ROOMS_PAGE_SIZE: 10,
}))

function createQueryClientWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }
}

describe('useAlertsFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('auto-selects first room and default dates on mount', async () => {
    renderHook(() => useAlertsFilters(), {
      wrapper: createQueryClientWrapper(),
    })

    await waitFor(() => {
      expect(mockedNavigate).toHaveBeenCalled()
    })

    const lastCall = mockedNavigate.mock.calls[mockedNavigate.mock.calls.length - 1]
    expect(lastCall[0].search.sala).toBe('1')
    expect(lastCall[0].search.indicador).toBe('CO2')
    expect(lastCall[0].search.desde).toBeDefined()
    expect(lastCall[0].search.hasta).toBeDefined()
    expect(lastCall[0].search.pagina).toBe('1')
  })

  it('isReady is false when sala is not set', () => {
    const hookResult = renderHook(() => useAlertsFilters(), {
      wrapper: createQueryClientWrapper(),
    })

    expect(hookResult.result.current.isReady).toBe(false)
  })
})
