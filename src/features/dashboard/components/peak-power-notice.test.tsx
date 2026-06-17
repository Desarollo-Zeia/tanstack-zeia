import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PeakPowerNotice } from './peak-power-notice'

const mockPeakDemand = {
  date: '2026-06-19',
  hour_start: '18:00',
  hour_end: '19:00',
  description: 'Rango de máxima demanda programada COES',
}

vi.mock('../api/peak-demand-range', () => ({
  fetchPeakDemandRange: vi.fn(),
}))

import { fetchPeakDemandRange } from '../api/peak-demand-range'

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

describe('PeakPowerNotice', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(fetchPeakDemandRange).mockResolvedValue(mockPeakDemand)
  })

  it('renders the button with label', () => {
    render(<PeakPowerNotice />, { wrapper: createWrapper() })

    const button = screen.getByRole('button', { name: /máxima demanda nacional/i })
    expect(button).toBeInTheDocument()
    expect(screen.getByText('Máxima Demanda Nacional')).toBeInTheDocument()
  })

  it('opens the modal and displays fetched data when clicked', async () => {
    const user = userEvent.setup()
    render(<PeakPowerNotice />, { wrapper: createWrapper() })

    const button = screen.getByRole('button', { name: /máxima demanda nacional/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /máxima demanda nacional/i })).toBeInTheDocument()
    })

    expect(screen.getByText('¿Por qué importa?')).toBeInTheDocument()
    expect(screen.getByText('Fecha estimada')).toBeInTheDocument()
    expect(screen.getByText('Horario estimado')).toBeInTheDocument()
    expect(screen.getByText('18:00 – 19:00')).toBeInTheDocument()
  })

  it('shows empty state when there is no data', async () => {
    vi.mocked(fetchPeakDemandRange).mockResolvedValue({
      date: '',
      hour_start: '',
      hour_end: '',
      description: '',
    })

    const user = userEvent.setup()
    render(<PeakPowerNotice />, { wrapper: createWrapper() })

    const button = screen.getByRole('button', { name: /máxima demanda nacional/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/no hay información disponible/i)).toBeInTheDocument()
    })
  })

  it('shows error state when the request fails', async () => {
    vi.mocked(fetchPeakDemandRange).mockRejectedValue(new Error('Network error'))

    const user = userEvent.setup()
    render(<PeakPowerNotice />, { wrapper: createWrapper() })

    const button = screen.getByRole('button', { name: /máxima demanda nacional/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText(/no se pudo cargar la información/i)).toBeInTheDocument()
    })
  })

  it('closes the modal when clicking the backdrop', async () => {
    const user = userEvent.setup()
    render(<PeakPowerNotice />, { wrapper: createWrapper() })

    const button = screen.getByRole('button', { name: /máxima demanda nacional/i })
    await user.click(button)

    await waitFor(() => {
      expect(screen.getByText('Horario estimado')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('modal-backdrop'))

    expect(screen.queryByText('Horario estimado')).not.toBeInTheDocument()
  })
})
