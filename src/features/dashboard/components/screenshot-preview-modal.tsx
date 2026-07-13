import { useEffect, useCallback } from 'react'
import { Download, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDateISO } from '@/lib/date-utils'

interface ScreenshotPreviewModalProps {
  imageUrl: string
  filename: string
  isOpen: boolean
  onClose: () => void
}

export function ScreenshotPreviewModal({
  imageUrl,
  filename,
  isOpen,
  onClose,
}: ScreenshotPreviewModalProps) {
  const handleDownload = useCallback(() => {
    const link = document.createElement('a')
    link.download = `${filename}-${formatDateISO(new Date())}.png`
    link.href = imageUrl
    link.click()
  }, [imageUrl, filename])

  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-8"
      aria-modal="true"
      role="dialog"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 flex flex-col w-full max-w-5xl max-h-[90vh] bg-card rounded-xl border border-border shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="text-base font-semibold text-text-primary">
            Vista previa de captura
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text-primary hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Image */}
        <div className="flex-1 overflow-auto p-4 bg-[#F2F2F2]">
          <img
            src={imageUrl}
            alt="Vista previa"
            className="mx-auto max-w-full h-auto rounded-lg shadow-soft"
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t border-border bg-card">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Descargar PNG
          </Button>
        </div>
      </div>
    </div>
  )
}
