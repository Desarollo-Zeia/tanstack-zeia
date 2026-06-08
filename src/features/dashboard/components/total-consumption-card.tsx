import { useQuery } from '@tanstack/react-query'
import { Calendar, Zap, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { fetchRateConsumption } from '../api/rate-consumption'

interface TotalConsumptionCardProps {
  sedeId: number
}

export function TotalConsumptionCard({ sedeId }: TotalConsumptionCardProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['rate-consumption', sedeId],
    queryFn: () => fetchRateConsumption(sedeId),
    enabled: !!sedeId,
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="overflow-hidden">
          <div className="h-12 bg-primary/10 animate-pulse" />
          <CardContent className="p-6 space-y-4">
            <div className="h-4 w-48 bg-muted rounded animate-pulse" />
            <div className="h-24 bg-muted rounded animate-pulse" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return null
  }

  const formatNumber = (value: number, unit: string) => {
    return `${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="overflow-hidden">
        <div className="relative bg-primary/10 border-b border-border px-6 py-3 text-center">
          <h3 className="text-sm font-semibold text-primary tracking-wide">
            CONSUMO TOTAL DE ENERGÍA
          </h3>
          <div className="flex items-center justify-center gap-1.5 text-xs text-text-muted mt-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {data.date_first_value} — {data.date_last_value}
            </span>
          </div>
        </div>

        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-center gap-8">
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                  Consumo
                </span>
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {formatNumber(data.consumption.total, data.consumption.unit)}
              </div>
            </div>

            <div className="flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">=</span>
              </div>
            </div>

            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
                  Costo
                </span>
                <DollarSign className="w-4 h-4 text-primary" />
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {formatNumber(data.cost.total, data.cost.unit)}
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                Punta: {formatNumber(data.consumption.peak, data.consumption.unit)}
              </span>
              <span className="text-sm font-medium text-danger">
                {formatNumber(data.cost.peak, data.cost.unit)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                Fuera de Punta: {formatNumber(data.consumption.off_peak, data.consumption.unit)}
              </span>
              <span className="text-sm font-medium text-danger">
                {formatNumber(data.cost.off_peak, data.cost.unit)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
