import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  fetchCurrentMonitoringHistory,
  downloadCurrentMonitoringHistoryReport,
  type CurrentPhase,
} from '@/features/dashboard/api/alerts'
import { formatDateISO } from '@/lib/date-utils'
import { ZeiaSelect } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { AlertItem } from '@/features/dashboard/types'

const ITEMS_PER_PAGE = 5

const PHASE_OPTIONS = [
  { value: '', label: 'Todas las fases' },
  { value: 'A', label: 'Fase A' },
  { value: 'B', label: 'Fase B' },
  { value: 'C', label: 'Fase C' },
] as const

function formatDate(dateStr: string): string {
  const match = dateStr.match(/(.+?), (\d+) de (.+?) de (\d+)/)
  if (!match) return dateStr
  const [, dayName, day, month] = match
  return `${dayName}, ${day} de ${month}`
}

interface DesbalanceAlertsHistoryProps {
  measurementPointId: number
  dateAfter: Date
  dateBefore: Date
}

export function DesbalanceAlertsHistory({
  measurementPointId,
  dateAfter,
  dateBefore,
}: DesbalanceAlertsHistoryProps) {
  const [page, setPage] = useState(1)
  const [phase, setPhase] = useState<CurrentPhase | undefined>(undefined)
  const [isDownloading, setIsDownloading] = useState(false)

  const dateAfterStr = formatDateISO(dateAfter) ?? ''
  const dateBeforeStr = formatDateISO(dateBefore) ?? ''

  const { data, isLoading } = useQuery({
    queryKey: [
      'desbalance-alerts-history',
      measurementPointId,
      dateAfterStr,
      dateBeforeStr,
      page,
      phase,
    ],
    queryFn: () =>
      fetchCurrentMonitoringHistory({
        measurementPointId,
        dateAfter: dateAfterStr,
        dateBefore: dateBeforeStr,
        currentSubtype: ['current_unbalance'],
        currentPhase: phase ? [phase] : undefined,
        page,
      }),
    enabled: !!measurementPointId && !!dateAfterStr && !!dateBeforeStr,
  })

  const alerts = data?.results ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const handleDownload = async () => {
    if (!measurementPointId) return
    setIsDownloading(true)
    try {
      await downloadCurrentMonitoringHistoryReport({
        measurementPointId,
        dateAfter: dateAfterStr,
        dateBefore: dateBeforeStr,
        currentSubtype: 'current_unbalance',
        currentPhase: phase,
      })
    } catch (error) {
      console.error('Error al descargar el reporte:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Alertas de Desbalance</CardTitle>
        <CardDescription>
          Total de alertas: {totalCount} | Página {page} de {totalPages || 1}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex flex-col gap-1.5 min-w-[200px]">
            <label className="label-executive" style={{ color: '#88939b' }}>Fase</label>
            <ZeiaSelect
              value={phase ?? ''}
              onChange={(value) => setPhase((value || undefined) as CurrentPhase | undefined)}
              options={[...PHASE_OPTIONS]}
              placeholder="Seleccionar fase"
            />
          </div>
          <button
            onClick={handleDownload}
            disabled={isDownloading || !measurementPointId}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              'bg-green-600 text-white hover:bg-green-700',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <img src="/excel.png" alt="Excel" className="w-4 h-4" />
            {isDownloading ? 'Descargando...' : 'Descargar Excel'}
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No se encontraron alertas de desbalance para los filtros seleccionados
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium">Indicador</th>
                    <th className="text-left py-2 px-3 font-medium">Sub Indicador</th>
                    <th className="text-left py-2 px-3 font-medium">Origen</th>
                    <th className="text-left py-2 px-3 font-medium">Fecha</th>
                    <th className="text-left py-2 px-3 font-medium">Hora</th>
                    <th className="text-right py-2 px-3 font-medium">Límite</th>
                    <th className="text-right py-2 px-3 font-medium">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert: AlertItem) => (
                    <tr key={alert.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3">{alert.indicator_name}</td>
                      <td className="py-2 px-3">{alert.subindicator_name}</td>
                      <td className="py-2 px-3">{alert.origin}</td>
                      <td className="py-2 px-3">{formatDate(alert.date)}</td>
                      <td className="py-2 px-3">{alert.time}</td>
                      <td className="py-2 px-3 text-right">
                        {alert.limit !== null ? alert.limit.toFixed(2) : '—'}
                      </td>
                      <td className="py-2 px-3 text-right font-medium">
                        {alert.value.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">
                Página {page} de {totalPages || 1}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
