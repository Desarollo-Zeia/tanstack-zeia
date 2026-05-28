import { useState, useMemo, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Line } from 'react-chartjs-2'
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
import { Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchReadingsGraphEspecific } from '@/features/dashboard/api/readings-graph-especific'
import { formatDateISO } from '@/lib/date-utils'
import type { ReadingsGraphEspecificEntry } from '@/features/dashboard/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const LINE_COLORS = [
  '#00B7CA',
  '#2EC4B6',
  '#FF6B35',
  '#E71D36',
  '#9B5DE5',
  '#F15BB5',
  '#00BBF9',
  '#FEE440',
]

interface ReadingsGraphEspecificProps {
  headquarterId: number
  panelId: number
  measurementPointId: number
  dateAfter: Date
  dateBefore: Date
}

function formatTimeLabel(timeStr: string): string {
  const parts = timeStr.split(':')
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`
  }
  return timeStr
}

function formatDateLong(dateStr: string): string {
  if (dateStr === 'habitual') return 'Promedio habitual'
  const date = new Date(dateStr + 'T00:00:00')
  const formatted = date.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

export function ReadingsGraphEspecific({
  headquarterId,
  panelId,
  measurementPointId,
  dateAfter,
  dateBefore,
}: ReadingsGraphEspecificProps) {
  const dateAfterStr = formatDateISO(dateAfter) ?? ''
  const dateBeforeStr = formatDateISO(dateBefore) ?? ''

  const { data, isLoading } = useQuery({
    queryKey: [
      'readings-graph-especific',
      headquarterId,
      panelId,
      measurementPointId,
      dateAfterStr,
      dateBeforeStr,
    ],
    queryFn: () =>
      fetchReadingsGraphEspecific(
        headquarterId,
        panelId,
        measurementPointId,
        dateAfterStr,
        dateBeforeStr
      ),
    enabled: !!headquarterId && !!panelId && !!measurementPointId && !!dateAfterStr && !!dateBeforeStr,
  })

  const dataMap = useMemo(() => {
    if (!data || !Array.isArray(data)) return {}
    const merged: Record<string, ReadingsGraphEspecificEntry[]> = {}
    for (const item of data) {
      for (const [key, entries] of Object.entries(item)) {
        merged[key] = entries
      }
    }
    return merged
  }, [data])

  const dates = useMemo(() => {
    return Object.keys(dataMap).sort()
  }, [dataMap])
  const [visibleDates, setVisibleDates] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (dates.length > 0 && visibleDates.size === 0) {
      setVisibleDates(new Set(dates))
    }
  }, [dates, visibleDates.size])

  const toggleDate = (date: string) => {
    setVisibleDates((prev) => {
      const next = new Set(prev)
      if (next.has(date)) {
        next.delete(date)
      } else {
        next.add(date)
      }
      return next
    })
  }

  const chartData: ChartData<'line'> = useMemo(() => {
    if (Object.keys(dataMap).length === 0) return { labels: [], datasets: [] }

    const allTimes = new Set<string>()
    for (const date of dates) {
      for (const entry of dataMap[date] ?? []) {
        allTimes.add(formatTimeLabel(entry.time))
      }
    }
    const sortedTimes = Array.from(allTimes).sort()

    const datasets = dates
      .filter((date) => visibleDates.has(date))
      .map((date, index) => {
        const color = LINE_COLORS[index % LINE_COLORS.length]
        const entries = dataMap[date] ?? []
        const timeValueMap = new Map<string, number>()
        for (const entry of entries) {
          timeValueMap.set(formatTimeLabel(entry.time), entry.value)
        }

        return {
          label: formatDateLong(date),
          data: sortedTimes.map((time) => timeValueMap.get(time) ?? null),
          borderColor: color,
          backgroundColor: color + '1A',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: false,
          spanGaps: true,
        }
      })

    return {
      labels: sortedTimes,
      datasets,
    }
  }, [dataMap, dates, visibleDates])

  const options: ChartOptions<'line'> = useMemo(
    () => ({
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
          callbacks: {
            title: (items) => {
              if (items.length === 0) return ''
              const time = items[0].label
              return `Hora: ${time}`
            },
            label: (context) => {
              const dateLabel = context.dataset.label ?? ''
              const value = context.raw as number | null
              if (value === null) return ''

              const dateKey = dates.find((d) => formatDateLong(d) === dateLabel)
              if (!dateKey) return ''

              const time = context.label
              const entry = dataMap[dateKey]?.find((e) => formatTimeLabel(e.time) === time)
              if (!entry) return ''

              const formattedValue = value.toLocaleString('es-PE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
              const formattedCost = entry.value_cost.toLocaleString('es-PE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })

              return `${dateLabel}: ${formattedValue} ${entry.unit} = S/ ${formattedCost}`
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            color: 'rgba(136, 147, 155, 0.1)',
          },
          ticks: {
            color: '#88939b',
            maxRotation: 45,
            minRotation: 45,
            maxTicksLimit: 20,
          },
        },
        y: {
          title: {
            display: true,
            text: 'Valor',
            color: '#88939b',
            font: {
              size: 12,
              weight: 'bold',
            },
          },
          grid: {
            color: 'rgba(136, 147, 155, 0.1)',
          },
          ticks: {
            color: '#88939b',
          },
        },
      },
    }),
    [dataMap, dates]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparación por Día</CardTitle>
        <CardDescription>
          Comparativa de lecturas entre diferentes fechas
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-muted">Cargando gráfico...</p>
            </div>
          </div>
        ) : !data || dates.length === 0 ? (
          <div className="flex items-center justify-center text-text-muted min-h-[400px]">
            <div className="text-center space-y-2">
              <Activity className="w-12 h-12 mx-auto text-text-muted/40" />
              <p>No hay datos para el rango de fechas seleccionado</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 p-3 bg-muted/30 rounded-lg">
              {dates.map((date, index) => {
                const color = LINE_COLORS[index % LINE_COLORS.length]
                const isVisible = visibleDates.has(date)
                return (
                  <label
                    key={date}
                    className="flex items-center gap-2 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={isVisible}
                      onChange={() => toggleDate(date)}
                      className="sr-only"
                    />
                    <span
                      className="w-4 h-4 rounded border-2 flex items-center justify-center"
                      style={{
                        borderColor: color,
                        backgroundColor: isVisible ? color : 'transparent',
                      }}
                    >
                      {isVisible && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                    <span className="text-sm text-text-secondary">
                      {formatDateLong(date)}
                    </span>
                  </label>
                )
              })}
            </div>

            <div className="h-[400px]">
              <Line data={chartData} options={options} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
