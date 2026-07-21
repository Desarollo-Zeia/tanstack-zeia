import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BillingComparison } from './billing-comparison'
import * as billingCalculateApi from '../api/billing-calculate'
import * as billingCyclesApi from '../api/billing-cycles'
import type { BillingCalculateResponse, BillingCyclesResponse } from '../types'

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderWithProviders(ui: React.ReactNode) {
  return render(
    <QueryClientProvider client={createQueryClient()}>{ui}</QueryClientProvider>
  )
}

const mockCycles: BillingCyclesResponse = {
  count: 2,
  results: [
    {
      id: 2,
      energy_headquarter: 67,
      start_date: '2026-07-01',
      end_date: '2026-07-31',
      is_current: true,
    },
    {
      id: 1,
      energy_headquarter: 67,
      start_date: '2026-06-01',
      end_date: '2026-06-30',
      is_current: false,
    },
  ],
}

function buildResponse(overrides: {
  startDate: string
  endDate: string
  total: number
  consumptionPunta: number
  consumptionFueraPunta: number
}): BillingCalculateResponse {
  const fueraPuntaValue = Math.round(overrides.total * 0.6)
  const puntaValue = overrides.total - 1 - fueraPuntaValue
  return {
    headquarter_id: 67,
    start_date: overrides.startDate,
    end_date: overrides.endDate,
    results: [
      {
        code: 'cargo_fijo_mensual',
        name: 'Cargo fijo mensual',
        value: 1,
        currency: 'USD',
        details: null,
      },
      {
        code: 'energia_activa_horas_fuera_punta',
        name: 'Cargo por energía activa en horas fuera de punta',
        value: fueraPuntaValue,
        currency: 'USD',
        details: {
          consumption: overrides.consumptionFueraPunta,
          unit: 'MWh',
          rate: 38.18,
          rate_unit: 'USD/MWh',
        },
      },
      {
        code: 'energia_activa_horas_punta',
        name: 'Cargo por energía activa en horas punta',
        value: puntaValue,
        currency: 'USD',
        details: {
          consumption: overrides.consumptionPunta,
          unit: 'MWh',
          rate: 38.18,
          rate_unit: 'USD/MWh',
        },
      },
    ],
    total_amount: overrides.total,
    currency: 'USD',
    totals_by_currency: { USD: overrides.total },
  }
}

// Ciclo anterior (Junio): mas caro y mayor consumo
const leftResponse = buildResponse({
  startDate: '2026-06-01',
  endDate: '2026-06-30',
  total: 3000,
  consumptionPunta: 50,
  consumptionFueraPunta: 100,
})

// Ciclo actual (Julio): mas barato y menor consumo
const rightResponse = buildResponse({
  startDate: '2026-07-01',
  endDate: '2026-07-31',
  total: 2000,
  consumptionPunta: 40,
  consumptionFueraPunta: 60,
})

// Ciclo anterior (Junio) multi-moneda: USD + energia reactiva en PEN
const mixedLeftResponse: BillingCalculateResponse = {
  headquarter_id: 67,
  start_date: '2026-06-01',
  end_date: '2026-06-30',
  results: [
    {
      code: 'energia_activa_horas_fuera_punta',
      name: 'Cargo por energía activa en horas fuera de punta',
      value: 3915,
      currency: 'USD',
      details: { consumption: 100, unit: 'MWh', rate: 39.15, rate_unit: 'USD/MWh' },
    },
    {
      code: 'energia_activa_horas_punta',
      name: 'Cargo por energía activa en horas punta',
      value: 1957.5,
      currency: 'USD',
      details: { consumption: 50, unit: 'MWh', rate: 39.15, rate_unit: 'USD/MWh' },
    },
    {
      code: 'energia_reactiva_inductiva',
      name: 'Cargo por energía reactiva inductiva',
      value: 1476,
      currency: 'PEN',
      details: {
        consumption: 90000,
        active_energy_consumption: 165080.24,
        threshold_percent: 30,
        excess_consumption: 30000,
        unit: 'kVArh',
        rate: 0.0492,
        rate_unit: 'PEN/kVArh',
      },
    },
  ],
  total_amount: null,
  currency: null,
  totals_by_currency: { USD: 5872.5, PEN: 1476 },
}

// Ciclo actual (Julio) multi-moneda: mas barato y menor consumo activo
const mixedRightResponse: BillingCalculateResponse = {
  headquarter_id: 67,
  start_date: '2026-07-01',
  end_date: '2026-07-31',
  results: [
    {
      code: 'energia_activa_horas_fuera_punta',
      name: 'Cargo por energía activa en horas fuera de punta',
      value: 2349,
      currency: 'USD',
      details: { consumption: 60, unit: 'MWh', rate: 39.15, rate_unit: 'USD/MWh' },
    },
    {
      code: 'energia_activa_horas_punta',
      name: 'Cargo por energía activa en horas punta',
      value: 1566,
      currency: 'USD',
      details: { consumption: 40, unit: 'MWh', rate: 39.15, rate_unit: 'USD/MWh' },
    },
    {
      code: 'energia_reactiva_inductiva',
      name: 'Cargo por energía reactiva inductiva',
      value: 1072.67,
      currency: 'PEN',
      details: {
        consumption: 71326.35,
        active_energy_consumption: 165080.24,
        threshold_percent: 30,
        excess_consumption: 21802.28,
        unit: 'kVArh',
        rate: 0.0492,
        rate_unit: 'PEN/kVArh',
      },
    },
  ],
  total_amount: null,
  currency: null,
  totals_by_currency: { USD: 3915, PEN: 1072.67 },
}

function mockBillingCalculate(left = leftResponse, right = rightResponse) {
  return vi
    .spyOn(billingCalculateApi, 'fetchBillingCalculate')
    .mockImplementation((_id: number, startDate: string) => {
      const month = startDate.slice(5, 7)
      return Promise.resolve(month === '06' ? left : right)
    })
}

function mockBillingCycles(cycles: BillingCyclesResponse = mockCycles) {
  return vi.spyOn(billingCyclesApi, 'fetchBillingCycles').mockResolvedValue(cycles)
}

describe('BillingComparison', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading state while fetching cycles and periods', () => {
    vi.spyOn(billingCyclesApi, 'fetchBillingCycles').mockImplementation(
      () => new Promise(() => {})
    )
    vi.spyOn(billingCalculateApi, 'fetchBillingCalculate').mockImplementation(
      () => new Promise(() => {})
    )

    renderWithProviders(<BillingComparison sedeId={67} />)

    expect(screen.getAllByText('Ciclo de facturación')).toHaveLength(2)
    expect(screen.getByText('Cargando comparación...')).toBeInTheDocument()
  })

  it('renders total cost and charges for both periods using cycle dates', async () => {
    mockBillingCycles()
    mockBillingCalculate()

    renderWithProviders(<BillingComparison sedeId={67} />)

    await waitFor(() => {
      expect(screen.getByText('$3,000.00')).toBeInTheDocument()
      expect(screen.getByText('$2,000.00')).toBeInTheDocument()
    })

    expect(screen.getAllByText('Cargo fijo mensual')).toHaveLength(2)
    expect(
      screen.getAllByText('Cargo por energía activa en horas fuera de punta')
    ).toHaveLength(2)
    expect(screen.getAllByText('100.00 MWh')).toHaveLength(1)
    expect(screen.getAllByText('Distribución de cargos')).toHaveLength(2)
  })

  it('labels each selector with the month of its cycle dates', async () => {
    mockBillingCycles()
    mockBillingCalculate()

    renderWithProviders(<BillingComparison sedeId={67} />)

    await waitFor(() => {
      expect(screen.getByText('Junio 2026')).toBeInTheDocument()
      expect(screen.getByText('Julio 2026')).toBeInTheDocument()
    })
  })

  it('shows savings banner when current cycle is cheaper', async () => {
    mockBillingCycles()
    mockBillingCalculate()

    renderWithProviders(<BillingComparison sedeId={67} />)

    await waitFor(() => {
      expect(screen.getByText(/Ahorro registrado/)).toBeInTheDocument()
    })

    expect(screen.getByText('$1,000.00')).toBeInTheDocument()
    expect(screen.getByText(/Comparando Junio 2026 - Julio 2026/)).toBeInTheDocument()
    // consumo: 150 MWh → 100 MWh = 33.3% de disminución
    expect(screen.getByText(/Su consumo ha disminuido un/)).toBeInTheDocument()
    expect(screen.getByText('33.3 %')).toBeInTheDocument()
  })

  it('shows increment banner when current cycle is more expensive', async () => {
    mockBillingCycles()
    mockBillingCalculate(rightResponse, leftResponse)

    renderWithProviders(<BillingComparison sedeId={67} />)

    await waitFor(() => {
      expect(screen.getByText(/Incremento registrado/)).toBeInTheDocument()
    })

    expect(screen.getByText(/Su consumo ha aumentado un/)).toBeInTheDocument()
  })

  it('assigns a distinct color to each energy charge icon', async () => {
    mockBillingCycles()
    mockBillingCalculate()

    renderWithProviders(<BillingComparison sedeId={67} />)

    await waitFor(() => {
      expect(
        screen.getAllByText('Cargo por energía activa en horas fuera de punta').length
      ).toBeGreaterThan(0)
    })

    const fueraPuntaRow = screen
      .getAllByText('Cargo por energía activa en horas fuera de punta')[0]
      .closest('li')!
    const puntaRow = screen
      .getAllByText('Cargo por energía activa en horas punta')[0]
      .closest('li')!

    expect(fueraPuntaRow.querySelector('span')!.className).toContain('bg-primary')
    expect(puntaRow.querySelector('span')!.className).toContain('bg-foreground')
    expect(puntaRow.querySelector('span')!.className).not.toContain('bg-primary')
  })

  it('highlights the matching charge row and dims other bar segments on hover', async () => {
    mockBillingCycles()
    mockBillingCalculate()
    const user = userEvent.setup()

    renderWithProviders(<BillingComparison sedeId={67} />)

    await waitFor(() => {
      expect(screen.getAllByText('Cargo fijo mensual')).toHaveLength(2)
    })

    const row = screen
      .getAllByText('Cargo por energía activa en horas fuera de punta')[0]
      .closest('li')!

    await user.hover(row)

    // La fila se marca
    expect(row.className).toContain('bg-primary/10')

    // Los segmentos de otros cargos se atenuan; el de la fila no
    const hoveredSegment = screen.getAllByText('60%')[0].parentElement!
    const otherSegment = screen.getAllByText('40%')[0].parentElement!
    expect(hoveredSegment.className).not.toContain('opacity-30')
    expect(otherSegment.className).toContain('opacity-30')

    await user.unhover(row)

    expect(row.className).not.toContain('bg-primary/10')
    expect(otherSegment.className).not.toContain('opacity-30')
  })

  it('calls billing-calculate with the cycle date ranges', async () => {
    mockBillingCycles()
    const spy = mockBillingCalculate()

    renderWithProviders(<BillingComparison sedeId={67} />)

    await waitFor(() => {
      expect(spy).toHaveBeenCalledTimes(2)
    })

    expect(spy).toHaveBeenCalledWith(67, '2026-06-01', '2026-06-30')
    expect(spy).toHaveBeenCalledWith(67, '2026-07-01', '2026-07-31')
  })

  it('renders totals per currency and excludes reactive energy from consumption', async () => {
    mockBillingCycles()
    mockBillingCalculate(mixedLeftResponse, mixedRightResponse)

    renderWithProviders(<BillingComparison sedeId={67} />)

    // Costo total apilado por moneda en ambas cards
    // (algunos importes coinciden con valores de las filas de cargos)
    await waitFor(() => {
      expect(screen.getByText('$5,872.50')).toBeInTheDocument()
      expect(screen.getAllByText('S/1,476.00')).toHaveLength(2)
      expect(screen.getAllByText('$3,915.00')).toHaveLength(2)
      expect(screen.getAllByText('S/1,072.67')).toHaveLength(2)
    })

    // El banner compara cada moneda por separado
    expect(screen.getByText(/Ahorro registrado/)).toBeInTheDocument()
    expect(screen.getByText('$1,957.50 · S/403.33')).toBeInTheDocument()

    // Energia reactiva: se muestra el exceso facturado
    expect(screen.getByText('30000.00 kVArh')).toBeInTheDocument()
    expect(screen.getByText('21802.28 kVArh')).toBeInTheDocument()

    // El % de consumo solo considera energia activa (150 → 100 MWh = 33.3%),
    // sin mezclar los kVArh de la energia reactiva
    expect(screen.getByText(/Su consumo ha disminuido un/)).toBeInTheDocument()
    expect(screen.getByText('33.3 %')).toBeInTheDocument()
  })
})
