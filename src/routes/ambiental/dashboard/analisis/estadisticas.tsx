import { createFileRoute } from '@tanstack/react-router'
import { EstadisticasFilters } from '@/features/ambiental/components/estadisticas-filters'
import { EstadisticasChart } from '@/features/ambiental/components/estadisticas-chart'
import { useEstadisticasFilters } from '@/features/ambiental/hooks/use-estadisticas-filters'

export const Route = createFileRoute('/ambiental/dashboard/analisis/estadisticas')({
  component: EstadisticasPage,
  validateSearch: (search) => ({
    sede: typeof search.sede === 'string' ? search.sede : undefined,
    sala: typeof search.sala === 'string' ? search.sala : undefined,
    indicador: typeof search.indicador === 'string' ? search.indicador : undefined,
    unidad: typeof search.unidad === 'string' ? search.unidad : undefined,
    desde: typeof search.desde === 'string' ? search.desde : undefined,
    hasta: typeof search.hasta === 'string' ? search.hasta : undefined,
    intervalo: typeof search.intervalo === 'string' ? search.intervalo : undefined,
    vista: typeof search.vista === 'string' ? search.vista : undefined,
  }),
})

function EstadisticasPage() {
  const {
    salaId,
    indicador,
    unidad,
    dateAfter,
    dateBefore,
    intervalo,
    viewMode,
    setViewMode,
    isReady,
  } = useEstadisticasFilters()

  return (
    <div className="space-y-6">
      {/* Header: Title left, Filters right */}
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Estadísticas
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Tendencias de indicadores ambientales por sala
          </p>
        </div>
        <EstadisticasFilters />
      </div>

      {/* Content */}
      {isReady && salaId && indicador && unidad && dateAfter && dateBefore ? (
        <EstadisticasChart
          roomId={salaId}
          indicator={indicador}
          unit={unidad}
          dateAfter={dateAfter}
          dateBefore={dateBefore}
          interval={intervalo}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />
      ) : (
        <div className="card-executive p-12 flex items-center justify-center text-center min-h-[300px]">
          <p className="text-sm text-text-muted">
            Seleccione sala, indicador y rango de fechas para ver las estadísticas
          </p>
        </div>
      )}
    </div>
  )
}
