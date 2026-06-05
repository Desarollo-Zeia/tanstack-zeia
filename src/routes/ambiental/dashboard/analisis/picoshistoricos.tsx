import { createFileRoute } from '@tanstack/react-router'
import { PicosFilters } from '@/features/ambiental/components/picos-filters'
import { PicosGrid } from '@/features/ambiental/components/picos-grid'
import { usePicosFilters } from '@/features/ambiental/hooks/use-picos-filters'

export const Route = createFileRoute('/ambiental/dashboard/analisis/picoshistoricos')({
  component: PicosHistoricosPage,
  validateSearch: (search) => ({
    indicador: typeof search.indicador === 'string' ? search.indicador : undefined,
    unidad: typeof search.unidad === 'string' ? search.unidad : undefined,
    desde: typeof search.desde === 'string' ? search.desde : undefined,
    hasta: typeof search.hasta === 'string' ? search.hasta : undefined,
    pagina: typeof search.pagina === 'string' ? search.pagina : undefined,
  }),
})

function PicosHistoricosPage() {
  const {
    indicador,
    unidad,
    dateAfter,
    dateBefore,
    page,
    isReady,
    setPage,
  } = usePicosFilters()

  return (
    <div className="space-y-6">
      {/* Header: Title left, Filters right */}
      <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Picos Históricos
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Top valores más altos y bajos por sala
          </p>
        </div>
        <PicosFilters />
      </div>

      {/* Content */}
      {isReady && indicador && unidad && dateAfter && dateBefore ? (
        <PicosGrid
          indicator={indicador}
          unit={unidad}
          dateAfter={dateAfter}
          dateBefore={dateBefore}
          page={page}
          onPageChange={setPage}
        />
      ) : (
        <div className="card-executive p-12 flex items-center justify-center text-center min-h-[300px]">
          <p className="text-sm text-text-muted">
            Seleccione indicador y rango de fechas para ver los picos históricos
          </p>
        </div>
      )}
    </div>
  )
}
