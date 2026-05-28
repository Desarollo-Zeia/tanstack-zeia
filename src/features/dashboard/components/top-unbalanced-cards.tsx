import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchMostThreeUnbalanced } from '@/features/dashboard/api/most-three-unbalanced'
import { formatDateISO } from '@/lib/date-utils'
import type { TopUnbalancedMeasurementPoint } from '@/features/dashboard/types'

interface TopUnbalancedCardsProps {
  headquarterId: number
  dateAfter: Date
  dateBefore: Date
}

function calculatePercentage(value: number, total: number): string {
  if (total === 0) return '0.00'
  return ((value / total) * 100).toFixed(2)
}

function UnbalancedCard({ point }: { point: TopUnbalancedMeasurementPoint }) {
  const currentPercentage = calculatePercentage(point.current_unbalanced, point.total_readings)
  const voltagePercentage = calculatePercentage(point.voltage_unbalanced, point.total_readings)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-text-secondary leading-tight">
          {point.measurement_point_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-text-muted mb-1">Current</div>
            <div className="text-2xl font-bold text-text-primary font-mono">
              {point.current_unbalanced}
            </div>
            <div className="text-xs text-text-muted">
              {currentPercentage}%
            </div>
          </div>
          <div>
            <div className="text-xs text-text-muted mb-1">Voltage</div>
            <div className="text-2xl font-bold text-text-primary font-mono">
              {point.voltage_unbalanced}
            </div>
            <div className="text-xs text-text-muted">
              {voltagePercentage}%
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function TopUnbalancedCards({
  headquarterId,
  dateAfter,
  dateBefore,
}: TopUnbalancedCardsProps) {
  const dateAfterStr = formatDateISO(dateAfter) ?? ''
  const dateBeforeStr = formatDateISO(dateBefore) ?? ''

  const { data, isLoading, error } = useQuery({
    queryKey: [
      'most-three-unbalanced',
      headquarterId,
      dateAfterStr,
      dateBeforeStr,
    ],
    queryFn: () =>
      fetchMostThreeUnbalanced(headquarterId, dateAfterStr, dateBeforeStr),
    enabled: !!headquarterId && !!dateAfterStr && !!dateBeforeStr,
  })

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="py-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-border rounded w-3/4" />
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-12 bg-border rounded" />
                  <div className="h-12 bg-border rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-danger">
          Error al cargar datos: {error.message}
        </CardContent>
      </Card>
    )
  }

  const points = data?.top_unbalanced_measurement_points ?? []

  if (points.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-text-muted">
          No hay datos de desbalance disponibles
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {points.map((point) => (
        <UnbalancedCard key={point.measurement_point_id} point={point} />
      ))}
    </div>
  )
}
