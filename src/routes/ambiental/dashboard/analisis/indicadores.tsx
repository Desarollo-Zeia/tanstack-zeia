import { createFileRoute } from '@tanstack/react-router'
import { IndicadoresFilters } from '@/features/ambiental/components/indicadores-filters'
import { IndicadoresThresholds } from '@/features/ambiental/components/indicadores-thresholds'
import { IndicadoresTable } from '@/features/ambiental/components/indicadores-table'
import { useIndicadoresFilters } from '@/features/ambiental/hooks/use-indicadores-filters'

export const Route = createFileRoute('/ambiental/dashboard/analisis/indicadores')({
  component: IndicadoresPage,
  validateSearch: (search) => ({
    sede: typeof search.sede === 'string' ? search.sede : undefined,
    sala: typeof search.sala === 'string' ? search.sala : undefined,
    indicador: typeof search.indicador === 'string' ? search.indicador : undefined,
    unidad: typeof search.unidad === 'string' ? search.unidad : undefined,
    desde: typeof search.desde === 'string' ? search.desde : undefined,
    hasta: typeof search.hasta === 'string' ? search.hasta : undefined,
    pagina: typeof search.pagina === 'string' ? search.pagina : undefined,
  }),
})

function IndicadoresPage() {
  const {
    sedeId,
    salaId,
    indicador,
    unidad,
    dateAfter,
    dateBefore,
    page,
    roomDetail,
    availableIndicators,
    isLoadingRoomDetail,
    setIndicator,
    setPage,
  } = useIndicadoresFilters()

  return (
    <div className="space-y-6">
      {/* Header: Title left, Filters right */}
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Indicadores
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Historial de lecturas por sala
          </p>
        </div>
        <IndicadoresFilters />
      </div>

      {/* Content area */}
      {salaId ? (
        /* Content: Thresholds left, Table right */
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
          {/* Left: Thresholds legend */}
          <IndicadoresThresholds
            roomDetail={roomDetail}
            isLoading={isLoadingRoomDetail}
          />

          {/* Right: Table with indicator toggle */}
          <IndicadoresTable
            sedeId={sedeId}
            roomId={salaId}
            indicator={indicador}
            unit={unidad}
            dateAfter={dateAfter}
            dateBefore={dateBefore}
            page={page}
            onPageChange={setPage}
            availableIndicators={availableIndicators}
            roomDetail={roomDetail ?? undefined}
            onIndicatorChange={setIndicator}
          />
        </div>
      ) : (
        /* Empty state when nothing is selected */
        <div className="card-executive p-12 flex items-center justify-center text-center min-h-[300px]">
          <p className="text-sm text-text-muted">
            Seleccione sede, sala, indicador y rango de fechas para ver las lecturas
          </p>
        </div>
      )}
    </div>
  )
}
