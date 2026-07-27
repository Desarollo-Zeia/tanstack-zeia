import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { DashboardShell } from '@/features/dashboard/components/shell'
import { HomeFilters } from '@/features/dashboard/components/home-filters'
import { ReadingsTable } from '@/features/dashboard/components/readings-table'
import { ReadingsGraph } from '@/features/dashboard/components/readings-graph'
import { useHomeFilters } from '@/features/dashboard/hooks/use-home-filters'
import { fetchReadings } from '@/features/dashboard/api/readings'
import { downloadReadingsReport } from '@/features/dashboard/api/download-report'
import { findFirstIndicatorWithData } from '@/features/dashboard/utils/indicators'
import { formatDateISO } from '@/lib/date-utils'
import { getElectricParameter } from '@/lib/electric-parameters'

export const Route = createFileRoute('/energia/dashboard/home')({
  component: HomeDashboardPage,
  validateSearch: (search) => {
    return {
      sede: typeof search.sede === 'string' ? search.sede : undefined,
      panel: typeof search.panel === 'string' ? search.panel : undefined,
      punto: typeof search.punto === 'string' ? search.punto : undefined,
      categoria: typeof search.categoria === 'string' ? search.categoria : undefined,
      pagina: typeof search.pagina === 'string' ? search.pagina : undefined,
      desde: typeof search.desde === 'string' ? search.desde : undefined,
      hasta: typeof search.hasta === 'string' ? search.hasta : undefined,
    }
  },
})

function HomeDashboardPage() {
  const {
    sedeId,
    panelId,
    puntoId,
    category,
    page,
    dateAfter,
    dateBefore,
    isReady,
    setPage,
    measurementPoints,
  } = useHomeFilters()

  const dateAfterStr = formatDateISO(dateAfter) ?? ''
  const dateBeforeStr = formatDateISO(dateBefore) ?? ''

  const { data: readingsData, isLoading: isLoadingReadings } = useQuery({
    queryKey: ['readings', sedeId, panelId, puntoId, dateAfterStr, dateBeforeStr, category, page],
    queryFn: () => {
      if (!sedeId || !panelId || !puntoId || !dateAfterStr || !dateBeforeStr || !category) {
        throw new Error('Missing required parameters')
      }
      return fetchReadings(sedeId, panelId, puntoId, dateAfterStr, dateBeforeStr, category, page)
    },
    enabled: isReady,
  })

  const indicatorKeys =
    readingsData && readingsData.results.length > 0
      ? Object.keys(readingsData.results[0].indicators.values)
      : []

  const [activeIndicator, setActiveIndicator] = useState<string | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)

  // Si el primer indicador no tiene datos, caer al primero que sí tenga
  // para no mostrar el estado vacío por defecto
  const firstIndicatorWithData = readingsData
    ? findFirstIndicatorWithData(indicatorKeys, readingsData.results)
    : null

  const resolvedIndicator =
    activeIndicator && indicatorKeys.includes(activeIndicator)
      ? activeIndicator
      : (firstIndicatorWithData ?? indicatorKeys[0] ?? 'P')

  const indicatorLabel = getElectricParameter(resolvedIndicator)?.parameter ?? resolvedIndicator

  const currentMeasurementPoint = measurementPoints.find((p) => p.id === puntoId) ?? null

  const handleDownloadExcel = async () => {
    if (!sedeId || !panelId || !dateAfterStr || !dateBeforeStr) return
    setIsDownloading(true)
    try {
      await downloadReadingsReport({
        headquarterId: sedeId,
        panelId,
        dateAfter: dateAfterStr,
        dateBefore: dateBeforeStr,
      })
    } catch (error) {
      console.error('Error downloading report:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Análisis por Indicador</h1>
            <p className="text-text-secondary">Métricas e indicadores de rendimiento energético</p>
          </div>
          <HomeFilters
            onDownloadExcel={handleDownloadExcel}
            isDownloadingExcel={isDownloading}
            canDownload={isReady}
          />
        </div>

        {isReady && sedeId && panelId && puntoId && dateAfter && dateBefore && category ? (
          <div className="space-y-6">
            <ReadingsGraph
              key={category}
              headquarterId={sedeId}
              panelId={panelId}
              measurementPointId={puntoId}
              dateAfter={dateAfter}
              dateBefore={dateBefore}
              category={category}
              availableIndicators={indicatorKeys}
              activeIndicator={resolvedIndicator}
              onIndicatorChange={setActiveIndicator}
              thresholds={currentMeasurementPoint?.thresholds ?? null}
            />
            <ReadingsTable
              data={readingsData}
              isLoading={isLoadingReadings}
              dateAfter={dateAfter}
              dateBefore={dateBefore}
              page={page}
              onPageChange={setPage}
              indicatorLabel={indicatorLabel}
            />
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card p-12 flex items-center justify-center text-text-muted min-h-[300px]">
            <div className="text-center space-y-2">
              <p>Seleccione sede, panel, punto de monitoreo, categoría y fechas para ver las lecturas</p>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  )
}
