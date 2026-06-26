import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TariffPdfViewer } from './tariff-pdf-viewer'
import * as tariffPdfsApi from '../api/tariff-pdfs'

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

const mockInvoices = {
  data: [
    {
      id: 3,
      title: 'Factura Mayo 2026',
      pdf_url: 'https://drive.google.com/file/d/1rcumLSYpEIKl9rvG30giRm77x-2gv5k6/view?usp=sharing',
    },
    {
      id: 1,
      title: 'Factura Abril 2026',
      pdf_url: 'https://drive.google.com/file/d/1-OVQH5E1DBpo9RDUhlzoV0K-EtAQQZ5T/view?usp=sharing',
    },
  ],
}

describe('TariffPdfViewer', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('shows loading state while fetching invoices', () => {
    vi.spyOn(tariffPdfsApi, 'fetchTariffPdfs').mockImplementation(
      () => new Promise(() => {})
    )

    renderWithProviders(
      <TariffPdfViewer sedeId={67} isOpen={true} onClose={vi.fn()} />
    )

    expect(screen.getByText('Cargando facturas...')).toBeInTheDocument()
  })

  it('renders the first invoice title and counter', async () => {
    vi.spyOn(tariffPdfsApi, 'fetchTariffPdfs').mockResolvedValue(mockInvoices)

    renderWithProviders(
      <TariffPdfViewer sedeId={67} isOpen={true} onClose={vi.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByText('Factura Mayo 2026')).toBeInTheDocument()
    })

    expect(screen.getByText('1 de 2')).toBeInTheDocument()
  })

  it('navigates between invoices', async () => {
    const user = userEvent.setup()
    vi.spyOn(tariffPdfsApi, 'fetchTariffPdfs').mockResolvedValue(mockInvoices)

    renderWithProviders(
      <TariffPdfViewer sedeId={67} isOpen={true} onClose={vi.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByText('Factura Mayo 2026')).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /siguiente/i }))

    await waitFor(() => {
      expect(screen.getByText('Factura Abril 2026')).toBeInTheDocument()
    })
    expect(screen.getByText('2 de 2')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /anterior/i }))

    await waitFor(() => {
      expect(screen.getByText('Factura Mayo 2026')).toBeInTheDocument()
    })
  })

  it('opens the current invoice in a new tab', async () => {
    vi.spyOn(tariffPdfsApi, 'fetchTariffPdfs').mockResolvedValue(mockInvoices)

    renderWithProviders(
      <TariffPdfViewer sedeId={67} isOpen={true} onClose={vi.fn()} />
    )

    await waitFor(() => {
      expect(screen.getByText('Factura Mayo 2026')).toBeInTheDocument()
    })

    const link = screen.getByRole('link', { name: /abrir en google drive/i })
    expect(link).toHaveAttribute('href', mockInvoices.data[0].pdf_url)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('closes when clicking the backdrop', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    vi.spyOn(tariffPdfsApi, 'fetchTariffPdfs').mockResolvedValue(mockInvoices)

    renderWithProviders(
      <TariffPdfViewer sedeId={67} isOpen={true} onClose={onClose} />
    )

    await waitFor(() => {
      expect(screen.getByText('Factura Mayo 2026')).toBeInTheDocument()
    })

    await user.click(screen.getByTestId('tariff-pdf-backdrop'))

    expect(onClose).toHaveBeenCalled()
  })
})
