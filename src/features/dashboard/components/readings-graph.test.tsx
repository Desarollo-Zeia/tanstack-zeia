import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ChartData, ChartOptions } from 'chart.js'
import { ReadingsGraph } from './readings-graph'
import type { ReadingGraphPoint } from '../types'

const capturedLineProps = vi.hoisted(() => ({
  current: null as {
    data?: ChartData<'line'>
    options?: ChartOptions<'line'>
  } | null,
}))

vi.mock('../api/readings-graph', () => ({
  fetchReadingsGraph: vi.fn(),
}))

vi.mock('react-chartjs-2', () => ({
  Line: (props: { data?: ChartData<'line'>; options?: ChartOptions<'line'> }) => {
    capturedLineProps.current = props
    return <div data-testid="line-chart" />
  },
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

const mockVoltageData: ReadingGraphPoint[] = [
  {
    period: '2026-06-24T08:00:00-05:00',
    first_reading: '2026-06-24T08:00:00-05:00',
    last_reading: '2026-06-24T08:00:00-05:00',
    indicator: 'Ua',
    unit: 'V',
    first_value: 225.65,
    last_value: 225.65,
    difference: null,
    device: '00956906000ab814',
    measurement_point: 'Llave General TGE-TR1',
  },
]

const voltageThresholds = {
  voltage: { lower_threshold: 361, upper_threshold: 399, nominal_voltage: 380 },
}

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
    capturedLineProps.current = null
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

  it('renders threshold line datasets when thresholds match the active category', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue(mockVoltageData)

    render(
      <ReadingsGraph
        {...baseProps}
        category="voltage"
        availableIndicators={['Ua']}
        activeIndicator="Ua"
        thresholds={voltageThresholds}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    const labels = capturedLineProps.current?.data?.datasets.map((d) => d.label) ?? []
    expect(labels).toContain('Umbral superior: 399 V')
    expect(labels).toContain('Umbral inferior: 361 V')
  })

  it('does not render threshold datasets when the active category has no thresholds', async () => {
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
        measurement_point: 'Llave General TGE-TR1',
      },
    ])

    render(
      <ReadingsGraph {...baseProps} category="power" thresholds={voltageThresholds} />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    const labels = capturedLineProps.current?.data?.datasets.map((d) => d.label) ?? []
    expect(labels.some((l) => l?.startsWith('Umbral'))).toBe(false)
  })

  it('does not render threshold datasets when thresholds are not provided', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue(mockEnergyData)

    render(<ReadingsGraph {...baseProps} category="energy" thresholds={null} />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    const labels = capturedLineProps.current?.data?.datasets.map((d) => d.label) ?? []
    expect(labels.some((l) => l?.startsWith('Umbral'))).toBe(false)
  })

  it('excludes threshold datasets from the tooltip', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue(mockVoltageData)

    render(
      <ReadingsGraph
        {...baseProps}
        category="voltage"
        availableIndicators={['Ua']}
        activeIndicator="Ua"
        thresholds={voltageThresholds}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    const filter = capturedLineProps.current?.options?.plugins?.tooltip?.filter as unknown as
      | ((item: { dataset: { label?: string } }) => boolean)
      | undefined
    if (!filter) throw new Error('tooltip filter callback not defined')

    expect(filter({ dataset: { label: 'Umbral superior: 399 V' } })).toBe(false)
    expect(filter({ dataset: { label: 'Umbral inferior: 361 V' } })).toBe(false)
    expect(filter({ dataset: { label: 'Ua' } })).toBe(true)
  })

  it('shows date and time in the tooltip title with format "24 Jun, 08:00"', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue(mockVoltageData)

    render(
      <ReadingsGraph
        {...baseProps}
        category="voltage"
        availableIndicators={['Ua']}
        activeIndicator="Ua"
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    const title = capturedLineProps.current?.options?.plugins?.tooltip?.callbacks?.title as unknown as
      | ((items: Array<{ dataIndex: number }>) => string)
      | undefined
    if (!title) throw new Error('tooltip title callback not defined')

    expect(title([{ dataIndex: 0 }])).toMatch(/^\d{1,2} Jun, \d{2}:\d{2}$/)
  })

  it('enables wheel, pinch and drag zoom on the chart', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue(mockEnergyData)

    render(<ReadingsGraph {...baseProps} category="energy" />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    const plugins = capturedLineProps.current?.options?.plugins as
      | {
          zoom?: {
            zoom?: {
              wheel?: { enabled?: boolean }
              pinch?: { enabled?: boolean }
              drag?: { enabled?: boolean }
            }
          }
        }
      | undefined

    expect(plugins?.zoom?.zoom?.wheel?.enabled).toBe(true)
    expect(plugins?.zoom?.zoom?.pinch?.enabled).toBe(true)
    expect(plugins?.zoom?.zoom?.drag?.enabled).toBe(true)
  })

  it('shows a reset zoom button when there is data', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue(mockEnergyData)

    render(<ReadingsGraph {...baseProps} category="energy" />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    expect(screen.getByRole('button', { name: /restablecer zoom/i })).toBeInTheDocument()
  })
})
