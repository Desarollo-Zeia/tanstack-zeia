import { createFileRoute } from '@tanstack/react-router'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { ComparadorFilters } from '@/features/dashboard/components/comparador-filters'
import { ReadingsGraphEspecific } from '@/features/dashboard/components/readings-graph-especific'
import { useComparadorFilters } from '@/features/dashboard/hooks/use-comparador-filters'

export const Route = createFileRoute('/energia/dashboard/comparador')({
  component: ComparadorPage,
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

function ComparadorPage() {
  const { sedeId, panelId, puntoId, dateAfter, dateBefore, isReady } = useComparadorFilters()

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-end gap-4">
          <ComparadorFilters />
        </div>

        {isReady && sedeId && panelId && puntoId && dateAfter && dateBefore ? (
          <ReadingsGraphEspecific
            headquarterId={sedeId}
            panelId={panelId}
            measurementPointId={puntoId}
            dateAfter={dateAfter}
            dateBefore={dateBefore}
          />
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center text-text-muted min-h-[300px]">
            <div className="text-center space-y-2">
              <p>Seleccione sede, panel, punto de monitoreo y rango de fechas para ver la comparación</p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
