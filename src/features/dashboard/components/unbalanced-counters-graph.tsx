import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import { Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchUnbalancedCurrentCountersGraph } from '@/features/dashboard/api/unbalanced-current'
import { fetchUnbalancedVoltageCountersGraph } from '@/features/dashboard/api/unbalanced-voltage'
import { formatDateISO, formatDateShort } from '@/lib/date-utils'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend)

export type UnbalancedType = 'current' | 'voltage'

interface UnbalancedCountersGraphProps {
  headquarterId: number
  panelId: number
  measurementPointId: number
  dateAfter: Date
  dateBefore: Date
  type?: UnbalancedType
}

const TYPE_CONFIG: Record<UnbalancedType, { title: string; color: string; fetchFn: typeof fetchUnbalancedCurrentCountersGraph }> = {
  current: {
    title: 'Conteo de Desbalance de Corriente',
    color: '#FF6B35',
    fetchFn: fetchUnbalancedCurrentCountersGraph,
  },
  voltage: {
    title: 'Conteo de Desbalance de Voltaje',
    color: '#E71D36',
    fetchFn: fetchUnbalancedVoltageCountersGraph,
  },
}

function formatDateLabel(dateStr: string): string {
  return formatDateShort(dateStr)
}

export function UnbalancedCountersGraph({
  headquarterId,
  panelId,
  measurementPointId,
  dateAfter,
  dateBefore,
  type = 'current',
}: UnbalancedCountersGraphProps) {
  const config = TYPE_CONFIG[type]
  const dateAfterStr = formatDateISO(dateAfter) ?? ''
  const dateBeforeStr = formatDateISO(dateBefore) ?? ''

  const { data, isLoading } = useQuery({
    queryKey: [
      `unbalanced-${type}-counters`,
      headquarterId,
      panelId,
      measurementPointId,
      dateAfterStr,
      dateBeforeStr,
    ],
    queryFn: () =>
      config.fetchFn(
        headquarterId,
        panelId,
        measurementPointId,
        dateAfterStr,
        dateBeforeStr
      ),
    enabled: !!headquarterId && !!panelId && !!measurementPointId && !!dateAfterStr && !!dateBeforeStr,
  })

  const chartData: ChartData<'bar'> = useMemo(() => {
    const results = data?.[0]?.results ?? []
    return {
      labels: results.map((r) => formatDateLabel(r.date)),
      datasets: [
        {
          label: 'Conteo de Desbalance',
          data: results.map((r) => r.unbalanced_count),
          backgroundColor: config.color,
          borderColor: config.color,
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    }
  }, [data, config.color])

  const options: ChartOptions<'bar'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        datalabels: {
          display: false,
        },
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            title: (items) => {
              const item = items[0]
              const results = data?.[0]?.results ?? []
              const rawIndex = item?.dataIndex ?? 0
              const raw = results[rawIndex]
              if (!raw) return ''
              return formatDateShort(raw.date)
            },
            label: (context) => {
              const value = context.raw as number
              return `Desbalance: ${value} eventos`
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
            text: 'Eventos de Desbalance',
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
            stepSize: 1,
          },
          beginAtZero: true,
        },
      },
    }),
    [data]
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>
          Eventos de desbalance detectados por día
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
        ) : !data || data.length === 0 || !data[0]?.results || data[0].results.length === 0 ? (
          <div className="flex items-center justify-center text-text-muted min-h-[400px]">
            <div className="text-center space-y-2">
              <Activity className="w-12 h-12 mx-auto text-text-muted/40" />
              <p>No hay datos de desbalance para el rango de fechas seleccionado</p>
            </div>
          </div>
        ) : (
          <div className="h-[400px]">
            <Bar data={chartData} options={options} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
