import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  FileText,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  AlertCircle,
  Receipt,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { fetchTariffPdfs } from '../api/tariff-pdfs'
import type { TariffPdf } from '../types'

interface TariffPdfViewerProps {
  sedeId: number
  isOpen: boolean
  onClose: () => void
}

function extractDriveFileId(url: string): string | null {
  const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)
  return match?.[1] ?? null
}

function getDriveEmbedUrl(fileId: string): string {
  return `https://drive.google.com/file/d/${fileId}/preview`
}

function InvoiceFrame({ invoice }: { invoice: TariffPdf }) {
  const [isLoading, setIsLoading] = useState(true)
  const fileId = extractDriveFileId(invoice.pdf_url)

  return (
    <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-border bg-secondary/30">
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-text-muted">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm">Cargando vista previa...</p>
        </div>
      )}

      {fileId ? (
        <iframe
          key={invoice.id}
          src={getDriveEmbedUrl(fileId)}
          title={invoice.title}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          onLoad={() => setIsLoading(false)}
          allow="autoplay"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-text-muted p-6 text-center">
          <FileText className="w-12 h-12 opacity-40" />
          <p className="text-sm">
            No se puede previsualizar este archivo directamente.
          </p>
        </div>
      )}
    </div>
  )
}

export function TariffPdfViewer({ sedeId, isOpen, onClose }: TariffPdfViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const { data, isLoading, error } = useQuery({
    queryKey: ['tariff-pdfs', sedeId],
    queryFn: () => fetchTariffPdfs(sedeId),
    enabled: isOpen && !!sedeId,
  })

  const invoices = data?.data ?? []
  const currentInvoice = invoices[currentIndex]
  const hasMultiple = invoices.length > 1

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : invoices.length - 1))
  }, [invoices.length])

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < invoices.length - 1 ? prev + 1 : 0))
  }, [invoices.length])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen || invoices.length === 0) return
      if (event.key === 'ArrowLeft') handlePrevious()
      if (event.key === 'ArrowRight') handleNext()
      if (event.key === 'Escape') onClose()
    },
    [isOpen, invoices.length, handlePrevious, handleNext, onClose]
  )

  // Lock body scroll and reset index when opening
  useEffect(() => {
    if (!isOpen) return

    setCurrentIndex(0)
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        data-testid="tariff-pdf-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-[720px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto',
          'bg-card border border-border rounded-2xl shadow-medium z-10',
          'animate-fade-in flex flex-col'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-2.5">
            <Receipt className="w-5 h-5 text-primary" strokeWidth={2} />
            <h3 className="text-base font-semibold text-foreground">
              Facturas disponibles
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-text-muted hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-text-muted">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Cargando facturas...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-text-muted">
              <AlertCircle className="w-10 h-10 text-danger" />
              <p className="text-sm text-center">
                No se pudieron cargar las facturas. Intente nuevamente más tarde.
              </p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-text-muted">
              <FileText className="w-10 h-10 opacity-40" />
              <p className="text-sm">No hay facturas disponibles.</p>
            </div>
          ) : (
            <>
              {/* Title + counter */}
              <div className="flex items-center justify-between gap-4">
                <h4 className="text-sm font-semibold text-text-primary truncate">
                  {currentInvoice?.title}
                </h4>
                <span className="text-xs text-text-muted font-medium whitespace-nowrap">
                  {currentIndex + 1} de {invoices.length}
                </span>
              </div>

              {/* Preview */}
              {currentInvoice && <InvoiceFrame invoice={currentInvoice} />}

              {/* Controls */}
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={!hasMultiple}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </Button>

                <a
                  href={currentInvoice?.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 h-9 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:bg-primary-hover hover:shadow-glow transition-all duration-200"
                >
                  <ExternalLink className="w-4 h-4" />
                  Abrir en Google Drive
                </a>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!hasMultiple}
                  className="gap-1"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
