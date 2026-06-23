import { useState, useMemo } from 'react'
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
  type TooltipItem,
} from 'chart.js'
import { Activity, BarChart3, Clock, LineChart } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ZeiaSelect } from '@/components/ui/select'
import { fetchReadingsGraph } from '@/features/dashboard/api/readings-graph'
import { formatDateISO, formatDateShort } from '@/lib/date-utils'
import { getElectricParameter } from '@/lib/electric-parameters'
import type { Category } from '@/features/dashboard/hooks/use-home-filters'
import { cn } from '@/lib/utils'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend)

const FALLBACK_INDICATORS = ['P', 'Q']

const LAST_BY_OPTIONS = ['minute', 'hour', 'day', 'week', 'month'] as const
export type LastBy = (typeof LAST_BY_OPTIONS)[number]

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
  const date = new Date(isoString)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  switch (lastBy) {
    case 'minute':
      return `${hours}:${minutes}:${seconds}`
    case 'hour':
      return `${hours}:${minutes}`
    case 'day':
    case 'week':
      return formatDateShort(isoString)
    case 'month':
      return formatDateShort(isoString)
    default:
      return `${hours}:${minutes}:${seconds}`
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
}: ReadingsGraphProps) {
  const indicatorOptions =
    availableIndicators.length > 0 ? availableIndicators : FALLBACK_INDICATORS

  const [lastBy, setLastBy] = useState<LastBy>('minute')
  const [chartType, setChartType] = useState<'line' | 'bar'>('line')

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

  const chartData = useMemo(() => {
    const results = data ?? []
    return {
      labels: results.map((r) => formatTimeLabel(r.first_reading, lastBy)),
      datasets: [
        {
          label: activeIndicator,
          data: results.map((r) => r.first_value),
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
        },
      ],
    }
  }, [data, activeIndicator, lastBy, chartType])

  const unit = data?.[0]?.unit ?? ''
  const activeParam = getElectricParameter(activeIndicator)
  const yAxisLabel = activeParam
    ? `${activeParam.parameter} (${activeParam.unit})`
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

  const lastByOptions = LAST_BY_OPTIONS.map((lb) => ({
    value: lb,
    label: LAST_BY_LABELS[lb],
  }))

  return (
    <Card className="flex flex-col h-full">
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
              onClick={() => setChartType((prev) => (prev === 'line' ? 'bar' : 'line'))}
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
                onChange={(val) => onIndicatorChange(val)}
                placeholder="Indicador"
                icon={BarChart3}
              />
            </div>
            <div className="min-w-[120px]">
              <ZeiaSelect
                options={lastByOptions}
                value={lastBy}
                onChange={(val) => setLastBy(val as LastBy)}
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
              <Line data={chartData as ChartData<'line'>} options={options} />
            ) : (
              <Bar data={chartData as ChartData<'bar'>} options={options as ChartOptions<'bar'>} />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
