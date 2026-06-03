import { createFileRoute } from '@tanstack/react-router'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { AlertasHistoryFilters } from '@/features/dashboard/components/alertas-history-filters'
import { AlertsHistoryTable } from '@/features/dashboard/components/alerts-history-table'
import { useAlertsHistoryFilters } from '@/features/dashboard/hooks/use-alerts-history-filters'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { formatDateISO } from '@/lib/date-utils'

export const Route = createFileRoute('/energia/dashboard/alertas-historial')({
  component: AlertasHistorialPage,
  validateSearch: (search) => {
    return {
      sede: typeof search.sede === 'string' ? search.sede : undefined,
      panel: typeof search.panel === 'string' ? search.panel : undefined,
      punto: typeof search.punto === 'string' ? search.punto : undefined,
      desde: typeof search.desde === 'string' ? search.desde : undefined,
      hasta: typeof search.hasta === 'string' ? search.hasta : undefined,
      pagina: typeof search.pagina === 'string' ? search.pagina : undefined,
      subtype: typeof search.subtype === 'string' ? search.subtype : undefined,
      category: typeof search.category === 'string' ? search.category : undefined,
      indicator: typeof search.indicator === 'string' ? search.indicator : undefined,
      phase: typeof search.phase === 'string' ? search.phase : undefined,
    }
  },
})

function AlertasHistorialPage() {
  const { sedeId, panelId, puntoId, dateAfter, dateBefore, indicator, isReady } = useAlertsHistoryFilters()
  const navigate = useNavigate({ from: '/energia/dashboard/alertas-historial' })

  const isVoltage = indicator === 'voltage-fluctuation'
  const isPower = indicator === 'power-demand'
  const isCurrent = indicator === 'current-monitoring'
  const isHarmonic = indicator === 'harmonic-distortion'
  const pageTitle = isHarmonic
    ? 'Historial de Alertas de Distorsión Armónica'
    : isCurrent
      ? 'Historial de Alertas de Corriente'
      : isPower
        ? 'Historial de Alertas de Potencia'
        : isVoltage
          ? 'Historial de Alertas de Voltaje'
          : 'Historial de Alertas'
  const pageSubtitle = isHarmonic
    ? 'Consulta el historial completo de alertas de distorsión armónica con paginación'
    : isCurrent
      ? 'Consulta el historial completo de alertas de corriente con paginación'
      : isPower
        ? 'Consulta el historial completo de alertas de potencia con paginación'
        : isVoltage
          ? 'Consulta el historial completo de alertas de voltaje con paginación'
          : 'Consulta el historial completo de alertas con paginación'

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div className="space-y-3">
            <Button
              variant="ghost"
              onClick={() => navigate({
                to: '/energia/dashboard/alertas',
                search: {
                  sede: sedeId ? String(sedeId) : undefined,
                  panel: panelId ? String(panelId) : undefined,
                  punto: puntoId ? String(puntoId) : undefined,
                  desde: dateAfter ? formatDateISO(dateAfter) : undefined,
                  hasta: dateBefore ? formatDateISO(dateBefore) : undefined,
                }
              })}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver a alertas
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-text-primary">{pageTitle}</h1>
              <p className="text-text-secondary">{pageSubtitle}</p>
            </div>
          </div>
          <AlertasHistoryFilters />
        </div>

        {isReady && sedeId && panelId && puntoId && dateAfter && dateBefore ? (
          <AlertsHistoryTable />
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center text-text-muted min-h-[300px]">
            <div className="text-center space-y-2">
              <p>Seleccione sede, panel, punto de monitoreo y rango de fechas para ver el historial</p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
