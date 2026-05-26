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
} from 'chart.js'
import { Activity, BarChart3, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ZeiaSelect } from '@/components/ui/select'
import { fetchReadingsGraph } from '@/features/dashboard/api/readings-graph'
import { formatDateISO } from '@/lib/date-utils'
import type { Category } from '@/features/dashboard/hooks/use-home-filters'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend)

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
}

function formatTimeLabel(isoString: string): string {
  const date = new Date(isoString)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

export function ReadingsGraph({
  headquarterId,
  panelId,
  measurementPointId,
  dateAfter,
  dateBefore,
  category,
  availableIndicators,
}: ReadingsGraphProps) {
  const indicatorOptions =
    availableIndicators.length > 0 ? availableIndicators : FALLBACK_INDICATORS

  // Track user's explicit selections
  const [userSelectedIndicator, setUserSelectedIndicator] = useState<string | null>(null)
  const [lastBy, setLastBy] = useState<LastBy>('minute')

  // Derive the active indicator during render:
  // if the user-selected indicator is still in the available list, use it;
  // otherwise default to the first available one
  const activeIndicator = userSelectedIndicator && indicatorOptions.includes(userSelectedIndicator)
    ? userSelectedIndicator
    : (indicatorOptions[0] ?? 'P')

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

  const chartData: ChartData<'line'> = useMemo(() => {
    const results = data ?? []
    return {
      labels: results.map((r) => formatTimeLabel(r.first_reading)),
      datasets: [
        {
          label: activeIndicator,
          data: results.map((r) => r.first_value),
          borderColor: '#00B7CA',
          backgroundColor: 'rgba(0, 183, 202, 0.1)',
          borderWidth: 2,
          pointRadius: 2,
          pointHoverRadius: 5,
          tension: 0.3,
          fill: true,
        },
      ],
    }
  }, [data, activeIndicator])

  const unit = data?.[0]?.unit ?? ''

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
              const item = items[0]
              const results = data ?? []
              const rawIndex = item?.dataIndex ?? 0
              const raw = results[rawIndex]
              return raw ? `${formatTimeLabel(raw.first_reading)} — ${raw.first_reading}` : ''
            },
            label: (context) => {
              const value = context.raw as number
              return `${activeIndicator}: ${value.toLocaleString('es-PE', {
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
          },
        },
        y: {
          title: {
            display: true,
            text: unit ? `${activeIndicator} (${unit})` : activeIndicator,
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
    [data, activeIndicator, unit]
  )

  const selectOptions = indicatorOptions.map((ind) => ({
    value: ind,
    label: ind,
  }))

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
            <div className="min-w-[120px]">
              <ZeiaSelect
                options={selectOptions}
                value={activeIndicator}
                onChange={(val) => setUserSelectedIndicator(val)}
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
            <Line data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
