import { useQuery } from '@tanstack/react-query'
import {
  DoorOpen,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Battery,
  BatteryLow,
  BatteryMedium,
  BatteryFull,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useRoomsFilters } from '../hooks/use-rooms-filters'
import { fetchOcupacionalRooms } from '../api/rooms'
import type { Room, RoomDevice } from '../types'

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

function getBatteryLevel(battery: number | null): 'high' | 'medium' | 'low' | 'unknown' {
  if (battery === null || Number.isNaN(battery)) return 'unknown'
  if (battery < 20) return 'low'
  if (battery < 50) return 'medium'
  return 'high'
}

function getBatteryBarClass(level: ReturnType<typeof getBatteryLevel>): string {
  switch (level) {
    case 'high':
      return 'bg-success'
    case 'medium':
      return 'bg-warning'
    case 'low':
      return 'bg-danger'
    default:
      return 'bg-muted'
  }
}

function getBatteryTextClass(level: ReturnType<typeof getBatteryLevel>): string {
  switch (level) {
    case 'high':
      return 'text-success'
    case 'medium':
      return 'text-warning'
    case 'low':
      return 'text-danger'
    default:
      return 'text-text-muted'
  }
}

function DeviceBatteryRow({ device }: { device: RoomDevice }) {
  const level = getBatteryLevel(device.battery)
  const BatteryIcon =
    level === 'high'
      ? BatteryFull
      : level === 'medium'
        ? BatteryMedium
        : level === 'low'
          ? BatteryLow
          : Battery
  const clamped = device.battery === null ? 0 : Math.min(100, Math.max(0, Math.round(device.battery)))

  return (
    <div className="rounded-lg border border-border/60 bg-background/50 px-3 py-2.5 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-secondary text-text-secondary truncate max-w-[60%]"
          title={device.type_sensor}
        >
          {device.type_sensor}
        </span>
        <span
          className={cn(
            'inline-flex items-center gap-1 text-xs font-mono font-semibold shrink-0',
            getBatteryTextClass(level)
          )}
        >
          <BatteryIcon className="w-4 h-4" />
          {device.battery === null ? 'Sin datos' : `${clamped}%`}
        </span>
      </div>
      <div
        className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
        role="progressbar"
        aria-valuenow={device.battery ?? undefined}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Batería del dispositivo ${device.type_sensor}`}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            getBatteryBarClass(level)
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {device.dev_eui && (
        <p
          className="font-mono text-[11px] text-text-muted truncate"
          title={device.dev_eui}
        >
          {device.dev_eui}
        </p>
      )}
    </div>
  )
}

function RoomCard({ room }: RoomCardProps) {
  const status = getStatusHeaderStyle(room.status)
  const devices = room.devices ?? []
  const isConnected = room.connection_status === 'connected'
  const headerBg = isConnected ? status.bg : 'bg-gray-400 dark:bg-gray-600'
  const headerText = isConnected ? status.text : 'text-white'

  return (
    <div className="card-executive overflow-hidden group hover:-translate-y-0.5 transition-all duration-300">
      <div className={cn('relative px-5 py-5 overflow-hidden', headerBg)}>
        <div className="flex items-center justify-between gap-3 relative z-10">
          <span
            className={cn(
              'text-2xl font-bold tracking-tight truncate',
              headerText
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
            color: headerText === 'text-white' ? '#ffffff' : '#1C1C1E',
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
            {devices.length === 1 ? 'Dispositivo' : `Dispositivos (${devices.length})`}
          </p>
          {devices.length === 0 ? (
            <p className="text-sm text-text-muted">Sin dispositivos</p>
          ) : (
            <div className="space-y-2">
              {devices.map((device) => (
                <DeviceBatteryRow key={device.id} device={device} />
              ))}
            </div>
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
