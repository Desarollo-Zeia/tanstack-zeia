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
import { cn } from '@/lib/utils'
import { fetchRoomIndicatorGraph } from '../api/indicators'
import type { RoomIndicatorGraphResponse } from '../types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const DATE_COLORS = [
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

interface EstadisticasChartByDateProps {
  roomId: number
  indicator: string
  unit: string
  dateAfter: Date
  dateBefore: Date
  interval: number | null
}

function formatDateShort(dateStr: string): string {
  const [, month, day] = dateStr.split('-').map(Number)
  const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  return `${String(day).padStart(2, '0')} ${months[month - 1]}`
}

function getUnitLabel(unit: string): string {
  if (unit === 'PERCENT') return '%'
  if (unit === 'CELSIUS') return '°C'
  if (unit === 'PPM') return 'ppm'
  return unit.toLowerCase()
}

function buildChartData(
  data: RoomIndicatorGraphResponse,
  visibleDates: Set<string>
): ChartData<'line'> {
  const dates = Object.keys(data).sort()

  if (dates.length === 0) {
    return { labels: [], datasets: [] }
  }

  const firstDateReadings = data[dates[0]]
  const labels = firstDateReadings.map((r) => r.hour)

  const dateDatasets = dates.map((date, index) => ({
    label: formatDateShort(date),
    data: data[date].map((r) => r.value),
    borderColor: DATE_COLORS[index % DATE_COLORS.length],
    backgroundColor: DATE_COLORS[index % DATE_COLORS.length] + '20',
    borderWidth: 2,
    pointRadius: 0,
    pointHoverRadius: 5,
    tension: 0.3,
    fill: false,
    hidden: !visibleDates.has(date),
  }))

  return {
    labels,
    datasets: dateDatasets,
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

export function EstadisticasChartByDate({
  roomId,
  indicator,
  unit,
  dateAfter,
  dateBefore,
  interval,
}: EstadisticasChartByDateProps) {
  const dateAfterStr = dateAfter.toISOString().split('T')[0]
  const dateBeforeStr = dateBefore.toISOString().split('T')[0]

  const { data, isLoading } = useQuery({
    queryKey: ['estadisticas-room-graph', roomId, indicator, unit, dateAfterStr, dateBeforeStr, interval],
    queryFn: () =>
      fetchRoomIndicatorGraph({
        roomId,
        indicator,
        unit,
        dateAfter: dateAfterStr,
        dateBefore: dateBeforeStr,
        interval,
      }),
    enabled: !!roomId && !!indicator && !!unit && !!dateAfterStr && !!dateBeforeStr,
  })

  const [visibleDates, setVisibleDates] = useState<Set<string>>(new Set())
  const hasInitialized = useRef(false)

  useEffect(() => {
    if (data) {
      const dates = Object.keys(data).sort()
      if (dates.length > 0 && !hasInitialized.current) {
        hasInitialized.current = true
        setVisibleDates(new Set([dates[0]]))
      }
    }
  }, [data])

  const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return { labels: [], datasets: [] }
    return buildChartData(data, visibleDates)
  }, [data, visibleDates])

  const toggleDate = (date: string) => {
    setVisibleDates((prev) => {
      const next = new Set(prev)
      if (next.has(date)) {
        if (next.size <= 1) {
          return next
        }
        next.delete(date)
      } else {
        next.add(date)
      }
      return next
    })
  }

  const dates = data ? Object.keys(data).sort() : []

  return (
    <>
      {/* Date Checkboxes */}
      {dates.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-text-secondary">
            Fechas a mostrar en la gráfica:
          </p>
          <div className="flex flex-wrap gap-3">
            {dates.map((date, index) => {
              const color = DATE_COLORS[index % DATE_COLORS.length]
              const isVisible = visibleDates.has(date)
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => toggleDate(date)}
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
                  <span className="font-medium">{formatDateShort(date)}</span>
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
      ) : dates.length > 0 ? (
        <div className="h-[400px]">
          <Line
            key={Array.from(visibleDates).sort().join(',')}
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
  )
}
