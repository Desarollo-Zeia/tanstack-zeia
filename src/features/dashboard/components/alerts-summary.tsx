import { useQuery } from '@tanstack/react-query'
import { Bell } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchAlertsLatestBySubtype } from '@/features/dashboard/api/alerts'

interface AlertsSummaryProps {
  panelName: string
  measurementPointId: number
}

export function AlertsSummary({ panelName, measurementPointId }: AlertsSummaryProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['alerts-latest-by-subtype', measurementPointId],
    queryFn: () => fetchAlertsLatestBySubtype({ measurementPointId }),
  })

  const indicatorName = data?.results[0]?.indicator_name ?? 'Indicador'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{panelName}</CardTitle>
        <CardDescription>Resumen de alertas del sistema de monitoreo energético</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <Card className="w-full max-w-xs overflow-hidden">
            <div className="bg-primary text-white px-4 py-2 text-center">
              <span className="text-sm font-semibold uppercase tracking-wider">
                {indicatorName}
              </span>
            </div>
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">Total de alertas del día</span>
              </div>
              {isLoading ? (
                <div className="h-10 w-20 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-4xl font-bold text-text-primary">
                  {data?.today_count ?? 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
