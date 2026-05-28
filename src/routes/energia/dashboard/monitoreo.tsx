import { createFileRoute } from '@tanstack/react-router'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { MonitoreoFilters } from '@/features/dashboard/components/monitoreo-filters'
import { PowerGraph } from '@/features/dashboard/components/power-graph'
import { useMonitoreoFilters } from '@/features/dashboard/hooks/use-monitoreo-filters'

export const Route = createFileRoute('/energia/dashboard/monitoreo')({
  component: MonitoreoPage,
  validateSearch: (search) => {
    return {
      sede: typeof search.sede === 'string' ? search.sede : undefined,
      desde: typeof search.desde === 'string' ? search.desde : undefined,
      hasta: typeof search.hasta === 'string' ? search.hasta : undefined,
    }
  },
})

function MonitoreoPage() {
  const { sedeId, dateAfter, dateBefore, isReady } = useMonitoreoFilters()

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Monitoreo de Potencia</h1>
            <p className="text-text-secondary">Seguimiento en tiempo real de la potencia consumida</p>
          </div>
          <MonitoreoFilters />
        </div>

        {isReady && sedeId && dateAfter && dateBefore ? (
          <PowerGraph
            headquarterId={sedeId}
            dateAfter={dateAfter}
            dateBefore={dateBefore}
          />
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center text-text-muted min-h-[300px]">
            <div className="text-center space-y-2">
              <p>Seleccione sede y rango de fechas para ver el gráfico de potencia</p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
