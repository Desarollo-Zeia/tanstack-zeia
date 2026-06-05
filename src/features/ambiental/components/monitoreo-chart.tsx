import { useState, useMemo, useEffect } from 'react'
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
import { useMonitoreoFilters } from '../hooks/use-monitoreo-filters'
import { fetchIndicatorGraphs } from '../api/indicators'
import type { RoomIndicatorData, RoomThresholds } from '../types'

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

function getThresholdLines(
  indicator: string,
  thresholds: RoomThresholds,
  labelCount: number
): Array<{
  label: string
  data: number[]
  borderColor: string
  borderDash: number[]
  borderWidth: number
  pointRadius: number
  fill: boolean
  order: number
}> {
  const lines: ReturnType<typeof getThresholdLines> = []

  if (indicator === 'CO2' && thresholds.co2) {
    const t = thresholds.co2
    lines.push(
      {
        label: 'Bueno (≤' + t.good + ')',
        data: Array(labelCount).fill(t.good),
        borderColor: '#F59E0B',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        order: 999,
      },
      {
        label: 'Moderado (≤' + t.moderate + ')',
        data: Array(labelCount).fill(t.moderate),
        borderColor: '#E71D36',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        order: 999,
      }
    )
  }

  if (indicator === 'TEMPERATURE' && thresholds.temperature) {
    const t = thresholds.temperature
    lines.push(
      {
        label: 'Mín (' + t.min + '°C)',
        data: Array(labelCount).fill(t.min),
        borderColor: '#F59E0B',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        order: 999,
      },
      {
        label: 'Máx (' + t.max + '°C)',
        data: Array(labelCount).fill(t.max),
        borderColor: '#E71D36',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        order: 999,
      }
    )
  }

  if (indicator === 'HUMIDITY' && thresholds.humidity) {
    const t = thresholds.humidity
    lines.push(
      {
        label: 'Mín (' + t.min + '%)',
        data: Array(labelCount).fill(t.min),
        borderColor: '#F59E0B',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        order: 999,
      },
      {
        label: 'Máx (' + t.max + '%)',
        data: Array(labelCount).fill(t.max),
        borderColor: '#E71D36',
        borderDash: [6, 4],
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        order: 999,
      }
    )
  }

  return lines
}

function getThresholdValues(
  indicator: string,
  thresholds: RoomThresholds
): { min: number | null; max: number | null } {
  if (indicator === 'CO2' && thresholds.co2) {
    return { min: thresholds.co2.good, max: thresholds.co2.moderate }
  }
  if (indicator === 'TEMPERATURE' && thresholds.temperature) {
    return {
      min: thresholds.temperature.min,
      max: thresholds.temperature.max,
    }
  }
  if (indicator === 'HUMIDITY' && thresholds.humidity) {
    return {
      min: thresholds.humidity.min,
      max: thresholds.humidity.max,
    }
  }
  return { min: null, max: null }
}

function getUnitLabel(indicator: string, unit: string): string {
  if (indicator === 'HUMIDITY') return '%'
  if (indicator === 'TEMPERATURE') return '°C'
  return unit
}

function formatThresholdValue(
  value: number | null,
  indicator: string,
  unit: string
): string {
  if (value === null) return '—'
  const suffix = getUnitLabel(indicator, unit)
  return value + suffix
}

function formatMaxValue(value: number | null, indicator: string, unit: string): string {
  if (value === null) return '—'
  const suffix = getUnitLabel(indicator, unit)
  return value + suffix
}

function buildChartData(
  rooms: RoomIndicatorData[],
  indicator: string,
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

  const visibleCount = rooms.filter((r) => visibleRooms.has(r.room_id)).length
  const thresholdLines =
    visibleCount === 1
      ? getThresholdLines(indicator, rooms[0].thresholds, labels.length)
      : []

  return {
    labels,
    datasets: [...roomDatasets, ...thresholdLines],
  }
}

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index',
    intersect: false,
  },
  plugins: {
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

interface LegendRowProps {
  room: RoomIndicatorData
  color: string
  index: number
  isVisible: boolean
  indicator: string
  unit: string
  onToggle: () => void
}

function LegendRow({
  room,
  color,
  isVisible,
  indicator,
  unit,
  onToggle,
}: LegendRowProps) {
  const thresholds = getThresholdValues(indicator, room.thresholds)
  const maxValue =
    room.readings.length > 0
      ? Math.max(...room.readings.map((r) => r.value))
      : null

  return (
    <div className="grid grid-cols-[1fr_80px_1fr_1fr_1fr] gap-4 items-center py-3 px-4 border-b border-border/50 last:border-b-0">
      <div className="flex items-center gap-2.5 min-w-0">
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm text-text-primary font-medium truncate">
          {room.room_name}
        </span>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onToggle}
          className={cn(
            'w-5 h-5 rounded border-2 flex items-center justify-center transition-all',
            isVisible
              ? 'border-primary bg-primary text-white'
              : 'border-border bg-transparent hover:border-primary/50'
          )}
        >
          {isVisible && (
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          )}
        </button>
      </div>

      <div className="text-sm text-text-secondary text-center font-mono">
        {formatThresholdValue(thresholds.min, indicator, unit)}
      </div>

      <div className="text-sm text-text-secondary text-center font-mono">
        {formatThresholdValue(thresholds.max, indicator, unit)}
      </div>

      <div className="text-sm text-text-primary font-semibold text-right font-mono">
        {formatMaxValue(maxValue, indicator, unit)}
      </div>
    </div>
  )
}

export function MonitoreoChart() {
  const { indicator, unit, isReady } = useMonitoreoFilters()

  const { data, isLoading } = useQuery({
    queryKey: ['ocupacional-indicator-graph', indicator, unit],
    queryFn: () => {
      if (!indicator || !unit) throw new Error('Missing indicator or unit')
      return fetchIndicatorGraphs({ indicator, unit })
    },
    enabled: isReady,
  })

  const [visibleRooms, setVisibleRooms] = useState<Set<number>>(new Set())

  useEffect(() => {
    if (data) {
      setVisibleRooms(new Set([data[0].room_id]))
    }
  }, [data])

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { labels: [], datasets: [] }
    return buildChartData(data, indicator ?? 'CO2', visibleRooms)
  }, [data, indicator, visibleRooms])

  const toggleRoom = (roomId: number) => {
    setVisibleRooms((prev) => {
      const next = new Set(prev)
      if (next.has(roomId)) {
        next.delete(roomId)
      } else {
        next.add(roomId)
      }
      return next
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {indicator ?? '—'} {unit ? `(${unit})` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : data && data.length > 0 ? (
          <>
            <div className="h-[400px]">
              <Line data={chartData} options={chartOptions} />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
                Leyenda
              </h3>

              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="grid grid-cols-[1fr_80px_1fr_1fr_1fr] gap-4 items-center py-2.5 px-4 bg-secondary/50 border-b border-border">
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                    Salas monitoreadas
                  </span>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider text-center">
                    Mostrar
                  </span>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider text-center col-span-2">
                    Umbral permitido
                  </span>
                  <span className="text-xs font-semibold text-text-muted uppercase tracking-wider text-right">
                    Valor máximo alcanzado
                  </span>
                </div>

                <div className="grid grid-cols-[1fr_80px_1fr_1fr_1fr] gap-4 items-center py-2 px-4 border-b border-border/50 bg-secondary/30">
                  <div />
                  <div />
                  <span className="text-xs text-text-muted text-center">
                    — Mínimo
                  </span>
                  <span className="text-xs text-text-muted text-center">
                    — Máximo
                  </span>
                  <div />
                </div>

                <div>
                  {data.map((room, index) => (
                    <LegendRow
                      key={room.room_id}
                      room={room}
                      color={ROOM_COLORS[index % ROOM_COLORS.length]}
                      index={index}
                      isVisible={visibleRooms.has(room.room_id)}
                      indicator={indicator ?? 'CO2'}
                      unit={unit ?? 'PPM'}
                      onToggle={() => toggleRoom(room.room_id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="h-[400px] flex items-center justify-center text-text-muted">
            No hay datos disponibles para el indicador seleccionado
          </div>
        )}
      </CardContent>
    </Card>
  )
}
