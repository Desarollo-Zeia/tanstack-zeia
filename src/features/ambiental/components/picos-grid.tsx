import { useQuery } from '@tanstack/react-query'
import { Activity, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, Calendar, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { fetchPeakHistory } from '../api/peak-history'
import type { PeakHistoryRoom } from '../types'

interface PicosGridProps {
  indicator: string
  unit: string
  dateAfter: Date
  dateBefore: Date
  page: number
  onPageChange: (page: number) => void
}

const INDICATOR_LABELS: Record<string, string> = {
  CO2: 'CO₂',
  TEMPERATURE: 'Temperatura',
  HUMIDITY: 'Humedad',
}

const UNIT_LABELS: Record<string, string> = {
  PPM: 'ppm',
  PERCENT: '%',
  CELSIUS: '°C',
}

const STATUS_COLORS: Record<string, string> = {
  GOOD: '#2EC4B6',
  MODERATE: '#FFB800',
  UNHEALTHY: '#FF6B35',
  DANGEROUS: '#E71D36',
  CRITICAL: '#991B1B',
}

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  const months = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ]
  const weekday = weekdays[date.getDay()]
  const day = date.getDate()
  const month = months[date.getMonth()]
  return `${weekday} ${day} de ${month}`
}

function PeakCard({ room, indicatorLabel, unitLabel }: { room: PeakHistoryRoom; indicatorLabel: string; unitLabel: string }) {
  const highest = room.readings_highest
  const lowest = room.readings_lowest

  const highestColor = STATUS_COLORS[highest.status] ?? '#8E8E93'
  const lowestColor = STATUS_COLORS[lowest.status] ?? '#8E8E93'

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <h3 className="text-lg font-bold text-text-primary">{room.room_name}</h3>
        <p className="text-sm text-text-secondary">
          Umbrales de {indicatorLabel}
        </p>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        {/* Highest Reading */}
        <div className="rounded-xl overflow-hidden border border-border">
          <div
            className="px-4 py-2 text-center text-white text-sm font-semibold"
            style={{ backgroundColor: highestColor }}
          >
            <ArrowUp className="w-4 h-4 inline mr-1" />
            Nivel más alto
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">
                {indicatorLabel}
              </span>
              <span className="text-2xl font-bold font-mono text-text-primary">
                {highest.value.toLocaleString('es-PE', { maximumFractionDigits: 1 })} {unitLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: highestColor }}
              />
              <span style={{ color: highestColor }} className="font-medium">
                {highest.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="w-4 h-4" />
              {formatDateLong(highest.date)}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock className="w-4 h-4" />
              {highest.hour}
            </div>
          </div>
        </div>

        {/* Lowest Reading */}
        <div className="rounded-xl overflow-hidden border border-border">
          <div
            className="px-4 py-2 text-center text-white text-sm font-semibold"
            style={{ backgroundColor: lowestColor }}
          >
            <ArrowDown className="w-4 h-4 inline mr-1" />
            Nivel más bajo
          </div>
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-text-secondary text-sm">
                {indicatorLabel}
              </span>
              <span className="text-2xl font-bold font-mono text-text-primary">
                {lowest.value.toLocaleString('es-PE', { maximumFractionDigits: 1 })} {unitLabel}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: lowestColor }}
              />
              <span style={{ color: lowestColor }} className="font-medium">
                {lowest.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Calendar className="w-4 h-4" />
              {formatDateLong(lowest.date)}
            </div>
            <div className="flex items-center gap-2 text-sm text-text-secondary">
              <Clock className="w-4 h-4" />
              {lowest.hour}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const ITEMS_PER_PAGE = 3

export function PicosGrid({ indicator, unit, dateAfter, dateBefore, page, onPageChange }: PicosGridProps) {
  const dateAfterStr = dateAfter.toISOString().split('T')[0]
  const dateBeforeStr = dateBefore.toISOString().split('T')[0]

  const { data, isLoading } = useQuery({
    queryKey: ['peak-history', indicator, unit, dateAfterStr, dateBeforeStr],
    queryFn: () =>
      fetchPeakHistory({
        indicator,
        unit,
        dateAfter: dateAfterStr,
        dateBefore: dateBeforeStr,
      }),
    enabled: !!indicator && !!unit && !!dateAfterStr && !!dateBeforeStr,
  })

  const allRooms = data?.results ?? []
  const totalCount = data?.count ?? 0

  // Client-side pagination: show only 3 items per page
  const totalPages = Math.max(1, Math.ceil(allRooms.length / ITEMS_PER_PAGE))
  const safePage = Math.min(Math.max(1, page), totalPages)
  
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE
  const visibleRooms = allRooms.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const hasPrevious = safePage > 1
  const hasNext = safePage < totalPages

  const indicatorLabel = INDICATOR_LABELS[indicator] ?? indicator
  const unitLabel = UNIT_LABELS[unit] ?? unit

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
          <div key={i} className="h-[400px] bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  if (allRooms.length === 0) {
    return (
      <div className="card-executive p-12 flex items-center justify-center text-center min-h-[300px]">
        <div className="text-center space-y-2">
          <Activity className="w-12 h-12 mx-auto text-text-muted/40" />
          <p className="text-text-muted">No hay picos históricos registrados para los filtros seleccionados</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleRooms.map((room) => (
          <PeakCard
            key={room.room_id}
            room={room}
            indicatorLabel={indicatorLabel}
            unitLabel={unitLabel}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-text-muted">
          {totalCount} salas · Página {safePage} de {totalPages}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(safePage - 1)}
            disabled={!hasPrevious}
            className={cn(
              'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              'hover:bg-secondary text-text-primary',
              !hasPrevious && 'opacity-40 cursor-not-allowed'
            )}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>
          <button
            type="button"
            onClick={() => onPageChange(safePage + 1)}
            disabled={!hasNext}
            className={cn(
              'flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all',
              'hover:bg-secondary text-text-primary',
              !hasNext && 'opacity-40 cursor-not-allowed'
            )}
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
