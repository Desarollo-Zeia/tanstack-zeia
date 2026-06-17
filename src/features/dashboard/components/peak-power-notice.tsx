import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Zap, Calendar, Clock, X, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { fetchPeakDemandRange } from '../api/peak-demand-range'

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`
}

export function PeakPowerNotice() {
  const [isOpen, setIsOpen] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['peak-demand-range'],
    queryFn: fetchPeakDemandRange,
  })

  const hasData = !!data?.date && !!data?.hour_start && !!data?.hour_end

  const handleToggle = useCallback(() => {
    setIsOpen((prev) => !prev)
  }, [])

  const handleClose = useCallback(() => {
    setIsOpen(false)
  }, [])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [isOpen])

  return (
    <>
      {/* Main button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Máxima Demanda Nacional"
        aria-expanded={isOpen}
        disabled={isLoading}
        className={cn(
          'inline-flex items-center gap-2.5 h-10 pl-4 pr-5 rounded-lg border transition-all duration-200',
          'bg-danger border-danger text-white shadow-sm',
          'hover:bg-[#C91830] hover:border-[#C91830] hover:shadow-[0_0_16px_rgba(231,29,54,0.35)]',
          isLoading && 'opacity-80 cursor-not-allowed'
        )}
      >
        <span className="relative flex items-center justify-center w-5 h-5">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <Zap className="w-4 h-4" />
              {hasData && (
                <span
                  className="absolute top-0 right-0 w-2 h-2 rounded-full bg-white border-2 border-danger"
                  aria-hidden="true"
                />
              )}
            </>
          )}
        </span>
        <span className="text-sm font-semibold whitespace-nowrap">Máxima Demanda Nacional</span>
      </button>

      {/* Centered modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          aria-modal="true"
          role="dialog"
        >
          {/* Backdrop */}
          <div
            data-testid="modal-backdrop"
            onClick={handleClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-fade-in"
            aria-hidden="true"
          />

          {/* Modal card */}
          <div
            className={cn(
              'relative w-[560px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-2rem)] overflow-y-auto',
              'bg-card border border-border rounded-2xl shadow-medium z-10',
              'animate-fade-in'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-2">
              <div className="flex items-center gap-2.5">
                <Zap className="w-5 h-5 text-danger" strokeWidth={2} />
                <h3 className="text-base font-semibold text-foreground">
                  Máxima Demanda Nacional
                </h3>
              </div>
              <button
                type="button"
                onClick={handleClose}
                aria-label="Cerrar"
                className="text-text-muted hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-6">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-text-muted">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <p className="text-sm">Cargando información...</p>
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-text-muted">
                  <AlertCircle className="w-8 h-8 text-danger" />
                  <p className="text-sm text-center">
                    No se pudo cargar la información. Intente nuevamente más tarde.
                  </p>
                </div>
              ) : !hasData ? (
                <div className="flex flex-col items-center justify-center gap-3 py-8 text-text-muted">
                  <Calendar className="w-8 h-8 opacity-40" />
                  <p className="text-sm text-center">
                    No hay información disponible sobre la máxima demanda nacional.
                  </p>
                </div>
              ) : (
                <>
                  {/* Data cards */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-secondary/30">
                      <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-danger" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[11px] text-text-muted uppercase tracking-wide font-medium">Fecha estimada</p>
                        <p className="text-lg text-foreground font-semibold">{formatDateLong(data.date)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 p-4 rounded-xl border border-border bg-secondary/30">
                      <div className="w-10 h-10 rounded-lg bg-danger/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-danger" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="text-[11px] text-text-muted uppercase tracking-wide font-medium">Horario estimado</p>
                        <p className="text-lg text-foreground font-semibold font-mono">
                          {data.hour_start} – {data.hour_end}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border" />

                  {/* Explanation */}
                  <div className="space-y-3">
                    <p className="text-[11px] text-text-muted uppercase tracking-wide font-semibold">
                      ¿Por qué importa?
                    </p>
                    <p className="text-sm text-text-secondary leading-relaxed">
                      Durante este horario se espera el mayor consumo de potencia a nivel nacional, lo que eleva el costo por potencia y afecta tu facturación.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="w-1 h-1 rounded-full bg-danger mt-2 shrink-0" />
                        <span>Reduce cargas no críticas en esa franja.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="w-1 h-1 rounded-full bg-danger mt-2 shrink-0" />
                        <span>Ajusta procesos industriales o activa respaldos.</span>
                      </li>
                      <li className="flex items-start gap-2 text-sm text-text-secondary">
                        <span className="w-1 h-1 rounded-full bg-danger mt-2 shrink-0" />
                        <span>Genera ahorro en tu costo de potencia.</span>
                      </li>
                    </ul>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="w-full py-2.5 text-sm text-center text-danger bg-white border border-danger rounded-lg font-semibold hover:bg-danger hover:text-white transition-colors"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
