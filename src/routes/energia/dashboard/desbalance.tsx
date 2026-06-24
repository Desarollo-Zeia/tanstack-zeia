import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Zap, Activity } from 'lucide-react'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { DesbalanceFilters } from '@/features/dashboard/components/desbalance-filters'
import { UnbalancedCountersGraph, type UnbalancedType } from '@/features/dashboard/components/unbalanced-counters-graph'
import { TopUnbalancedCards } from '@/features/dashboard/components/top-unbalanced-cards'
import { ImbalancedEventsTable } from '@/features/dashboard/components/imbalanced-events-table'
import { useDesbalanceFilters } from '@/features/dashboard/hooks/use-desbalance-filters'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/energia/dashboard/desbalance')({
  component: DesbalancePage,
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

function DesbalancePage() {
  const [activeType, setActiveType] = useState<UnbalancedType>('current')
  const { sedeId, panelId, puntoId, dateAfter, dateBefore, isReady } = useDesbalanceFilters()

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Desbalance de Carga</h1>
            <p className="text-text-secondary">Análisis de desbalance entre fases</p>
          </div>
          <DesbalanceFilters />
        </div>

        {isReady && sedeId && panelId && puntoId && dateAfter && dateBefore ? (
          <>
            <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-3">Top 3  - Mayor desbalance del día</h2>
                <TopUnbalancedCards
                  headquarterId={sedeId}
                  dateAfter={dateAfter}
                  dateBefore={dateBefore}
                />
              </div>

              <div className="space-y-4 min-w-0">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="inline-flex rounded-lg border border-border bg-card p-1">
                    <button
                      type="button"
                      onClick={() => setActiveType('current')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                        activeType === 'current'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      <Zap className="w-4 h-4" />
                      Corriente
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveType('voltage')}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all',
                        activeType === 'voltage'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-text-secondary hover:text-text-primary'
                      )}
                    >
                      <Activity className="w-4 h-4" />
                      Voltaje
                    </button>
                  </div>

                  {/* <button
                    onClick={() =>
                      router.navigate({
                        to: '/energia/dashboard/desbalance/alertas',
                        search: (prev) => ({
                          sede: prev.sede,
                          panel: prev.panel,
                          punto: prev.punto,
                          desde: prev.desde,
                          hasta: prev.hasta,
                        }),
                      })
                    }
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-primary text-white hover:bg-primary/90"
                  >
                    <Bell className="w-4 h-4" />
                    Ver alertas
                  </button> */}
                </div>

                <UnbalancedCountersGraph
                  key={activeType}
                  headquarterId={sedeId}
                  panelId={panelId}
                  measurementPointId={puntoId}
                  dateAfter={dateAfter}
                  dateBefore={dateBefore}
                  type={activeType}
                />
              </div>
            </div>

            <ImbalancedEventsTable
              headquarterId={sedeId}
              panelId={panelId}
              measurementPointId={puntoId}
              dateAfter={dateAfter}
              dateBefore={dateBefore}
              type={activeType}
            />
          </>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center text-text-muted min-h-[300px]">
            <div className="text-center space-y-2">
              <p>Seleccione sede, panel, punto de monitoreo y rango de fechas para ver el análisis</p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
