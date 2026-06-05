import { createFileRoute } from '@tanstack/react-router'
import { OcupacionalShell } from '@/features/ambiental/components/shell'
import { RoomsFilters } from '@/features/ambiental/components/rooms-filters'
import { RoomsGrid } from '@/features/ambiental/components/rooms-grid'
import { useRoomsFilters } from '@/features/ambiental/hooks/use-rooms-filters'

export const Route = createFileRoute('/ambiental/dashboard/rooms')({
  component: RoomsPage,
  validateSearch: (search) => ({
    sede: typeof search.sede === 'string' ? search.sede : undefined,
    pagina: typeof search.pagina === 'string' ? search.pagina : undefined,
  }),
})

function RoomsPage() {
  const { isReady } = useRoomsFilters()

  return (
    <OcupacionalShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              Rooms
            </h1>
            <p className="text-text-secondary text-sm mt-1">
              Monitoreo ambiental por sala y sede
            </p>
          </div>
          <RoomsFilters />
        </div>

        {isReady ? (
          <RoomsGrid />
        ) : (
          <div className="card-executive p-12 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-text-muted">Cargando filtros...</p>
          </div>
        )}
      </div>
    </OcupacionalShell>
  )
}
