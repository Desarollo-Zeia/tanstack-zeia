import { useState, useMemo, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { fetchIndicatorGraphs } from '../api/indicators'
import { EstadisticasChartByDate } from './estadisticas-chart-by-date'
import type { RoomIndicatorData, ViewMode } from '../types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const ROOM_COLORS = [
  '#00B7CA',
  '#2EC4B6',
  '#FF6B35',
  '#E71D36',
  '#8B5CF6',
  '#F59E0B',
  '#10B981',
  '#6366F1',
  '#EC4899',
  '#84CC16',
  '#06B6D4',
  '#F97316',
]

interface EstadisticasChartProps {
  roomId: number
  indicator: string
  unit: string
  dateAfter: Date
  dateBefore: Date
  interval: number | null
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

function buildChartData(
  rooms: RoomIndicatorData[],
  visibleRooms: Set<number>
): ChartData<'line'> {
  if (rooms.length === 0) {
    return { labels: [], datasets: [] }
  }

  const labels = rooms[0].readings.map((r) => r.hour)

  const roomDatasets = rooms.map((room, index) => ({
    label: room.room_name,
    data: room.readings.map((r) => r.value),
    borderColor: ROOM_COLORS[index % ROOM_COLORS.length],
    backgroundColor: ROOM_COLORS[index % ROOM_COLORS.length] + '20',
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 5,
    tension: 0.3,
    fill: false,
    hidden: !visibleRooms.has(room.room_id),
  }))

  return {
    labels,
    datasets: roomDatasets,
  }
}

function getIndicatorLabel(indicator: string): string {
  if (indicator === 'CO2') return 'CO₂'
  if (indicator === 'TEMPERATURE') return 'Temperatura'
  if (indicator === 'HUMIDITY') return 'Humedad'
  return indicator
}

function getUnitLabel(unit: string): string {
  if (unit === 'PERCENT') return '%'
  if (unit === 'CELSIUS') return '°C'
  if (unit === 'PPM') return 'ppm'
  return unit.toLowerCase()
}

function getChartOptions(unit: string): ChartOptions<'line'> {
  const unitLabel = getUnitLabel(unit)

  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      datalabels: {
        display: false,
      },
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#FFFFFF',
        titleColor: '#1C1C1E',
        bodyColor: '#4D5A63',
        borderColor: '#E8E8E3',
        borderWidth: 1,
        padding: 12,
        titleFont: { family: 'Poppins', size: 13, weight: 600 },
        bodyFont: { family: 'Poppins', size: 12 },
        displayColors: true,
        boxPadding: 4,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y
            return `${context.dataset.label}: ${value} ${unitLabel}`
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 12,
          font: {
            family: 'Poppins',
            size: 11,
          },
          color: '#8E8E93',
        },
      },
      y: {
        grid: {
          color: '#E8E8E3',
        },
        ticks: {
          font: {
            family: 'JetBrains Mono',
            size: 11,
          },
          color: '#8E8E93',
        },
      },
    },
  }
}

export function EstadisticasChart({ roomId, indicator, unit, dateAfter, dateBefore, interval, viewMode, onViewModeChange }: EstadisticasChartProps) {
  const dateAfterStr = dateAfter.toISOString().split('T')[0]
  const dateBeforeStr = dateBefore.toISOString().split('T')[0]

  const { data, isLoading } = useQuery({
    queryKey: ['estadisticas-indicator-graph', indicator, unit, dateAfterStr, dateBeforeStr, interval],
    queryFn: () =>
      fetchIndicatorGraphs({
        indicator,
        unit,
        dateAfter: dateAfterStr,
        dateBefore: dateBeforeStr,
        interval,
      }),
    enabled: viewMode === 'by-room' && !!indicator && !!unit && !!dateAfterStr && !!dateBeforeStr,
  })

  const [visibleRooms, setVisibleRooms] = useState<Set<number>>(new Set())
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (data && data.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true
      setVisibleRooms(new Set([data[0].room_id]))
    }
  }, [data])

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], datasets: [] }
    return buildChartData(data, visibleRooms)
  }, [data, visibleRooms])

  const toggleRoom = (roomId: number) => {
    setVisibleRooms((prev) => {
      const next = new Set(prev)
      if (next.has(roomId)) {
        if (next.size <= 1) {
          return next
        }
        next.delete(roomId)
      } else {
        next.add(roomId)
      }
      return next
    })
  }

  const unitLabel = getUnitLabel(unit)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {getIndicatorLabel(indicator)} {unitLabel ? `(${unitLabel})` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* View Mode Switch */}
        <div className="flex items-center gap-1 bg-muted rounded-lg p-1 w-fit">
          <button
            type="button"
            onClick={() => onViewModeChange('by-room')}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              viewMode === 'by-room'
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            Por Sala
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('by-date')}
            className={cn(
              'px-3 py-1.5 rounded-md text-sm font-medium transition-all',
              viewMode === 'by-date'
                ? 'bg-white text-text-primary shadow-sm'
                : 'text-text-muted hover:text-text-secondary'
            )}
          >
            Por Fecha
          </button>
        </div>

        {viewMode === 'by-date' ? (
          <EstadisticasChartByDate
            roomId={roomId}
            indicator={indicator}
            unit={unit}
            dateAfter={dateAfter}
            dateBefore={dateBefore}
            interval={interval}
          />
        ) : (
          <>
            {/* Room Checkboxes */}
            {data && data.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-text-secondary">
                  Salas a mostrar en la gráfica:
                </p>
                <div className="flex flex-wrap gap-3">
                  {data.map((room, index) => {
                    const color = ROOM_COLORS[index % ROOM_COLORS.length]
                    const isVisible = visibleRooms.has(room.room_id)
                    return (
                      <button
                        key={room.room_id}
                        type="button"
                        onClick={() => toggleRoom(room.room_id)}
                        className={cn(
                          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all',
                          'border hover:shadow-soft',
                          isVisible
                            ? 'border-primary/30 bg-primary/5 text-text-primary'
                            : 'border-border bg-card text-text-muted'
                        )}
                      >
                        <div
                          className={cn(
                            'w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
                            isVisible
                              ? 'border-primary bg-primary text-white'
                              : 'border-border bg-transparent'
                          )}
                        >
                          {isVisible && (
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="font-medium">{room.room_name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Chart */}
            {isLoading ? (
              <div className="h-[400px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : data && data.length > 0 ? (
              <div className="h-[400px]">
                <Line
                  key={Array.from(visibleRooms).sort().join(',')}
                  data={chartData}
                  options={getChartOptions(unit)}
                />
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-text-muted">
                No hay datos disponibles para los filtros seleccionados
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
