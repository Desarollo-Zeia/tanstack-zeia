import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BillingDetailTable } from './billing-detail-table'
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
      id: 1,
      energy_headquarter: 67,
      start_date: '2026-06-01',
      end_date: '2026-06-30',
      is_current: false,
    },
    {
      id: 2,
      energy_headquarter: 67,
      start_date: '2026-07-01',
      end_date: '2026-07-31',
      is_current: true,
    },
  ],
}

const mockBilling: BillingCalculateResponse = {
  headquarter_id: 67,
  start_date: '2026-07-01',
  end_date: '2026-07-31',
  results: [
    {
      code: 'cargo_fijo_mensual',
      name: 'Cargo fijo mensual',
      value: 1,
      currency: 'USD',
      details: null,
    },
    {
      code: 'energia_activa_horas_punta',
      name: 'Cargo por Energía Activa Punta',
      value: 856.92,
      currency: 'USD',
      details: {
        consumption: 22.44,
        unit: 'MWh',
        rate: 38.18,
        rate_unit: 'USD/MWh',
      },
    },
    {
      code: 'energia_activa_horas_fuera_punta',
      name: 'Cargo por Energía Activa Fuera Punta',
      value: 2928.59,
      currency: 'USD',
      details: {
        consumption: 76.7,
        unit: 'MWh',
        rate: 38.18,
        rate_unit: 'USD/MWh',
      },
    },
    {
      code: 'potencia_activa_generacion_punta',
      name: 'Cargo por Potencia Activa Punta',
      value: 2.03,
      currency: 'USD',
      details: {
        max_power: 0.32,
        max_power_datetime: '2026-07-25T19:48:00-05:00',
        rate: 6.25,
        rate_unit: 'USD/kW',
      },
    },
  ],
  total_amount: 3788.54,
  currency: 'USD',
  totals_by_currency: { USD: 3788.54 },
}

describe('BillingDetailTable', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading skeleton while fetching', () => {
    vi.spyOn(billingCyclesApi, 'fetchBillingCycles').mockImplementation(
      () => new Promise(() => {})
    )

    const { container } = renderWithProviders(<BillingDetailTable sedeId={67} />)

    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders charges from the current billing cycle', async () => {
    vi.spyOn(billingCyclesApi, 'fetchBillingCycles').mockResolvedValue(mockCycles)
    const calculateSpy = vi
      .spyOn(billingCalculateApi, 'fetchBillingCalculate')
      .mockResolvedValue(mockBilling)

    renderWithProviders(<BillingDetailTable sedeId={67} />)

    await waitFor(() => {
      expect(screen.getByText('Cargo por Energía Activa Punta')).toBeInTheDocument()
    })

    // Usa las fechas del ciclo con is_current: true
    expect(calculateSpy).toHaveBeenCalledWith(67, '2026-07-01', '2026-07-31')

    // Header con el rango del ciclo
    expect(screen.getByText('1 de julio — 31 de julio')).toBeInTheDocument()

    // Tarifa y consumo de energia
    expect(screen.getAllByText('38.18 $ / MWh')).toHaveLength(2)
    expect(screen.getByText('22.44 MWh')).toBeInTheDocument()
    expect(screen.getByText('76.70 MWh')).toBeInTheDocument()

    // Tarifa y consumo de potencia
    expect(screen.getByText('6.25 $ / kW')).toBeInTheDocument()
    expect(screen.getByText('0.32 kW')).toBeInTheDocument()

    // Cargo fijo con placeholders
    expect(screen.getByText('Cargo fijo mensual')).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(2)

    // Importes y total
    expect(screen.getByText('$ 856.92')).toBeInTheDocument()
    expect(screen.getByText('Costo total')).toBeInTheDocument()
    expect(screen.getByText('$ 3,788.54')).toBeInTheDocument()
  })

  it('shows empty state when there are no billing cycles', async () => {
    vi.spyOn(billingCyclesApi, 'fetchBillingCycles').mockResolvedValue({
      count: 0,
      results: [],
    })
    const calculateSpy = vi.spyOn(billingCalculateApi, 'fetchBillingCalculate')

    renderWithProviders(<BillingDetailTable sedeId={67} />)

    await waitFor(() => {
      expect(
        screen.getByText('No hay un ciclo de facturación activo para esta sede')
      ).toBeInTheDocument()
    })

    expect(calculateSpy).not.toHaveBeenCalled()
  })

  it('renders multi-currency totals and reactive energy details', async () => {
    const mixedBilling: BillingCalculateResponse = {
      headquarter_id: 67,
      start_date: '2026-07-01',
      end_date: '2026-07-31',
      results: [
        {
          code: 'energia_activa_horas_punta',
          name: 'Cargo por Energía Activa Punta',
          value: 1710.48,
          currency: 'USD',
          details: {
            consumption: 43.69,
            unit: 'MWh',
            rate: 39.15,
            rate_unit: 'USD/MWh',
          },
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
      totals_by_currency: { USD: 1710.48, PEN: 1072.67 },
    }

    vi.spyOn(billingCyclesApi, 'fetchBillingCycles').mockResolvedValue(mockCycles)
    vi.spyOn(billingCalculateApi, 'fetchBillingCalculate').mockResolvedValue(mixedBilling)

    renderWithProviders(<BillingDetailTable sedeId={67} />)

    await waitFor(() => {
      expect(screen.getByText('Cargo por energía reactiva inductiva')).toBeInTheDocument()
    })

    // Energia reactiva: se muestra el exceso facturado, no el consumo total
    expect(screen.getByText('21802.28 kVArh')).toBeInTheDocument()
    expect(screen.getByText('0.05 S/ / kVArh')).toBeInTheDocument()

    // Una fila de total por moneda (los importes tambien aparecen en sus filas de cargo)
    expect(screen.getByText('Costo total USD')).toBeInTheDocument()
    expect(screen.getByText('Costo total PEN')).toBeInTheDocument()
    expect(screen.getAllByText('$ 1,710.48')).toHaveLength(2)
    expect(screen.getAllByText('S/ 1,072.67')).toHaveLength(2)
  })
})
