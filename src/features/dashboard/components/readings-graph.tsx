import { useState, useMemo, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
  type Plugin,
  type TooltipItem,
} from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import { Activity, BarChart3, Clock, LineChart, ZoomOut } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ZeiaSelect } from '@/components/ui/select'
import { fetchReadingsGraph } from '@/features/dashboard/api/readings-graph'
import { formatDateISO, formatDateShort, formatDateTimeShort } from '@/lib/date-utils'
import { getElectricParameter } from '@/lib/electric-parameters'
import type { Category } from '@/features/dashboard/hooks/use-home-filters'
import type { MeasurementPointThresholds } from '@/features/dashboard/types'
import { cn } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, zoomPlugin)

const FALLBACK_INDICATORS = ['P', 'Q']

const ALL_LAST_BY_OPTIONS = ['minute', 'hour', 'day', 'week', 'month'] as const
const ENERGY_LAST_BY_OPTIONS = ['hour', 'day', 'week', 'month'] as const
export type LastBy = (typeof ALL_LAST_BY_OPTIONS)[number]

const LAST_BY_LABELS: Record<LastBy, string> = {
  minute: 'Minuto',
  hour: 'Hora',
  day: 'Día',
  week: 'Semana',
  month: 'Mes',
}

interface ReadingsGraphProps {
  headquarterId: number
  panelId: number
  measurementPointId: number
  dateAfter: Date
  dateBefore: Date
  category: Category
  availableIndicators: string[]
  activeIndicator: string
  onIndicatorChange: (indicator: string) => void
  thresholds?: MeasurementPointThresholds | null
}

function formatThresholdValue(value: number): string {
  return value.toLocaleString('es-PE', { maximumFractionDigits: 2 })
}

function formatTimeLabel(isoString: string, lastBy: LastBy): string {
  const date = new Date(isoString)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  switch (lastBy) {
    case 'minute':
      return `${hours}:${minutes}`
    case 'hour':
      return `${hours}:${minutes}`
    case 'day':
    case 'week':
      return formatDateShort(isoString)
    case 'month':
      return formatDateShort(isoString)
    default:
      return `${hours}:${minutes}`
  }
}

function formatTooltipTitle(isoString: string, lastBy: LastBy): string {
  switch (lastBy) {
    case 'minute':
    case 'hour':
      return formatDateTimeShort(isoString)
    case 'day':
    case 'week':
    case 'month':
      return formatDateShort(isoString)
    default:
      return formatDateTimeShort(isoString)
  }
}

export function ReadingsGraph({
  headquarterId,
  panelId,
  measurementPointId,
  dateAfter,
  dateBefore,
  category,
  availableIndicators,
  activeIndicator,
  onIndicatorChange,
  thresholds,
}: ReadingsGraphProps) {
  const indicatorOptions =
    availableIndicators.length > 0 ? availableIndicators : FALLBACK_INDICATORS

  const [lastBy, setLastBy] = useState<LastBy>(category === 'energy' ? 'hour' : 'minute')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')
  const lineChartRef = useRef<ChartJS<'line'> | null>(null)
  const barChartRef = useRef<ChartJS<'bar'> | null>(null)

  const handleResetZoom = () => {
    const chart = lineChartRef.current ?? barChartRef.current
    chart?.resetZoom()
  }

  const dateAfterStr = formatDateISO(dateAfter) ?? ''
  const dateBeforeStr = formatDateISO(dateBefore) ?? ''

  const { data, isLoading } = useQuery({
    queryKey: [
      'readings-graph',
      headquarterId,
      panelId,
      measurementPointId,
      dateAfterStr,
      dateBeforeStr,
      activeIndicator,
      category,
      lastBy,
    ],
    queryFn: () =>
      fetchReadingsGraph(
        headquarterId,
        panelId,
        measurementPointId,
        dateAfterStr,
        dateBeforeStr,
        activeIndicator,
        lastBy
      ),
    enabled:
      !!headquarterId &&
      !!panelId &&
      !!measurementPointId &&
      !!dateAfterStr &&
      !!dateBeforeStr &&
      !!activeIndicator,
  })

  const isEnergyCategory = category === 'energy'

  const unit = data?.[0]?.unit ?? ''
  const activeParam = getElectricParameter(activeIndicator)
  const thresholdUnit = activeParam?.unit ?? unit

  // El umbral corresponde a la categoría del indicador seleccionado
  const thresholdRange = thresholds?.[category] ?? null
  const upperThreshold = thresholdRange?.upper_threshold ?? null
  const lowerThreshold = thresholdRange?.lower_threshold ?? null

  // Dibuja el valor del umbral (con unidad) directamente sobre cada línea
  const thresholdLabelsPlugin = useMemo<Plugin<'line'>>(() => ({
    id: 'thresholdLabels',
    afterDraw: (chart) => {
      const { ctx, chartArea, scales } = chart
      if (!chartArea) return

      const items: Array<{ value: number; color: string }> = []
      if (upperThreshold !== null) items.push({ value: upperThreshold, color: '#E71D36' })
      if (lowerThreshold !== null) items.push({ value: lowerThreshold, color: '#FF6B35' })
      if (items.length === 0) return

      ctx.save()
      ctx.font = '600 11px Poppins, sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      for (const item of items) {
        const y = scales.y.getPixelForValue(item.value)
        if (y < chartArea.top || y > chartArea.bottom) continue

        const text = `${formatThresholdValue(item.value)} ${thresholdUnit}`
        const paddingX = 6
        const boxHeight = 16
        const boxWidth = ctx.measureText(text).width + paddingX * 2
        const boxX = chartArea.right - boxWidth - 6
        const boxY = y - boxHeight / 2

        ctx.fillStyle = item.color
        ctx.beginPath()
        ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 4)
        ctx.fill()

        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(text, boxX + boxWidth / 2, y + 0.5)
      }

      ctx.restore()
    },
  }), [upperThreshold, lowerThreshold, thresholdUnit])

  const chartData = useMemo(() => {
    const results = data ?? []

    const mainDataset = {
      label: activeIndicator,
      data: results.map((r) => (isEnergyCategory ? r.difference : r.first_value)),
      borderColor: '#00B7CA',
      backgroundColor: chartType === 'bar' ? 'rgba(0, 183, 202, 0.6)' : 'rgba(0, 183, 202, 0.1)',
      borderWidth: chartType === 'bar' ? 0 : 2,
      pointRadius: chartType === 'bar' ? 0 : 2,
      pointHoverRadius: chartType === 'bar' ? 0 : 5,
      tension: 0.3,
      fill: chartType === 'line',
      ...(chartType === 'bar' && {
        barPercentage: 0.9,
        categoryPercentage: 0.9,
        borderRadius: 2,
        borderSkipped: false,
        maxBarThickness: 32,
      }),
    }

    const thresholdDatasets = []
    if (thresholdRange && results.length > 0) {
      const pointCount = results.length
      const baseThresholdDataset = {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderDash: [6, 4],
        pointRadius: 0,
        pointHoverRadius: 0,
        tension: 0,
        fill: false,
        spanGaps: true,
      }

      if (upperThreshold !== null) {
        thresholdDatasets.push({
          ...baseThresholdDataset,
          type: 'line' as const,
          label: `Umbral superior: ${formatThresholdValue(upperThreshold)} ${thresholdUnit}`,
          data: Array<number>(pointCount).fill(upperThreshold),
          borderColor: '#E71D36',
        })
      }

      if (lowerThreshold !== null) {
        thresholdDatasets.push({
          ...baseThresholdDataset,
          type: 'line' as const,
          label: `Umbral inferior: ${formatThresholdValue(lowerThreshold)} ${thresholdUnit}`,
          data: Array<number>(pointCount).fill(lowerThreshold),
          borderColor: '#FF6B35',
        })
      }
    }

    return {
      labels: results.map((r) => formatTimeLabel(r.first_reading, lastBy)),
      datasets: [mainDataset, ...thresholdDatasets],
    }
  }, [data, activeIndicator, lastBy, chartType, isEnergyCategory, thresholdRange, upperThreshold, lowerThreshold, thresholdUnit])

  const yAxisLabel = activeParam
    ? isEnergyCategory
      ? `Consumo de ${activeParam.parameter} (${activeParam.unit})`
      : `${activeParam.parameter} (${activeParam.unit})`
    : activeIndicator

  const options: ChartOptions<'line'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
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
          // No mostrar los umbrales en el tooltip, solo el dato del indicador
          filter: (item) => !(item.dataset.label ?? '').startsWith('Umbral'),
          callbacks: {
            title: (items: TooltipItem<'line'>[]) => {
              const item = items[0]
              const results = data ?? []
              const rawIndex = item?.dataIndex ?? 0
              const raw = results[rawIndex]
              return raw ? formatTooltipTitle(raw.first_reading, lastBy) : ''
            },
            label: (context: TooltipItem<'line'>) => {
              const value = context.raw as number
              const param = getElectricParameter(activeIndicator)
              const label = param?.parameter ?? activeIndicator
              const paramUnit = param?.unit ?? unit
              return `${label}: ${value.toLocaleString('es-PE', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })} ${paramUnit}`
            },
          },
        },
        zoom: {
          limits: {
            x: { min: 'original', max: 'original' },
            y: { min: 'original', max: 'original' },
          },
          zoom: {
            wheel: {
              enabled: true,
            },
            pinch: {
              enabled: true,
            },
            drag: {
              enabled: true,
              backgroundColor: 'rgba(0, 183, 202, 0.12)',
              borderColor: 'rgba(0, 183, 202, 0.5)',
              borderWidth: 1,
            },
            mode: 'x',
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
          },
        },
        y: {
          title: {
            display: true,
            text: yAxisLabel,
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
    [data, activeIndicator, lastBy, unit, yAxisLabel]
  )

  const selectOptions = indicatorOptions.map((ind) => {
    const param = getElectricParameter(ind)
    return {
      value: ind,
      label: param ? `${param.parameter} (${param.unit})` : ind,
    }
  })

  const availableLastByOptions = isEnergyCategory ? ENERGY_LAST_BY_OPTIONS : ALL_LAST_BY_OPTIONS

  const lastByOptions = availableLastByOptions.map((lb) => ({
    value: lb,
    label: LAST_BY_LABELS[lb],
  }))

  return (
    <Card className="flex flex-col h-full min-h-[420px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Tendencia de Indicador</CardTitle>
            <CardDescription>
              Evolución temporal del valor seleccionado
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetZoom}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border bg-card text-text-secondary border-border hover:border-primary/50"
              title="Restablecer zoom"
              aria-label="Restablecer zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                handleResetZoom()
                setChartType((prev) => (prev === 'line' ? 'bar' : 'line'))
              }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
                chartType === 'bar'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-card text-text-secondary border-border hover:border-primary/50'
              )}
              title={chartType === 'line' ? 'Cambiar a barras' : 'Cambiar a líneas'}
            >
              {chartType === 'line' ? (
                <BarChart3 className="h-4 w-4" />
              ) : (
                <LineChart className="h-4 w-4" />
              )}
              {chartType === 'line' ? 'Barras' : 'Línea'}
            </button>
            <div className="min-w-[120px]">
              <ZeiaSelect
                options={selectOptions}
                value={activeIndicator}
                onChange={(val) => {
                  handleResetZoom()
                  onIndicatorChange(val)
                }}
                placeholder="Indicador"
                icon={BarChart3}
              />
            </div>
            <div className="min-w-[120px]">
              <ZeiaSelect
                options={lastByOptions}
                value={lastBy}
                onChange={(val) => {
                  handleResetZoom()
                  setLastBy(val as LastBy)
                }}
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
        ) : !data || data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-text-muted">
            <div className="text-center space-y-2">
              <Activity className="w-12 h-12 mx-auto text-text-muted/40" />
              <p>No hay datos para graficar con el indicador seleccionado</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            {chartType === 'line' ? (
              <Line
                ref={lineChartRef}
                data={chartData as ChartData<'line'>}
                options={options}
                plugins={[thresholdLabelsPlugin]}
              />
            ) : (
              <Bar
                ref={barChartRef}
                data={chartData as ChartData<'bar'>}
                options={options as ChartOptions<'bar'>}
                plugins={[thresholdLabelsPlugin as unknown as Plugin<'bar'>]}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
