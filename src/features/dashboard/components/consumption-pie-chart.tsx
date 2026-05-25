import { useMemo } from 'react'
import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'
import type { ConsumptionResult } from '../types'

ChartJS.register(ArcElement, Tooltip, Legend)

const PALETTE = [
  '#00B7CA',
  '#2EC4B6',
  '#FF6B35',
  '#E71D36',
  '#5EDFFF',
  '#FF9F43',
  '#A55EEA',
  '#26DE81',
  '#FD79A8',
  '#FDCB6E',
]

function getColor(index: number): string {
  return PALETTE[index % PALETTE.length]
}

interface ConsumptionPieChartProps {
  results: ConsumptionResult[]
  mainConsumptionKwh: number
}

export function ConsumptionPieChart({ results, mainConsumptionKwh }: ConsumptionPieChartProps) {
  const filtered = useMemo(
    () => results.filter((r) => !r.is_main && r.consumption_kwh > 0),
    [results]
  )

  const data: ChartData<'doughnut'> = useMemo(() => {
    return {
      labels: filtered.map((r) => r.measurement_point_name),
      datasets: [
        {
          data: filtered.map((r) => r.consumption_kwh),
          backgroundColor: filtered.map((_, i) => getColor(i)),
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 0,
        },
      ],
    }
  }, [filtered])

  const options: ChartOptions<'doughnut'> = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const raw = context.raw as number
              const total = filtered.reduce((sum, r) => sum + r.consumption_kwh, 0)
              const pct = total > 0 ? ((raw / total) * 100).toFixed(1) : '0.0'
              return `${raw.toLocaleString('es-PE', { maximumFractionDigits: 2 })} kWh (${pct}%)`
            },
          },
        },
      },
    }),
    [filtered]
  )

  if (filtered.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-text-muted text-sm">
        No hay datos de consumo para graficar
      </div>
    )
  }

  return (
    <div className="h-[300px] relative">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xl font-bold text-text-primary">
          {mainConsumptionKwh.toLocaleString('es-PE', { maximumFractionDigits: 2 })} kWh
        </span>
      </div>
    </div>
  )
}
