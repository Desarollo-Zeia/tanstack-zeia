import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { DesbalanceAlertsHistory } from './desbalance-alerts-history'
import * as alertsApi from '@/features/dashboard/api/alerts'

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const sampleAlertsResponse = {
  count: 12,
  results: [
    {
      id: 1,
      indicator_name: 'Corriente',
      subindicator_name: 'Desbalance de Corriente',
      origin: 'Fase A',
      date: 'Lunes, 15 de mayo de 2026',
      time: '10:30',
      limit: 5.0,
      value: 8.5,
      device_id: 1,
      device_name: 'Medidor 1',
      measurement_point_id: 77,
      measurement_point_name: 'Chiller 1',
      status: 'open',
      alert_status: 'critical',
      notes: '',
    },
    {
      id: 2,
      indicator_name: 'Corriente',
      subindicator_name: 'Desbalance de Corriente',
      origin: 'Fase B',
      date: 'Lunes, 15 de mayo de 2026',
      time: '11:45',
      limit: 5.0,
      value: 7.2,
      device_id: 1,
      device_name: 'Medidor 1',
      measurement_point_id: 77,
      measurement_point_name: 'Chiller 1',
      status: 'open',
      alert_status: 'critical',
      notes: '',
    },
  ],
}

describe('DesbalanceAlertsHistory', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders loading spinner initially', () => {
    vi.spyOn(alertsApi, 'fetchCurrentMonitoringHistory').mockResolvedValue(sampleAlertsResponse)
    const { container } = render(
      <DesbalanceAlertsHistory
        measurementPointId={77}
        dateAfter={new Date('2026-05-01')}
        dateBefore={new Date('2026-05-10')}
      />,
      { wrapper: createWrapper() }
    )
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('renders the alert table with desbalance data', async () => {
    vi.spyOn(alertsApi, 'fetchCurrentMonitoringHistory').mockResolvedValue(sampleAlertsResponse)
    const { container } = render(
      <DesbalanceAlertsHistory
        measurementPointId={77}
        dateAfter={new Date('2026-05-01')}
        dateBefore={new Date('2026-05-10')}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByText('Fase A')).toBeInTheDocument()
    })

    expect(container.textContent).toContain('Total de alertas: 12')
    expect(screen.getAllByText('Corriente').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Desbalance de Corriente').length).toBeGreaterThanOrEqual(1)
  })

  it('renders empty state when there are no alerts', async () => {
    vi.spyOn(alertsApi, 'fetchCurrentMonitoringHistory').mockResolvedValue({
      count: 0,
      results: [],
    })
    render(
      <DesbalanceAlertsHistory
        measurementPointId={77}
        dateAfter={new Date('2026-05-01')}
        dateBefore={new Date('2026-05-10')}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(screen.getByText(/no se encontraron alertas de desbalance/i)).toBeInTheDocument()
    })
  })

  it('calls fetchCurrentMonitoringHistory with current_unbalance subtype', async () => {
    const spy = vi
      .spyOn(alertsApi, 'fetchCurrentMonitoringHistory')
      .mockResolvedValue(sampleAlertsResponse)

    render(
      <DesbalanceAlertsHistory
        measurementPointId={77}
        dateAfter={new Date('2026-05-01')}
        dateBefore={new Date('2026-05-10')}
      />,
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          measurementPointId: 77,
          currentSubtype: ['current_unbalance'],
        })
      )
    })
  })
})
