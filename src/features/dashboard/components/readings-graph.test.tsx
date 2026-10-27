import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import type { ChartData, ChartOptions } from 'chart.js'
import { ReadingsGraph } from './readings-graph'
import type { DeviceMeasurementPoint, ReadingGraphPoint } from '../types'

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

const mockLineVoltageData: ReadingGraphPoint[] = [
  {
    period: '2026-06-24T08:00:00-05:00',
    first_reading: '2026-06-24T08:00:00-05:00',
    last_reading: '2026-06-24T08:00:00-05:00',
    indicator: 'Uab',
    unit: 'V',
    first_value: 389.4,
    last_value: 389.4,
    difference: null,
    device: '00956906000ab814',
    measurement_point: 'Llave General TGE-TR1',
  },
]

type GraphMeasurementPoint = Pick<DeviceMeasurementPoint, 'thresholds' | 'monitoring_topology'>

// 3F-4H, nominal 220 V, tolerancia 5%: la banda de línea es nominal × √3
const fourWirePoint: GraphMeasurementPoint = {
  monitoring_topology: 'three_phase_4w',
  thresholds: {
    voltage: {
      lower_threshold: 209,
      upper_threshold: 231,
      nominal_voltage: 220,
      phase: { lower_threshold: 209, upper_threshold: 231, nominal_voltage: 220 },
      line: { lower_threshold: 362, upper_threshold: 400.1, nominal_voltage: 381.05 },
    },
  },
}

function thresholdLabels(): string[] {
  return (capturedLineProps.current?.data?.datasets ?? [])
    .map((d) => d.label ?? '')
    .filter((label) => label.startsWith('Umbral'))
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

  it('shows "15 minutos" and "30 minutos" options for power category', async () => {
    const user = userEvent.setup()
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

    const lastBySelect = screen.getAllByRole('combobox')[1]
    await user.click(lastBySelect)

    expect(screen.getByRole('option', { name: '15 minutos' })).toBeInTheDocument()
    expect(screen.getByRole('option', { name: '30 minutos' })).toBeInTheDocument()
  })

  it('does not show "15 minutos" or "30 minutos" options for energy category', async () => {
    const user = userEvent.setup()
    vi.mocked(fetchReadingsGraph).mockResolvedValue(mockEnergyData)

    render(<ReadingsGraph {...baseProps} category="energy" />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    const lastBySelect = screen.getAllByRole('combobox')[1]
    await user.click(lastBySelect)

    expect(screen.queryByRole('option', { name: '15 minutos' })).not.toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '30 minutos' })).not.toBeInTheDocument()
  })

  it('calls fetchReadingsGraph with 15min last_by after selecting "15 minutos"', async () => {
    const user = userEvent.setup()
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

    const lastBySelect = screen.getAllByRole('combobox')[1]
    await user.click(lastBySelect)
    await user.click(screen.getByRole('option', { name: '15 minutos' }))

    await waitFor(() => {
      expect(fetchReadingsGraph).toHaveBeenCalledWith(67, 39, 77, '2026-06-24', '2026-06-24', 'EPpos', '15min')
    })
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

  it('draws the phase band for phase voltages (Ua)', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue(mockVoltageData)

    render(
      <ReadingsGraph
        {...baseProps}
        category="voltage"
        availableIndicators={['Ua', 'Uab']}
        activeIndicator="Ua"
        measurementPoint={fourWirePoint}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    expect(thresholdLabels()).toEqual(['Umbral superior: 231 V', 'Umbral inferior: 209 V'])
  })

  it('draws the line band (nominal × √3) for line voltages (Uab) on 3F-4H', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue(mockLineVoltageData)

    render(
      <ReadingsGraph
        {...baseProps}
        category="voltage"
        availableIndicators={['Ua', 'Uab']}
        activeIndicator="Uab"
        measurementPoint={fourWirePoint}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    expect(thresholdLabels()).toEqual(['Umbral superior: 400.1 V', 'Umbral inferior: 362 V'])
  })

  it('switches from the phase band to the line band when the indicator changes', async () => {
    vi.mocked(fetchReadingsGraph).mockImplementation(
      async (_hq, _panel, _mp, _after, _before, indicator) =>
        indicator === 'Uab' ? mockLineVoltageData : mockVoltageData
    )

    const voltageProps = {
      ...baseProps,
      category: 'voltage' as const,
      availableIndicators: ['Ua', 'Uab'],
      measurementPoint: fourWirePoint,
    }

    const { rerender } = render(<ReadingsGraph {...voltageProps} activeIndicator="Ua" />, {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(thresholdLabels()).toEqual(['Umbral superior: 231 V', 'Umbral inferior: 209 V'])
    })

    rerender(<ReadingsGraph {...voltageProps} activeIndicator="Uab" />)

    await waitFor(() => {
      expect(thresholdLabels()).toEqual(['Umbral superior: 400.1 V', 'Umbral inferior: 362 V'])
    })
  })

  it('does not draw limits for voltage indicators without a phase/line band (THDVr)', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue([
      { ...mockVoltageData[0], indicator: 'THDVr', unit: '%', first_value: 2.1, last_value: 2.1 },
    ])

    render(
      <ReadingsGraph
        {...baseProps}
        category="voltage"
        availableIndicators={['THDVr']}
        activeIndicator="THDVr"
        measurementPoint={fourWirePoint}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    expect(thresholdLabels()).toEqual([])
  })

  it('does not draw limits when the measurement point has thresholds: null', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue(mockVoltageData)

    render(
      <ReadingsGraph
        {...baseProps}
        category="voltage"
        availableIndicators={['Ua']}
        activeIndicator="Ua"
        measurementPoint={{ monitoring_topology: 'three_phase_4w', thresholds: null }}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    expect(thresholdLabels()).toEqual([])
  })

  it('keeps using the category thresholds for non-voltage categories (current)', async () => {
    vi.mocked(fetchReadingsGraph).mockResolvedValue([
      { ...mockVoltageData[0], indicator: 'Ia', unit: 'A', first_value: 120, last_value: 120 },
    ])

    render(
      <ReadingsGraph
        {...baseProps}
        category="current"
        availableIndicators={['Ia']}
        activeIndicator="Ia"
        measurementPoint={{
          monitoring_topology: 'three_phase_4w',
          thresholds: { current: { lower_threshold: 10, upper_threshold: 200 } },
        }}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument()
    })

    expect(thresholdLabels()).toEqual(['Umbral superior: 200 A', 'Umbral inferior: 10 A'])
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
      <ReadingsGraph {...baseProps} category="power" measurementPoint={fourWirePoint} />,
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

    render(<ReadingsGraph {...baseProps} category="energy" measurementPoint={null} />, {
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
        measurementPoint={fourWirePoint}
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

    expect(filter({ dataset: { label: 'Umbral superior: 231 V' } })).toBe(false)
    expect(filter({ dataset: { label: 'Umbral inferior: 209 V' } })).toBe(false)
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
