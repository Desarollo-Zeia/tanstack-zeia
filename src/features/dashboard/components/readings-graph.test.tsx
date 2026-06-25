import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReadingsGraph } from './readings-graph'
import type { ReadingGraphPoint } from '../types'

vi.mock('../api/readings-graph', () => ({
  fetchReadingsGraph: vi.fn(),
}))

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
  Bar: () => <div data-testid="bar-chart" />,
}))

import { fetchReadingsGraph } from '../api/readings-graph'

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

const mockEnergyData: ReadingGraphPoint[] = [
  {
    period: '2026-06-24T08:00:00-05:00',
    first_reading: '2026-06-24T08:00:00-05:00',
    last_reading: '2026-06-24T08:59:00-05:00',
    indicator: 'EPpos',
    unit: 'KWh',
    first_value: 1200.0,
    last_value: 1210.5,
    difference: 10.5,
    device: '00956906000ab814',
    measurement_point: 'Chiller 1',
  },
  {
    period: '2026-06-24T09:00:00-05:00',
    first_reading: '2026-06-24T09:00:00-05:00',
    last_reading: '2026-06-24T09:59:00-05:00',
    indicator: 'EPpos',
    unit: 'KWh',
    first_value: 1210.5,
    last_value: 1225.0,
    difference: 14.5,
    device: '00956906000ab814',
    measurement_point: 'Chiller 1',
  },
]

const baseProps = {
  headquarterId: 67,
  panelId: 39,
  measurementPointId: 77,
  dateAfter: new Date(2026, 5, 24),
  dateBefore: new Date(2026, 5, 24),
  availableIndicators: ['EPpos'],
  activeIndicator: 'EPpos',
  onIndicatorChange: vi.fn(),
}

describe('ReadingsGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('does not show "Minuto" option for energy category', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue(mockEnergyData)

    render(<ReadingsGraph {...baseProps} category="energy" />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    const lastBySelect = screen.getByText('Hora')
    expect(lastBySelect).toBeInTheDocument()

    // El select no debería contener la opción "Minuto"
    expect(screen.queryByText('Minuto')).not.toBeInTheDocument()
  })

  it('shows "Minuto" option for power category', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue([
      {
        period: '2026-06-24T08:00:00-05:00',
        first_reading: '2026-06-24T08:00:00-05:00',
        last_reading: '2026-06-24T08:00:00-05:00',
        indicator: 'P',
        unit: 'KW',
        first_value: 100.0,
        last_value: 100.0,
        difference: null,
        device: '00956906000ab814',
        measurement_point: 'Chiller 1',
      },
    ])

    render(<ReadingsGraph {...baseProps} category="power" />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    expect(screen.getByText('Minuto')).toBeInTheDocument()
  })

  it('calls fetchReadingsGraph with hour last_by for energy category', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue(mockEnergyData)

    render(<ReadingsGraph {...baseProps} category="energy" />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(fetchReadingsGraph).toHaveBeenCalledWith(
        67,
        39,
        77,
        '2026-06-24',
        '2026-06-24',
        'EPpos',
        'hour'
      )
    })
  })
})
