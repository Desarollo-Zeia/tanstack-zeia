import { useState, useMemo, useEffect, useRef } from 'react'
import { useQueries } from '@tanstack/react-query'
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
import { cn } from '@/lib/utils'
import { fetchRoomIndicatorGraph } from '../api/indicators'
import { formatDateReadable, formatDateShort } from '@/lib/date-utils'
import type { Room } from '../types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

interface EstadisticasChartCombinedProps {
  roomIds: number[]
  rooms: Room[]
  selectedDates: string[]
  indicator: string
  unit: string
  dateAfter: Date
  dateBefore: Date
  interval: number | null
}

interface DatasetKey {
  roomId: number
  date: string
}

function getUnitLabel(unit: string): string {
  if (unit === 'PERCENT') return '%'
  if (unit === 'CELSIUS') return '°C'
  if (unit === 'PPM') return 'ppm'
  return unit.toLowerCase()
}

function getColor(index: number, total: number): string {
  const hue = Math.round((index * 360) / Math.max(total, 1))
  return `hsl(${hue}, 75%, 50%)`
}

function buildChartData(
  datasets: Array<{
    key: DatasetKey
    roomName: string
    readings: Array<{ hour: string; value: number }>
    color: string
    hidden: boolean
  }>
): ChartData<'line'> {
  if (datasets.length === 0) {
    return { labels: [], datasets: [] }
  }

  const firstVisible = datasets.find((d) => !d.hidden)
  const labels = firstVisible
    ? firstVisible.readings.map((r) => r.hour)
    : datasets[0].readings.map((r) => r.hour)

  return {
    labels,
    datasets: datasets.map((d) => ({
      label: `${d.roomName} - ${formatDateShort(d.key.date)}`,
      data: d.readings.map((r) => r.value),
      borderColor: d.color,
      backgroundColor: d.color + '20',
      borderWidth: 2,
      pointRadius: 0,
      pointHoverRadius: 5,
      pointHoverBackgroundColor: d.color,
      pointHoverBorderColor: d.color,
      tension: 0.3,
      fill: false,
      hidden: d.hidden,
    })),
  }
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
          title: (context) => {
            const reading = context[0]?.label
            return reading ? `Hora: ${reading}` : ''
          },
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

export function EstadisticasChartCombined({
  roomIds,
  rooms,
  selectedDates,
  indicator,
  unit,
  dateAfter,
  dateBefore,
  interval,
}: EstadisticasChartCombinedProps) {
  const dateAfterStr = dateAfter.toISOString().split('T')[0]
  const dateBeforeStr = dateBefore.toISOString().split('T')[0]

  const roomQueries = useQueries({
    queries: roomIds.map((roomId) => ({
      queryKey: [
        'estadisticas-room-graph',
        roomId,
        indicator,
        unit,
        dateAfterStr,
        dateBeforeStr,
        interval,
      ] as const,
      queryFn: () =>
        fetchRoomIndicatorGraph({
          roomId,
          indicator,
          unit,
          dateAfter: dateAfterStr,
          dateBefore: dateBeforeStr,
          interval,
        }),
      enabled:
        roomIds.length > 0 &&
        selectedDates.length > 0 &&
        !!indicator &&
        !!unit &&
        !!dateAfterStr &&
        !!dateBeforeStr,
    })),
  })

  const isLoading = roomQueries.some((q) => q.isLoading)
  const hasError = roomQueries.some((q) => q.isError)

  const roomDataMap = useMemo(() => {
    const map = new Map<number, Map<string, Array<{ hour: string; value: number }>>>()
    roomQueries.forEach((query, index) => {
      const roomId = roomIds[index]
      if (!query.data || !roomId) return

      const dateMap = new Map<string, Array<{ hour: string; value: number }>>()
      Object.entries(query.data).forEach(([date, readings]) => {
        if (!selectedDates.includes(date)) return
        dateMap.set(
          date,
          readings.map((r) => ({ hour: r.hour, value: r.value }))
        )
      })
      map.set(roomId, dateMap)
    })
    return map
  }, [roomQueries, roomIds, selectedDates])

  const allDatasetKeys = useMemo(() => {
    const keys: Array<DatasetKey & { roomName: string }> = []
    roomIds.forEach((roomId) => {
      const room = rooms.find((r) => r.id === roomId)
      if (!room) return
      const dateMap = roomDataMap.get(roomId)
      if (!dateMap) return
      dateMap.forEach((_, date) => {
        keys.push({ roomId, date, roomName: room.name })
      })
    })
    return keys
  }, [roomIds, rooms, roomDataMap])

  const [visibleDatasets, setVisibleDatasets] = useState<Set<string>>(new Set())
  const hasInitialized = useRef(false)
  const previousSelectionRef = useRef<string>('')

  useEffect(() => {
    if (allDatasetKeys.length > 0 && !hasInitialized.current) {
      hasInitialized.current = true
      setVisibleDatasets(
        new Set(allDatasetKeys.map((k) => `${k.roomId}|${k.date}`))
      )
    }
  }, [allDatasetKeys])

  // Reset initialization when the selection changes completely
  useEffect(() => {
    const currentSelection = `${roomIds.slice().sort().join(',')}|${selectedDates.slice().sort().join(',')}`
    if (
      roomIds.length === 0 ||
      selectedDates.length === 0 ||
      previousSelectionRef.current !== currentSelection
    ) {
      previousSelectionRef.current = currentSelection
      hasInitialized.current = false
      setVisibleDatasets(new Set())
    }
  }, [roomIds, selectedDates])

  const datasets = useMemo(() => {
    return allDatasetKeys.map((key, index) => {
      const readings = roomDataMap.get(key.roomId)?.get(key.date) ?? []
      return {
        key,
        roomName: key.roomName,
        readings,
        color: getColor(index, Math.max(allDatasetKeys.length, 1)),
        hidden: !visibleDatasets.has(`${key.roomId}|${key.date}`),
      }
    })
  }, [allDatasetKeys, roomDataMap, visibleDatasets])

  const chartData = useMemo(() => buildChartData(datasets), [datasets])

  const toggleDataset = (roomId: number, date: string) => {
    const key = `${roomId}|${date}`
    setVisibleDatasets((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size <= 1) {
          return next
        }
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  if (roomIds.length === 0 || selectedDates.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-text-muted">
        Seleccione al menos una sala y una fecha para comparar
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dataset Checkboxes */}
      {allDatasetKeys.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">
            Líneas a mostrar en la gráfica:
          </p>
          <div className="flex flex-wrap gap-3">
            {allDatasetKeys.map((key, index) => {
              const color = getColor(index, Math.max(allDatasetKeys.length, 1))
              const isVisible = visibleDatasets.has(`${key.roomId}|${key.date}`)
              return (
                <button
                  key={`${key.roomId}|${key.date}`}
                  type="button"
                  onClick={() => toggleDataset(key.roomId, key.date)}
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
                      <svg
                        className="w-3 h-3"
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
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="font-medium">{key.roomName}</span>
                  <span className="text-text-muted">·</span>
                  <span className="text-text-muted">
                    {formatDateReadable(key.date)}
                  </span>
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
      ) : hasError ? (
        <div className="h-[400px] flex items-center justify-center text-text-muted">
          Ocurrió un error al cargar algunos datos. Intente nuevamente.
        </div>
      ) : datasets.length > 0 ? (
        <div className="h-[400px]">
          <Line
            key={Array.from(visibleDatasets).sort().join(',')}
            data={chartData}
            options={getChartOptions(unit)}
          />
        </div>
      ) : (
        <div className="h-[400px] flex items-center justify-center text-text-muted">
          No hay datos disponibles para las salas y fechas seleccionadas
        </div>
      )}
    </div>
  )
}
