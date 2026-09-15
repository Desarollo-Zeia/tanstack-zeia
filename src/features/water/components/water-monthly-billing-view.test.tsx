import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WaterMonthlyBillingView } from './water-monthly-billing-view'
import * as billingCalculateApi from '../api/water-billing-calculate'
import * as billingCyclesApi from '../api/water-billing-cycles'
import type { WaterBillingCalculateResponse, WaterBillingCyclesResponse } from '../types'

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children }: { children: ReactNode }) => <a>{children}</a>,
}))

vi.mock('react-chartjs-2', () => ({
  Bar: ({ data, options }: { data: { labels: string[] }; options?: { onClick?: (e: unknown, els: { index: number }[]) => void } }) => (
    <div data-testid="water-monthly-bar">
      {(data.labels as string[]).map((label, i) => (
        <button
          key={`${label}-${i}`}
          onClick={() => options?.onClick?.({}, [{ index: i }])}
        >
          {label}
        </button>
      ))}
    </div>
  ),
}))

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
}

function renderWithProviders(ui: React.ReactNode) {
  return render(<QueryClientProvider client={createQueryClient()}>{ui}</QueryClientProvider>)
}

const mockCycles: WaterBillingCyclesResponse = {
  count: 3,
  results: [
    {
      id: 0,
      energy_headquarter: 199,
      start_date: '2026-05-01',
      end_date: '2026-05-31',
      is_current: false,
      billing_type: 'water',
    },
    {
      id: 1,
      energy_headquarter: 199,
      start_date: '2026-06-01',
      end_date: '2026-06-30',
      is_current: false,
      billing_type: 'water',
    },
    {
      id: 2,
      energy_headquarter: 199,
      start_date: '2026-07-01',
      end_date: '2026-07-31',
      is_current: true,
      billing_type: 'water',
    },
  ],
}

function buildCalculate(startDate: string, endDate: string, total: number): WaterBillingCalculateResponse {
  return {
    headquarter_id: 199,
    start_date: startDate,
    end_date: endDate,
    results: [
      {
        code: 'agua_potable',
        name: 'Consumo de agua potable',
        value: Math.round(total * 0.7),
        currency: 'PEN',
        details: { consumption: 100, unit: 'm³', rate: 8.82, rate_unit: 'PEN/m³' },
      },
      {
        code: 'alcantarillado',
        name: 'Consumo de alcantarillado',
        value: total - Math.round(total * 0.7),
        currency: 'PEN',
        details: {
          consumption: 100,
          factor: 0.8,
          billed_volume: 80,
          unit: 'm³',
          rate: 4.21,
          rate_unit: 'PEN/m³',
        },
      },
    ],
    total_amount: total,
    currency: 'PEN',
    totals_by_currency: { PEN: total },
  }
}

describe('WaterMonthlyBillingView', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(billingCyclesApi, 'fetchWaterBillingCycles').mockResolvedValue(mockCycles)
    vi.spyOn(billingCalculateApi, 'fetchWaterBillingCalculate').mockImplementation(
      (_id: number, startDate: string, endDate: string) => {
        const total = startDate.startsWith('2026-06')
          ? 2000
          : startDate.startsWith('2026-05')
            ? 1800
            : 1500
        return Promise.resolve(buildCalculate(startDate, endDate, total))
      }
    )
  })

  it('muestra el hero con el total del mes actual y el desglose', async () => {
    renderWithProviders(<WaterMonthlyBillingView sedeId={199} />)

    await waitFor(() => {
      expect(screen.getByTestId('water-monthly-bar')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByText(/Este mes vas a pagar/)).toBeInTheDocument()
    })

    // Hero: total gigante + comparativa vs junio (ahorro de S/500)
    expect(screen.getAllByText('S/1,500.00').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/Ahorraste frente a/)).toBeInTheDocument()
    expect(screen.getByText('Te cuesta por día')).toBeInTheDocument()
    expect(screen.getByText('Ranking de gasto')).toBeInTheDocument()

    // Desglose: ciclo + cargos con línea de factor en alcantarillado
    expect(screen.getByText('Desglose — Julio 2026')).toBeInTheDocument()
    expect(
      screen.getAllByText('Consumo de agua potable').length
    ).toBeGreaterThan(0)
    expect(screen.getByText('100.00 m³ × 0.8 = 80.00 m³')).toBeInTheDocument()
  })

  it('cambia el hero y el desglose al seleccionar otra barra', async () => {
    const user = userEvent.setup()
    renderWithProviders(<WaterMonthlyBillingView sedeId={199} />)

    await waitFor(() => {
      expect(screen.getByText('Desglose — Julio 2026')).toBeInTheDocument()
    })

    const juneButton = screen.getByRole('button', { name: 'Jun' })
    await user.click(juneButton)

    await waitFor(() => {
      expect(screen.getByText('Desglose — Junio 2026')).toBeInTheDocument()
    })
    expect(screen.getByText(/Ese mes pagaste/)).toBeInTheDocument()
    expect(screen.getAllByText('S/2,000.00').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText(/Gastaste más que en/)).toBeInTheDocument()
  })
})
