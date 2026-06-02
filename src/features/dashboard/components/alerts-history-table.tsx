import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { fetchAlertsHistory, downloadAlertsHistoryReport } from '../api/alerts'
import { formatDateISO } from '@/lib/date-utils'
import { useAlertsHistoryFilters } from '../hooks/use-alerts-history-filters'
import { ZeiaSelect } from '@/components/ui/select'
import { cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 5

const ENERGY_SUBTYPE_OPTIONS = [
  { value: 'overconsumption', label: 'Sobreconsumo' },
  { value: 'undervaluation', label: 'Subvaluación' },
  { value: 'reactive_inductive_exceeded', label: 'Reactiva Inductiva' },
  { value: 'reactive_capacitive_exceeded', label: 'Reactiva Capacitiva' },
]

const ENERGY_CATEGORY_OPTIONS = [
  { value: 'active', label: 'Activa' },
  { value: 'reactive', label: 'Reactiva' },
]

export function AlertsHistoryTable() {
  const [isDownloading, setIsDownloading] = useState(false)
  const {
    puntoId,
    dateAfter,
    dateBefore,
    page,
    subtype,
    category,
    setPage,
    setSubtype,
    setCategory,
  } = useAlertsHistoryFilters()

  const dateAfterStr = formatDateISO(dateAfter)
  const dateBeforeStr = formatDateISO(dateBefore)

  const { data, isLoading } = useQuery({
    queryKey: ['alerts-history', puntoId, dateAfterStr, dateBeforeStr, page, subtype, category],
    queryFn: () => {
      if (!puntoId) throw new Error('Missing measurement point')
      return fetchAlertsHistory({
        measurementPointId: puntoId,
        dateAfter: dateAfterStr,
        dateBefore: dateBeforeStr,
        energySubtype: subtype ? [subtype] : undefined,
        energyCategory: category as 'active' | 'reactive' | undefined,
        page,
      })
    },
    enabled: !!puntoId && !!dateAfterStr && !!dateBeforeStr,
  })

  const alerts = data?.results ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  const handleDownload = async () => {
    if (!puntoId) return

    setIsDownloading(true)
    try {
      await downloadAlertsHistoryReport({
        measurementPointId: puntoId,
        dateAfter: dateAfterStr,
        dateBefore: dateBeforeStr,
        energySubtype: subtype,
      })
    } catch (error) {
      console.error('Error downloading report:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Alertas</CardTitle>
        <CardDescription>
          Total de alertas: {totalCount} | Página {page} de {totalPages || 1}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="label-executive" style={{ color: '#88939b' }}>Subtipo</label>
              <ZeiaSelect
                value={subtype ?? ''}
                onChange={(value) => setSubtype(value || undefined)}
                options={[
                  { value: '', label: 'Todos los subtipos' },
                  ...ENERGY_SUBTYPE_OPTIONS,
                ]}
                placeholder="Seleccionar subtipo"
              />
            </div>
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="label-executive" style={{ color: '#88939b' }}>Categoría</label>
              <ZeiaSelect
                value={category ?? ''}
                onChange={(value) => setCategory(value || undefined)}
                options={[
                  { value: '', label: 'Todas las categorías' },
                  ...ENERGY_CATEGORY_OPTIONS,
                ]}
                placeholder="Seleccionar categoría"
              />
            </div>
          </div>
          <button
            onClick={handleDownload}
            disabled={isDownloading || !puntoId}
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
            No se encontraron alertas para los filtros seleccionados
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
                  {alerts.map((alert) => (
                    <tr key={alert.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3">{alert.indicator_name}</td>
                      <td className="py-2 px-3">{alert.subindicator_name}</td>
                      <td className="py-2 px-3">{alert.origin}</td>
                      <td className="py-2 px-3">{alert.date}</td>
                      <td className="py-2 px-3">{alert.time}</td>
                      <td className="py-2 px-3 text-right">{alert.limit.toFixed(2)}</td>
                      <td className="py-2 px-3 text-right font-medium">{alert.value.toFixed(2)}</td>
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
