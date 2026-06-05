import { useQuery } from '@tanstack/react-query'
import { DoorOpen, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRoomsFilters } from '../hooks/use-rooms-filters'
import { fetchOcupacionalRooms } from '../api/rooms'
import type { Room } from '../types'

interface StatusHeaderStyle {
  label: string
  bg: string
  text: string
}

const STATUS_HEADER_STYLES: Record<string, StatusHeaderStyle> = {
  GOOD: { label: 'Bueno', bg: 'bg-success', text: 'text-white' },
  HUMIDITY_MAX: { label: 'Humedad Máx.', bg: 'bg-warning', text: 'text-white' },
  TEMP_MAX: { label: 'Temp. Máx.', bg: 'bg-warning', text: 'text-white' },
  CO2_MAX: { label: 'CO₂ Máx.', bg: 'bg-warning', text: 'text-white' },
  OFFLINE: { label: 'Desconectado', bg: 'bg-danger', text: 'text-white' },
  DISABLED: { label: 'Deshabilitado', bg: 'bg-muted', text: 'text-text-primary' },
}

function getStatusHeaderStyle(status: string): StatusHeaderStyle {
  return (
    STATUS_HEADER_STYLES[status] ?? {
      label: status,
      bg: 'bg-muted',
      text: 'text-text-primary',
    }
  )
}

function RoomCardSkeleton() {
  return (
    <div className="card-executive overflow-hidden">
      <div className="h-[88px] bg-muted animate-pulse" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-5 w-3/4 bg-muted rounded animate-pulse" />
          <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-px bg-border/60" />
        <div className="space-y-2">
          <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          <div className="h-4 w-full bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

interface RoomCardProps {
  room: Room
}

function RoomCard({ room }: RoomCardProps) {
  const status = getStatusHeaderStyle(room.status)
  const firstDevice = room.devices[0]
  const isConnected = room.is_activated && room.status !== 'OFFLINE'

  return (
    <div className="card-executive overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
      <div className={cn('relative px-5 py-5 overflow-hidden', status.bg)}>
        <div className="flex items-center justify-between gap-3 relative z-10">
          <span
            className={cn(
              'text-2xl font-bold tracking-tight truncate',
              status.text
            )}
          >
            {status.label}
          </span>

          <div
            className={cn(
              'shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full',
              'bg-white/95 backdrop-blur-sm'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-success' : 'bg-danger',
                isConnected && 'animate-pulse'
              )}
            />
            <span
              className={cn(
                'text-[11px] font-semibold tracking-wide',
                isConnected ? 'text-success' : 'text-danger'
              )}
            >
              {isConnected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>

        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, currentColor 1px, transparent 1px)',
            backgroundSize: '14px 14px',
            color: status.text === 'text-white' ? '#ffffff' : '#1C1C1E',
          }}
        />
      </div>

      <div className="p-5 space-y-4">
        <div>
          <h3
            className="font-semibold text-text-primary text-lg leading-tight truncate"
            title={room.name}
          >
            {room.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5 text-sm text-text-secondary">
            <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="truncate">{room.headquarter.name}</span>
          </div>
        </div>

        <div className="h-px bg-border/60" />

        <div>
          <p
            className="label-executive mb-1.5"
            style={{ color: '#88939b' }}
          >
            Dispositivo
          </p>
          <p
            className="font-mono text-sm text-text-primary font-semibold tracking-wide truncate"
            title={firstDevice?.dev_eui ?? ''}
          >
            {firstDevice?.dev_eui ?? '—'}
          </p>
          {firstDevice?.type_sensor && (
            <span className="inline-flex items-center px-2 py-0.5 mt-2 rounded text-[10px] font-mono font-medium bg-secondary text-text-secondary">
              {firstDevice.type_sensor}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

export function RoomsGrid() {
  const { sedeId, page, pageSize, offset, setPage, isReady } = useRoomsFilters()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ocupacional-rooms', sedeId, page, pageSize],
    queryFn: () => fetchOcupacionalRooms({ limit: pageSize, offset }),
    enabled: isReady,
  })

  const rooms = data?.results ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize))
  const hasPrev = data?.previous !== null && data?.previous !== undefined
  const hasNext = data?.next !== null && data?.next !== undefined

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <RoomCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="card-executive p-12 flex flex-col items-center justify-center text-center">
          <DoorOpen className="w-12 h-12 text-danger mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            Error al cargar las rooms
          </h3>
          <p className="text-sm text-text-muted">
            Intente recargar la página o cambie la sede seleccionada.
          </p>
        </div>
      ) : rooms.length === 0 ? (
        <div className="card-executive p-12 flex flex-col items-center justify-center text-center">
          <DoorOpen className="w-12 h-12 text-text-muted mb-3" />
          <h3 className="text-lg font-semibold text-text-primary mb-1">
            No hay rooms registradas
          </h3>
          <p className="text-sm text-text-muted">
            No se encontraron rooms para la sede seleccionada.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>

          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-text-muted">
              {totalCount} {totalCount === 1 ? 'room' : 'rooms'} · Página {page} de {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={!hasPrev || page <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={!hasNext || page >= totalPages}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
