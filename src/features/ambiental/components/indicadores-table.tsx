import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { fetchRoomReadings } from '../api/room-readings'
import { downloadRoomIndicatorReport } from '../api/download-report'
import type { RoomIndicatorActivated, RoomDetail } from '../types'

interface IndicadoresTableProps {
  sedeId: number | null
  roomId: number
  indicator: string | null
  unit: string | null
  dateAfter: Date | null
  dateBefore: Date | null
  page: number
  onPageChange: (page: number) => void
  availableIndicators: RoomIndicatorActivated[]
  roomDetail: RoomDetail | undefined
  onIndicatorChange: (indicator: string, unit: string) => void
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
  TEMP_MIN: '#00B7CA',
  TEMP_MAX: '#E71D36',
  HUMIDITY_MIN: '#00B7CA',
  HUMIDITY_MAX: '#E71D36',
}

const STATUS_LABELS: Record<string, string> = {
  GOOD: 'Bueno',
  MODERATE: 'Moderado',
  UNHEALTHY: 'No Saludable',
  DANGEROUS: 'Peligroso',
  CRITICAL: 'Crítico',
  TEMP_MIN: 'Mínima',
  TEMP_MAX: 'Máxima',
  HUMIDITY_MIN: 'Mínima',
  HUMIDITY_MAX: 'Máxima',
}

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const WEEKDAY_NAMES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
]

function formatDateLong(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const weekday = WEEKDAY_NAMES[date.getDay()]
  const day = date.getDate()
  const month = MONTH_NAMES[date.getMonth()]
  return `${weekday}, ${day} de ${month}`
}

export function IndicadoresTable({
  sedeId,
  roomId,
  indicator,
  unit,
  dateAfter,
  dateBefore,
  page,
  onPageChange,
  availableIndicators,
  roomDetail,
  onIndicatorChange,
}: IndicadoresTableProps) {
  const dateAfterStr = dateAfter ? dateAfter.toISOString().split('T')[0] : ''
  const dateBeforeStr = dateBefore ? dateBefore.toISOString().split('T')[0] : ''

  const hasIndicator = !!indicator && !!unit
  const hasDates = !!dateAfterStr && !!dateBeforeStr

  const { data, isLoading } = useQuery({
    queryKey: ['room-readings', roomId, indicator, unit, dateAfterStr, dateBeforeStr, page],
    queryFn: () => {
      if (!indicator || !unit || !dateAfterStr || !dateBeforeStr) {
        throw new Error('Missing required parameters')
      }
      return fetchRoomReadings({
        roomId,
        indicator,
        unit,
        dateAfter: dateAfterStr,
        dateBefore: dateBeforeStr,
        page,
      })
    },
    enabled: !!roomId && hasIndicator && hasDates,
  })

  const readings = data?.results ?? []
  const totalCount = data?.count ?? 0
  const hasPrevious = !!data?.previous
  const hasNext = !!data?.next

  const roomName = roomDetail?.name ?? 'Sala'
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    if (!sedeId || !indicator || !unit) return
    setIsDownloading(true)
    try {
      await downloadRoomIndicatorReport(
        sedeId,
        indicator,
        unit,
        dateAfterStr,
        dateBeforeStr,
        `reporte_${indicator}_${roomId}_${dateAfterStr}.xlsx`
      )
    } catch (error) {
      console.error('Error al descargar el reporte:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <CardTitle>Lecturas — {roomName}</CardTitle>
              <CardDescription>
                {hasIndicator
                  ? `${totalCount} lectura${totalCount !== 1 ? 's' : ''} registrada${totalCount !== 1 ? 's' : ''}`
                  : 'Seleccione un indicador para ver las lecturas'}
              </CardDescription>
            </div>
            {hasIndicator && (
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  'bg-green-600 text-white hover:bg-green-700',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <img src="/excel.png" alt="Excel" className="w-4 h-4" />
                {isDownloading ? 'Descargando...' : 'Descargar Excel'}
              </button>
            )}
          </div>

          {/* Toggle de Indicadores */}
          {availableIndicators.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {availableIndicators.map((ind) => {
                const isActive = ind.indicator === indicator && ind.unit === unit
                return (
                  <button
                    key={`${ind.indicator}-${ind.unit}`}
                    type="button"
                    onClick={() => onIndicatorChange(ind.indicator, ind.unit)}
                    className={cn(
                      'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-primary text-white shadow-glow'
                        : 'bg-muted text-text-secondary hover:bg-primary/10 hover:text-primary border border-border'
                    )}
                  >
                    {INDICATOR_LABELS[ind.indicator] ?? ind.indicator} ({UNIT_LABELS[ind.unit] ?? ind.unit})
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasIndicator ? (
          /* No indicator selected yet */
          <div className="min-h-[200px] flex items-center justify-center text-text-muted">
            <div className="text-center space-y-2">
              <Activity className="w-12 h-12 mx-auto text-text-muted/40" />
              <p>Seleccione un indicador para ver las lecturas</p>
            </div>
          </div>
        ) : isLoading ? (
          /* Loading data for the selected indicator */
          <div className="min-h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-muted">Cargando lecturas...</p>
            </div>
          </div>
        ) : readings.length === 0 ? (
          /* No readings found */
          <div className="min-h-[200px] flex items-center justify-center text-text-muted">
            <div className="text-center space-y-2">
              <Activity className="w-12 h-12 mx-auto text-text-muted/40" />
              <p>No hay lecturas registradas para los filtros seleccionados</p>
            </div>
          </div>
        ) : (
          /* Data table */
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-text-secondary whitespace-nowrap">
                      Fecha
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary whitespace-nowrap">
                      Hora
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-text-secondary whitespace-nowrap">
                      Cantidad
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary whitespace-nowrap">
                      Unidad
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary whitespace-nowrap">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {readings.map((reading, index) => {
                    const statusColor = STATUS_COLORS[reading.status] ?? '#8E8E93'
                    const statusLabel = STATUS_LABELS[reading.status] ?? reading.status
                    return (
                      <tr
                        key={index}
                        className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-text-primary whitespace-nowrap">
                          {formatDateLong(reading.date)}
                        </td>
                        <td className="py-3 px-4 text-text-secondary whitespace-nowrap">
                          {reading.hours}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-medium text-text-primary whitespace-nowrap">
                          {Number(reading.value).toLocaleString('es-PE', {
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 px-4 text-text-secondary whitespace-nowrap">
                          {UNIT_LABELS[reading.unit] ?? reading.unit}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${statusColor}15`,
                              color: statusColor,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: statusColor }}
                            />
                            {statusLabel}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <div className="text-sm text-text-muted">
                Mostrando {readings.length} de {totalCount} registros
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onPageChange(page - 1)}
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
                <span className="text-sm font-medium text-text-primary px-2">
                  Página {page}
                </span>
                <button
                  type="button"
                  onClick={() => onPageChange(page + 1)}
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
          </>
        )}
      </CardContent>
    </Card>
  )
}
