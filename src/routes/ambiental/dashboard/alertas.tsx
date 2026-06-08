import { createFileRoute } from '@tanstack/react-router'
import { OcupacionalShell } from '@/features/ambiental/components/shell'
import { AlertsFilters } from '@/features/ambiental/components/alerts-filters'
import { AlertsTable } from '@/features/ambiental/components/alerts-table'

export const Route = createFileRoute('/ambiental/dashboard/alertas')({
  component: AlertasPage,
  validateSearch: (search) => ({
    sala: typeof search.sala === 'string' ? search.sala : undefined,
    indicador: typeof search.indicador === 'string' ? search.indicador : undefined,
    desde: typeof search.desde === 'string' ? search.desde : undefined,
    hasta: typeof search.hasta === 'string' ? search.hasta : undefined,
    pagina: typeof search.pagina === 'string' ? search.pagina : undefined,
  }),
})

function AlertasPage() {
  return (
    <OcupacionalShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Alertas
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Historial de alertas ambientales por sala
            </p>
          </div>
          <AlertsFilters />
        </div>

        <AlertsTable />
      </div>
    </OcupacionalShell>
  )
}
