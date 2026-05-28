import { createFileRoute } from '@tanstack/react-router'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { AlertasFilters } from '@/features/dashboard/components/alertas-filters'
import { AlertsSummary } from '@/features/dashboard/components/alerts-summary'
import { AlertsTable } from '@/features/dashboard/components/alerts-table'
import { useAlertasFilters } from '@/features/dashboard/hooks/use-alertas-filters'

export const Route = createFileRoute('/energia/dashboard/alertas')({
  component: AlertasPage,
  validateSearch: (search) => {
    return {
      sede: typeof search.sede === 'string' ? search.sede : undefined,
      panel: typeof search.panel === 'string' ? search.panel : undefined,
      punto: typeof search.punto === 'string' ? search.punto : undefined,
      desde: typeof search.desde === 'string' ? search.desde : undefined,
      hasta: typeof search.hasta === 'string' ? search.hasta : undefined,
    }
  },
})

function AlertasPage() {
  const { sedeId, panelId, puntoId, dateAfter, dateBefore, currentPanel, isReady } = useAlertasFilters()

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Alertas</h1>
            <p className="text-text-secondary">Gestión y monitoreo de alertas del sistema</p>
          </div>
          <AlertasFilters />
        </div>

        {isReady && sedeId && panelId && puntoId && dateAfter && dateBefore ? (
          <div className="space-y-6">
            {currentPanel && (
              <AlertsSummary panelName={currentPanel.name} measurementPointId={puntoId} />
            )}
            <AlertsTable measurementPointId={puntoId} />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center text-text-muted min-h-[300px]">
            <div className="text-center space-y-2">
              <p>Seleccione sede, panel, punto de monitoreo y rango de fechas para ver las alertas</p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
