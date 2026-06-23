import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type Plugin,
} from 'chart.js'
import { Activity, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ZeiaSelect } from '@/components/ui/select'
import { fetchPowerGraph } from '@/features/dashboard/api/power-graph'
import { formatDateISO } from '@/lib/date-utils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

const GROUP_BY_OPTIONS = ['hour', 'day'] as const
type GroupBy = (typeof GROUP_BY_OPTIONS)[number]

const GROUP_BY_LABELS: Record<GroupBy, string> = {
  hour: 'Por Hora',
  day: 'Por Día',
}

interface PowerGraphProps {
  headquarterId: number
  dateAfter: Date
  dateBefore: Date
}

function formatTimeLabel(isoString: string, groupBy: GroupBy): string {
  const date = new Date(isoString)
  if (groupBy === 'day') {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    return `${day}/${month}`
  }
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function PowerGraph({ headquarterId, dateAfter, dateBefore }: PowerGraphProps) {
  const [groupBy, setGroupBy] = useState<GroupBy>('hour')

  const dateAfterStr = formatDateISO(dateAfter) ?? ''
  const dateBeforeStr = formatDateISO(dateBefore) ?? ''

  const { data, isLoading } = useQuery({
    queryKey: ['power-graph', headquarterId, dateAfterStr, dateBeforeStr, groupBy],
    queryFn: () => fetchPowerGraph(headquarterId, dateAfterStr, dateBeforeStr, groupBy),
    enabled: !!headquarterId && !!dateAfterStr && !!dateBeforeStr,
  })

  const { chartData, unit } = useMemo(() => {
    const results = data?.results ?? []
    const unit = results[0]?.unit ?? 'KW'

    const allChannelNames = new Set<string>()
    for (const point of results) {
      for (const channel of point.values_per_channel) {
        allChannelNames.add(channel.measurement_point_name)
      }
    }
    const channelNames = Array.from(allChannelNames)

    const AVG_COLOR = '#00B7CA'
    const PEAK_COLOR = '#FF6B35'

    const datasets: ChartData<'line'>['datasets'] = []

    for (const name of channelNames) {
      const avgData = results.map((point) => {
        const channel = point.values_per_channel.find(
          (c) => c.measurement_point_name === name
        )
        return channel?.power_avg ?? null
      })
      const peakData = results.map((point) => {
        const channel = point.values_per_channel.find(
          (c) => c.measurement_point_name === name
        )
        return channel?.power_peak ?? null
      })

      datasets.push({
        label: `${name} · Potencia promedio`,
        data: avgData,
        borderColor: AVG_COLOR,
        backgroundColor: AVG_COLOR + '1A',
        borderWidth: 2,
        borderDash: [] as number[],
        pointRadius: 1,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: false,
        spanGaps: true,
      })

      datasets.push({
        label: `${name} · Potencia máxima`,
        data: peakData,
        borderColor: PEAK_COLOR,
        backgroundColor: PEAK_COLOR + '1A',
        borderWidth: 2,
        borderDash: [] as number[],
        pointRadius: 1,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: false,
        spanGaps: true,
      })
    }

    const thresholds = data?.power_thresholds
    if (thresholds) {
      const labels = results.map((r) => formatTimeLabel(r.created_at, groupBy))
      const thresholdCount = labels.length

      if (thresholds.power_max !== null) {
        datasets.push({
          label: `Máxima: ${thresholds.power_max} ${unit}`,
          data: Array(thresholdCount).fill(thresholds.power_max),
          borderColor: '#E71D36',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0,
          fill: false,
          spanGaps: true,
        })
      }

      if (thresholds.power_contracted !== null) {
        datasets.push({
          label: `Contratada: ${thresholds.power_contracted} ${unit}`,
          data: Array(thresholdCount).fill(thresholds.power_contracted),
          borderColor: '#FF6B35',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0,
          fill: false,
          spanGaps: true,
        })
      }

      if (thresholds.power_installed !== null) {
        datasets.push({
          label: `Instalada: ${thresholds.power_installed} ${unit}`,
          data: Array(thresholdCount).fill(thresholds.power_installed),
          borderColor: '#FEE440',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [6, 4],
          pointRadius: 0,
          pointHoverRadius: 0,
          tension: 0,
          fill: false,
          spanGaps: true,
        })
      }
    }

    return {
      chartData: {
        labels: results.map((r) => formatTimeLabel(r.created_at, groupBy)),
        datasets,
      } satisfies ChartData<'line'>,
      unit,
    }
  }, [data, groupBy])

  const peakHourPlugin = useMemo<Plugin<'line'>>(() => {
    return {
      id: 'peakHourBand',
      beforeDraw: (chart) => {
        if (groupBy !== 'hour') return
        const results = data?.results ?? []
        if (!results.length) return

        const segments: Array<{ startIdx: number; endIdx: number }> = []
        let currentStart: number | null = null
        for (let i = 0; i < results.length; i++) {
          const date = new Date(results[i].created_at)
          const hour = date.getHours()
          if (hour >= 18 && hour <= 23) {
            if (currentStart === null) currentStart = i
          } else {
            if (currentStart !== null) {
              segments.push({ startIdx: currentStart, endIdx: i - 1 })
              currentStart = null
            }
          }
        }
        if (currentStart !== null) {
          segments.push({ startIdx: currentStart, endIdx: results.length - 1 })
        }
        if (segments.length === 0) return

        const ctx = chart.ctx
        const xAxis = chart.scales.x
        const chartArea = chart.chartArea
        if (!chartArea) return

        const step = xAxis.getPixelForValue(1) - xAxis.getPixelForValue(0)
        const halfStep = step / 2

        ctx.save()
        ctx.fillStyle = 'rgba(231, 29, 54, 0.30)'
        for (const seg of segments) {
          const xStart = xAxis.getPixelForValue(seg.startIdx)
          const xEnd = xAxis.getPixelForValue(seg.endIdx)
          ctx.fillRect(
            xStart - halfStep,
            chartArea.top,
            xEnd - xStart + step,
            chartArea.bottom - chartArea.top
          )
        }
        ctx.restore()
      },
    }
  }, [data, groupBy])

  const options: ChartOptions<'line'> = useMemo(
    () => ({
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
        peakHourBand: {},
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: '#4D5A63',
            usePointStyle: true,
            pointStyle: 'circle',
            padding: 16,
            font: {
              size: 11,
            },
            filter: (item) => {
              const text = item.text
              return (
                !text.startsWith('Máxima:') &&
                !text.startsWith('Contratada:') &&
                !text.startsWith('Instalada:')
              )
            },
          },
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const item = items[0]
              const results = data?.results ?? []
              const rawIndex = item?.dataIndex ?? 0
              const raw = results[rawIndex]
              if (!raw) return ''
              const date = new Date(raw.created_at)
              if (groupBy === 'day') {
                return date.toLocaleDateString('es-PE', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                })
              }
              return date.toLocaleString('es-PE', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })
            },
            label: (context) => {
              const value = context.raw as number
              return `${context.dataset.label}: ${value.toLocaleString('es-PE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ${unit}`
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
            text: `Potencia (${unit})`,
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
    [data, unit, groupBy]
  )

  const groupByOptions = GROUP_BY_OPTIONS.map((gb) => ({
    value: gb,
    label: GROUP_BY_LABELS[gb],
  }))

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Gráfico de Potencia</CardTitle>
            <CardDescription>
              Monitoreo continuo de los niveles de potencia por punto de medición
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            {groupBy === 'hour' && (
              <div className="flex items-center gap-2 rounded-lg border-l-4 border-[#E71D36] bg-[#E71D36]/10 px-3 py-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#E71D36] opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#E71D36]" />
                </span>
                <div className="flex flex-col leading-tight">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E71D36]">
                    Hora punta
                  </span>
                  <span className="font-mono text-xs font-semibold text-[#E71D36]">
                    18:00 – 23:00
                  </span>
                </div>
              </div>
            )}
            <div className="min-w-[140px]">
              <ZeiaSelect
                options={groupByOptions}
                value={groupBy}
                onChange={(val) => setGroupBy(val as GroupBy)}
                placeholder="Agrupar por"
                icon={Clock}
              />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-muted">Cargando gráfico...</p>
            </div>
          </div>
        ) : !data || data.results.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            <div className="text-center space-y-2">
              <Activity className="w-12 h-12 mx-auto text-text-muted/40" />
              <p>No hay datos de potencia para el rango de fechas seleccionado</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-[400px]">
            <Line data={chartData} options={options} plugins={[peakHourPlugin]} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
