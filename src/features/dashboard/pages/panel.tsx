import { useQuery } from '@tanstack/react-query'
import { Gauge, BarChart3 } from 'lucide-react'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { DashboardFilters } from '@/features/dashboard/components/filters'
import { useDashboardFilters } from '@/features/dashboard/hooks/use-dashboard-filters'
import { fetchConsumptionDistribution } from '@/features/dashboard/api/consumption'
import { ConsumptionPieChart } from '@/features/dashboard/components/consumption-pie-chart'
import { ConsumptionDistributionList } from '@/features/dashboard/components/consumption-distribution-list'
import { MeasurementPointsTable } from '@/features/dashboard/components/measurement-points-table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateISO } from '@/lib/date-utils'

export function PanelPage() {
  const { sedeId, panelId, dateAfter, dateBefore, isReady } = useDashboardFilters()

  const dateAfterStr = dateAfter ? formatDateISO(dateAfter) : ''
  const dateBeforeStr = dateBefore ? formatDateISO(dateBefore) : ''

  const { data: consumptionData, isLoading: isLoadingConsumption } = useQuery({
    queryKey: ['consumption-distribution', sedeId, panelId, dateAfterStr, dateBeforeStr],
    queryFn: () => {
      if (!sedeId || !panelId || !dateAfterStr || !dateBeforeStr) {
        throw new Error('Missing required parameters')
      }
      return fetchConsumptionDistribution(sedeId, panelId, dateAfterStr, dateBeforeStr)
    },
    enabled: isReady,
  })

  const topConsumer = consumptionData?.results
    .filter((r) => !r.is_main)
    .sort((a, b) => b.consumption_kwh - a.consumption_kwh)[0]

  const kpis = [
    {
      title: 'Puntos de Medición',
      value: consumptionData ? String(consumptionData.total_measurement_points) : '—',
      subtitle: 'Dispositivos activos',
      icon: Gauge,
      isLoading: isLoadingConsumption,
    },
    {
      title: topConsumer?.measurement_point_name ?? 'Mayor Consumidor',
      value: topConsumer ? `${topConsumer.consumption_kwh.toLocaleString('es-PE', { maximumFractionDigits: 2 })} kWh` : '—',
      subtitle: topConsumer ? `${topConsumer.consumption_percentage.toFixed(1)}% del total` : '—',
      icon: BarChart3,
      isLoading: isLoadingConsumption,
    },
  ]

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold" style={{ color: '#88939b' }}>Panel Dashboard</h1>
            <p className="text-text-secondary">Vista general del sistema energético</p>
          </div>
          <DashboardFilters />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
          {kpis.map((kpi, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium truncate" style={{ color: '#88939b' }}>
                  {kpi.title}
                </CardTitle>
                <kpi.icon className="h-4 w-4 shrink-0" style={{ color: '#88939b' }} />
              </CardHeader>
              <CardContent>
                {kpi.isLoading ? (
                  <div className="space-y-2">
                    <div className="h-8 w-3/4 bg-muted rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  </div>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-text-primary">
                      {kpi.value}
                    </div>
                    <p className="text-xs text-text-muted">{kpi.subtitle}</p>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {consumptionData
                ? `Distribución de Consumo — ${consumptionData.electrical_panel_name}`
                : 'Resumen'}
            </CardTitle>
            <CardDescription>
              {consumptionData
                ? `${consumptionData.date_range.start_date} → ${consumptionData.date_range.end_date} | ${consumptionData.total_measurement_points} puntos de medición`
                : 'Seleccione sede, panel y fechas para ver los datos'}
            </CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px]">
            {isLoadingConsumption ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-text-muted">Cargando datos...</p>
                </div>
              </div>
            ) : consumptionData ? (
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="flex items-center justify-center">
                  <ConsumptionPieChart
                    results={consumptionData.results}
                    mainConsumptionKwh={consumptionData.main_consumption_kwh}
                  />
                </div>
                <div>
                  <ConsumptionDistributionList
                    results={consumptionData.results}
                    mainConsumptionKwh={consumptionData.main_consumption_kwh}
                  />
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-text-muted">
                <div className="text-center space-y-2">
                  <BarChart3 className="w-12 h-12 mx-auto text-text-muted/40" />
                  <p>Seleccione los filtros para cargar los datos de consumo</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {sedeId && panelId && (
          <MeasurementPointsTable
            headquarterId={sedeId}
            panelId={panelId}
          />
        )}
      </div>
    </DashboardShell>
  )
}
