import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BillingCycleTable } from './billing-cycle-table'
import * as consumptionCycleDetailApi from '../api/consumption-cycle-detail'
import * as tariffPdfsApi from '../api/tariff-pdfs'
import type { ConsumptionCycleDetailResponse } from '../types'

function renderWithProviders(ui: React.ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

const mockDetail: ConsumptionCycleDetailResponse = {
  power_contracted: 120,
  electrical_panel_type: 'Media tensión',
  energy_provider: 'Empresa Eléctrica',
  supply_number: '12345678',
  billing_cycle_start: '2026-07-01',
  billing_cycle_end: '2026-07-31',
  ratedays: 14,
  totalratedays: 31,
}

describe('BillingCycleTable', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(tariffPdfsApi, 'fetchTariffPdfs').mockResolvedValue({ data: [] })
  })

  it('renders the billing cycle range and billed days', async () => {
    vi.spyOn(consumptionCycleDetailApi, 'fetchConsumptionCycleDetail').mockResolvedValue(
      mockDetail
    )

    renderWithProviders(<BillingCycleTable sedeId={67} />)

    await waitFor(() => {
      expect(screen.getByText('1 de julio — 31 de julio')).toBeInTheDocument()
    })
    expect(screen.getByText('14 de 31 días')).toBeInTheDocument()
    expect(screen.getByText('120 kW')).toBeInTheDocument()
  })

  it('shows "Sin ciclo vigente" instead of crashing when the cycle dates are null', async () => {
    // Sede sin ciclo vigente: el backend envía fechas y días en null.
    // Antes, formatDateShort(null) lanzaba "Cannot read properties of null (reading 'includes')"
    vi.spyOn(consumptionCycleDetailApi, 'fetchConsumptionCycleDetail').mockResolvedValue({
      ...mockDetail,
      billing_cycle_start: null,
      billing_cycle_end: null,
      ratedays: null,
      totalratedays: null,
    })

    renderWithProviders(<BillingCycleTable sedeId={202} />)

    await waitFor(() => {
      expect(screen.getByText('Sin ciclo vigente')).toBeInTheDocument()
    })
    expect(screen.getByText('—')).toBeInTheDocument()
    expect(screen.getByText('Empresa Eléctrica')).toBeInTheDocument()
  })
})
