import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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
})
