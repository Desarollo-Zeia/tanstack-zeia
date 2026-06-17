import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { DesbalanceAlertasFilters } from '@/features/dashboard/components/desbalance-alertas-filters'
import { DesbalanceAlertsHistory } from '@/features/dashboard/components/desbalance-alerts-history'
import { useDesbalanceAlertasFilters } from '@/features/dashboard/hooks/use-desbalance-alertas-filters'

export const Route = createFileRoute('/energia/dashboard/desbalance/alertas')({
  component: DesbalanceAlertasPage,
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

function DesbalanceAlertasPage() {
  const router = useRouter()
  const { sedeId, panelId, puntoId, dateAfter, dateBefore, isReady } =
    useDesbalanceAlertasFilters()

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <button
              onClick={() =>
                router.navigate({
                  to: '/energia/dashboard/desbalance',
                  search: (prev) => ({
                    sede: prev.sede,
                    panel: prev.panel,
                    punto: prev.punto,
                    desde: prev.desde,
                    hasta: prev.hasta,
                  }),
                })
              }
              className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a Desbalance
            </button>
            <h1 className="text-2xl font-bold text-text-primary">Alertas de Desbalance</h1>
            <p className="text-text-secondary">
              Historial de alertas de desbalance de corriente por fase
            </p>
          </div>
          <DesbalanceAlertasFilters />
        </div>

        {isReady && sedeId && panelId && puntoId && dateAfter && dateBefore ? (
          <DesbalanceAlertsHistory
            measurementPointId={puntoId}
            dateAfter={dateAfter}
            dateBefore={dateBefore}
          />
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
