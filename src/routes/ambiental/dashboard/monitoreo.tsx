import { createFileRoute } from '@tanstack/react-router'
import { OcupacionalShell } from '@/features/ambiental/components/shell'
import { MonitoreoFilters } from '@/features/ambiental/components/monitoreo-filters'
import { MonitoreoChart } from '@/features/ambiental/components/monitoreo-chart'
import { useMonitoreoFilters } from '@/features/ambiental/hooks/use-monitoreo-filters'
import { ScreenshotCard } from '@/features/dashboard/components/screenshot-card'

export const Route = createFileRoute('/ambiental/dashboard/monitoreo')({
  component: MonitoreoPage,
  validateSearch: (search) => ({
    indicador:
      typeof search.indicador === 'string' ? search.indicador : undefined,
    unidad: typeof search.unidad === 'string' ? search.unidad : undefined,
  }),
})

function MonitoreoPage() {
  const { isReady } = useMonitoreoFilters()

  return (
    <OcupacionalShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Monitoreo
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Tendencias de indicadores ambientales por sala
            </p>
          </div>
          <MonitoreoFilters />
        </div>

        {isReady ? (
          <ScreenshotCard
            title="Monitoreo"
            filename="monitoreo-ambiental"
            variant="browser"
            url="administrador.zeia.com.pe/ambiental/dashboard/monitoreo"
            filters={<MonitoreoFilters />}
          >
            <MonitoreoChart />
          </ScreenshotCard>
        ) : (
          <div className="card-executive p-12 flex items-center justify-center text-center">
            <p className="text-sm text-text-muted">Cargando filtros...</p>
          </div>
        )}
      </div>
    </OcupacionalShell>
  )
}
