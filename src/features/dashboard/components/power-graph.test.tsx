import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PowerGraph } from './power-graph'

vi.mock('../api/power-graph', () => ({
  fetchPowerGraph: vi.fn(),
}))

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
}))

import { fetchPowerGraph } from '../api/power-graph'

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

const baseProps = {
  headquarterId: 67,
  dateAfter: new Date(2026, 5, 24),
  dateBefore: new Date(2026, 5, 24),
}

const emptyResponse = {
  power_thresholds: {
    power_max: null,
    power_contracted: null,
    power_installed: null,
  },
  results: [],
}

describe('PowerGraph', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders "Por Minuto" as the default group by option', async () => {
    vi.mocked(fetchPowerGraph).mockResolvedValue(emptyResponse)

    render(<PowerGraph {...baseProps} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByText('No hay datos de potencia para el rango de fechas seleccionado')).toBeInTheDocument()
    })

    expect(screen.getByRole('combobox')).toHaveTextContent('Por Minuto')
  })

  it('renders all three group by options in the dropdown', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchPowerGraph).mockResolvedValue(emptyResponse)

    render(<PowerGraph {...baseProps} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByText('No hay datos de potencia para el rango de fechas seleccionado')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('combobox'))

    expect(screen.getByRole('option', { name: 'Por Minuto' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Por Hora' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: 'Por Día' })).toBeInTheDocument()
  })

  it('calls fetchPowerGraph with group_by=minute by default', async () => {
    vi.mocked(fetchPowerGraph).mockResolvedValue(emptyResponse)

    render(<PowerGraph {...baseProps} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(fetchPowerGraph).toHaveBeenCalledWith(
        67,
        '2026-06-24',
        '2026-06-24',
        'minute'
      )
    })
  })

  it('renders chart when backend returns power field (minute grouping)', async () => {
    vi.mocked(fetchPowerGraph).mockResolvedValue({
      power_thresholds: {
        power_max: null,
        power_contracted: null,
        power_installed: null,
      },
      results: [
        {
          created_at: '2026-06-24T08:00:00-05:00',
          device: '00956906000ab814',
          unit: 'KW',
          values_per_channel: [
            {
              measurement_point_name: 'Chiller 1',
              power: 125.5,
            },
          ],
        },
        {
          created_at: '2026-06-24T08:01:00-05:00',
          device: '00956906000ab814',
          unit: 'KW',
          values_per_channel: [
            {
              measurement_point_name: 'Chiller 1',
              power: 130.2,
            },
          ],
        },
      ],
    })

    render(<PowerGraph {...baseProps} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })
  })
})
