import { useQuery } from '@tanstack/react-query'
import { Bell, Activity, Zap, Gauge, Waves } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  fetchAlertsLatestBySubtype,
  fetchVoltageFluctuationLatestByPhase,
  fetchPowerDemandLatestBySubtype,
  fetchCurrentMonitoringLatestByPhase,
  fetchHarmonicDistortionLatestByPhase,
} from '@/features/dashboard/api/alerts'

interface AlertsSummaryProps {
  panelName: string
  measurementPointId: number
}

export function AlertsSummary({ panelName, measurementPointId }: AlertsSummaryProps) {
  const energyQuery = useQuery({
    queryKey: ['alerts-latest-by-subtype', measurementPointId],
    queryFn: () => fetchAlertsLatestBySubtype({ measurementPointId }),
  })

  const voltageQuery = useQuery({
    queryKey: ['voltage-fluctuation-latest-by-phase', measurementPointId],
    queryFn: () => fetchVoltageFluctuationLatestByPhase({ measurementPointId }),
  })

  const powerQuery = useQuery({
    queryKey: ['power-demand-latest-by-subtype', measurementPointId],
    queryFn: () => fetchPowerDemandLatestBySubtype({ measurementPointId }),
  })

  const currentQuery = useQuery({
    queryKey: ['current-monitoring-latest-by-phase', measurementPointId],
    queryFn: () => fetchCurrentMonitoringLatestByPhase({ measurementPointId }),
  })

  const harmonicQuery = useQuery({
    queryKey: ['harmonic-distortion-latest-by-phase', measurementPointId],
    queryFn: () => fetchHarmonicDistortionLatestByPhase({ measurementPointId }),
  })

  const energyIndicatorName = energyQuery.data?.results[0]?.indicator_name ?? 'Indicador'
  const voltageIndicatorName = voltageQuery.data?.results[0]?.indicator_name ?? 'Voltaje'
  const powerIndicatorName = powerQuery.data?.results[0]?.indicator_name ?? 'Potencia'
  const currentIndicatorName = currentQuery.data?.results[0]?.indicator_name ?? 'Corriente'
  const harmonicIndicatorName = harmonicQuery.data?.results[0]?.indicator_name ?? 'Distorsión'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{panelName}</CardTitle>
        <CardDescription>Resumen de alertas del sistema de monitoreo energético</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 justify-items-center">
          <Card className="w-full max-w-xs overflow-hidden">
            <div className="bg-primary text-white px-4 py-2 text-center">
              <span className="text-sm font-semibold uppercase tracking-wider">
                {energyIndicatorName}
              </span>
            </div>
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">Total de alertas del día</span>
              </div>
              {energyQuery.isLoading ? (
                <div className="h-10 w-20 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-4xl font-bold text-text-primary">
                  {energyQuery.data?.today_count ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full max-w-xs overflow-hidden">
            <div className="bg-primary text-white px-4 py-2 text-center">
              <span className="text-sm font-semibold uppercase tracking-wider">
                {voltageIndicatorName}
              </span>
            </div>
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <Activity className="w-4 h-4" />
                <span className="text-sm font-medium">Total de alertas del día</span>
              </div>
              {voltageQuery.isLoading ? (
                <div className="h-10 w-20 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-4xl font-bold text-text-primary">
                  {voltageQuery.data?.today_count ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full max-w-xs overflow-hidden">
            <div className="bg-primary text-white px-4 py-2 text-center">
              <span className="text-sm font-semibold uppercase tracking-wider">
                {powerIndicatorName}
              </span>
            </div>
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Total de alertas del día</span>
              </div>
              {powerQuery.isLoading ? (
                <div className="h-10 w-20 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-4xl font-bold text-text-primary">
                  {powerQuery.data?.today_count ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full max-w-xs overflow-hidden">
            <div className="bg-primary text-white px-4 py-2 text-center">
              <span className="text-sm font-semibold uppercase tracking-wider">
                {currentIndicatorName}
              </span>
            </div>
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <Gauge className="w-4 h-4" />
                <span className="text-sm font-medium">Total de alertas del día</span>
              </div>
              {currentQuery.isLoading ? (
                <div className="h-10 w-20 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-4xl font-bold text-text-primary">
                  {currentQuery.data?.today_count ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="w-full max-w-xs overflow-hidden">
            <div className="bg-primary text-white px-4 py-2 text-center">
              <span className="text-sm font-semibold uppercase tracking-wider">
                {harmonicIndicatorName}
              </span>
            </div>
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              <div className="flex items-center gap-2 text-text-secondary">
                <Waves className="w-4 h-4" />
                <span className="text-sm font-medium">Total de alertas del día</span>
              </div>
              {harmonicQuery.isLoading ? (
                <div className="h-10 w-20 bg-muted rounded animate-pulse" />
              ) : (
                <div className="text-4xl font-bold text-text-primary">
                  {harmonicQuery.data?.today_count ?? 0}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
