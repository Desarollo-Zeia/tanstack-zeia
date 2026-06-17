import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { usePanelReadingsFilters } from './use-panel-readings-filters'

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
    ],
  }),
}))

vi.mock('../api/measurement-points', () => ({
  fetchDeviceMeasurementPointsList: vi.fn().mockResolvedValue({
    count: 2,
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
      {
        id: 78,
        name: 'Chiller 2',
        is_active: true,
        channel: 'channel 2',
        type: 'trifasico',
        key: 'chiller-2',
        capacity: '460v/2000A',
        hardware: 'Analizador',
        device: 'ADW300',
        dev_eui: '00956906000ab815',
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

describe('usePanelReadingsFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSearch = {}
  })

  it('auto-selects first active headquarter, panel, weekday, year and month', async () => {
    renderHook(() => usePanelReadingsFilters(), { wrapper: createWrapper() })

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalled()
    })

    const lastCall = mockNavigate.mock.calls[mockNavigate.mock.calls.length - 1]
    const search = lastCall[0].search
    expect(search.mp_sede).toBe('67')
    expect(search.mp_panel).toBe('39')
    expect(search.mp_weekday).toBe('weekdays')
    expect(search.mp_anio).toMatch(/^\d{4}$/)
    expect(search.mp_mes).toMatch(/^\d+$/)
  })

  it('reads initial state from URL params', async () => {
    mockSearch = {
      mp_sede: '67',
      mp_panel: '39',
      mp_punto: '77',
      mp_indicador: 'EPpos',
      mp_weekday: 'saturday',
      mp_anio: '2026',
      mp_mes: '5',
    }

    const { result } = renderHook(() => usePanelReadingsFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.puntoId).toBe(77)
    })

    expect(result.current.indicador).toBe('EPpos')
    expect(result.current.weekday).toBe('saturday')
    expect(result.current.anio).toBe(2026)
    expect(result.current.mes).toBe(5)
    expect(result.current.monthRange.start).toBe('2026-06-01')
    expect(result.current.monthRange.end).toBe('2026-06-30')
  })

  it('defaults indicador to EPpos when mp_indicador is missing', async () => {
    mockSearch = {
      mp_sede: '67',
      mp_panel: '39',
      mp_punto: '77',
      mp_weekday: 'weekdays',
      mp_anio: '2026',
      mp_mes: '5',
    }

    const { result } = renderHook(() => usePanelReadingsFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.puntoId).toBe(77)
    })

    expect(result.current.indicador).toBe('EPpos')
  })

  it('falls back to EPpos when mp_indicador is an unknown value', async () => {
    mockSearch = {
      mp_sede: '67',
      mp_panel: '39',
      mp_punto: '77',
      mp_indicador: 'NOT_A_VALID_KEY',
      mp_weekday: 'weekdays',
      mp_anio: '2026',
      mp_mes: '5',
    }

    const { result } = renderHook(() => usePanelReadingsFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.puntoId).toBe(77)
    })

    expect(result.current.indicador).toBe('EPpos')
  })

  it('computes full month range for February in a non-leap year', async () => {
    mockSearch = {
      mp_sede: '67',
      mp_panel: '39',
      mp_punto: '77',
      mp_indicador: 'EPpos',
      mp_weekday: 'weekdays',
      mp_anio: '2025',
      mp_mes: '1',
    }

    const { result } = renderHook(() => usePanelReadingsFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.mes).toBe(1)
    })

    expect(result.current.monthRange.start).toBe('2025-02-01')
    expect(result.current.monthRange.end).toBe('2025-02-28')
  })

  it('computes full month range for February in a leap year', async () => {
    mockSearch = {
      mp_sede: '67',
      mp_panel: '39',
      mp_punto: '77',
      mp_indicador: 'EPpos',
      mp_weekday: 'weekdays',
      mp_anio: '2024',
      mp_mes: '1',
    }

    const { result } = renderHook(() => usePanelReadingsFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.mes).toBe(1)
    })

    expect(result.current.monthRange.end).toBe('2024-02-29')
  })

  it('updates URL when weekday toggle changes', async () => {
    mockSearch = {
      mp_sede: '67',
      mp_panel: '39',
      mp_punto: '77',
      mp_indicador: 'EPpos',
      mp_weekday: 'weekdays',
      mp_anio: '2026',
      mp_mes: '5',
    }

    const { result } = renderHook(() => usePanelReadingsFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.weekday).toBe('weekdays')
    })

    result.current.setWeekday('sunday')

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({ mp_weekday: 'sunday' }),
        })
      )
    })
  })

  it('updates URL when anio changes', async () => {
    mockSearch = {
      mp_sede: '67',
      mp_panel: '39',
      mp_punto: '77',
      mp_indicador: 'EPpos',
      mp_weekday: 'weekdays',
      mp_anio: '2026',
      mp_mes: '5',
    }

    const { result } = renderHook(() => usePanelReadingsFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.anio).toBe(2026)
    })

    result.current.setAnio(2025)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({ mp_anio: '2025' }),
        })
      )
    })
  })

  it('updates URL when mes changes', async () => {
    mockSearch = {
      mp_sede: '67',
      mp_panel: '39',
      mp_punto: '77',
      mp_indicador: 'EPpos',
      mp_weekday: 'weekdays',
      mp_anio: '2026',
      mp_mes: '5',
    }

    const { result } = renderHook(() => usePanelReadingsFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.mes).toBe(5)
    })

    result.current.setMes(0)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({ mp_mes: '0' }),
        })
      )
    })
  })

  it('updates URL when indicador changes', async () => {
    mockSearch = {
      mp_sede: '67',
      mp_panel: '39',
      mp_punto: '77',
      mp_indicador: 'EPpos',
      mp_weekday: 'weekdays',
      mp_anio: '2026',
      mp_mes: '5',
    }

    const { result } = renderHook(() => usePanelReadingsFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.indicador).toBe('EPpos')
    })

    result.current.setIndicador('EPneg')

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({ mp_indicador: 'EPneg' }),
        })
      )
    })
  })

  it('resets punto when panel changes', async () => {
    mockSearch = {
      mp_sede: '67',
      mp_panel: '39',
      mp_punto: '77',
      mp_indicador: 'EPpos',
      mp_weekday: 'weekdays',
      mp_anio: '2026',
      mp_mes: '5',
    }

    const { result } = renderHook(() => usePanelReadingsFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.puntoId).toBe(77)
    })

    result.current.setPanelId(40)

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        expect.objectContaining({
          search: expect.objectContaining({
            mp_panel: '40',
            mp_punto: undefined,
          }),
        })
      )
    })
  })

  it('reports isReady true when all mp_* params are set in URL', async () => {
    mockSearch = {
      mp_sede: '67',
      mp_panel: '39',
      mp_punto: '77',
      mp_indicador: 'EPpos',
      mp_weekday: 'weekdays',
      mp_anio: '2026',
      mp_mes: '5',
    }

    const { result } = renderHook(() => usePanelReadingsFilters(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isReady).toBe(true)
    })
  })
})
