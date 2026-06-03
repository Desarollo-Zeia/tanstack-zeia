import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  fetchAlertsHistory,
  fetchVoltageFluctuationHistory,
  fetchPowerDemandHistory,
  fetchCurrentMonitoringHistory,
  fetchHarmonicDistortionHistory,
  downloadAlertsHistoryReport,
  downloadVoltageFluctuationHistoryReport,
  downloadPowerDemandHistoryReport,
  downloadCurrentMonitoringHistoryReport,
  downloadHarmonicDistortionHistoryReport,
} from '../api/alerts'
import { useAlertsHistoryFilters } from '../hooks/use-alerts-history-filters'
import { formatDateISO } from '@/lib/date-utils'
import { ZeiaSelect } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { AlertItem } from '../types'

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

const FLUCTUATION_SUBTYPE_OPTIONS = [
  { value: 'overvoltage', label: 'Sobretensión' },
  { value: 'undervoltage', label: 'Subtensión' },
  { value: 'zero_voltage', label: 'Voltaje Cero' },
]

const PHASE_TYPE_OPTIONS = [
  { value: 'R', label: 'Fase R' },
  { value: 'S', label: 'Fase S' },
  { value: 'T', label: 'Fase T' },
  { value: 'RS', label: 'Fase RS' },
  { value: 'ST', label: 'Fase ST' },
  { value: 'RT', label: 'Fase RT' },
]

const POWER_SUBTYPE_OPTIONS = [
  { value: 'max_demand_exceeded', label: 'Máxima Demanda Excedida' },
  { value: 'contracted_power_exceeded', label: 'Potencia Contratada Excedida' },
  { value: 'installed_power_exceeded', label: 'Potencia Instalada Excedida' },
  { value: 'max_reactive_exceeded', label: 'Máxima Reactiva Excedida' },
  { value: 'min_reactive_subceeded', label: 'Mínima Reactiva Subexcedida' },
]

const CURRENT_SUBTYPE_OPTIONS = [
  { value: 'max_current_exceeded', label: 'Corriente Máxima Excedida' },
  { value: 'min_current_subceeded', label: 'Corriente Mínima Subexcedida' },
  { value: 'zero_current', label: 'Corriente Cero' },
  { value: 'current_unbalance', label: 'Desbalance de Corriente' },
]

const HARMONIC_SUBTYPE_OPTIONS = [
  { value: 'individual_distortion', label: 'Distorsión Individual' },
  { value: 'total_distortion', label: 'Distorsión Total' },
]

const SINGLE_PHASE_OPTIONS = [
  { value: 'A', label: 'Fase A' },
  { value: 'B', label: 'Fase B' },
  { value: 'C', label: 'Fase C' },
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
    indicator,
    phase,
    setPage,
    setSubtype,
    setCategory,
    setPhase,
  } = useAlertsHistoryFilters()

  const isEnergy = indicator === 'energy'
  const isVoltage = indicator === 'voltage-fluctuation'
  const isCurrent = indicator === 'current-monitoring'
  const isHarmonic = indicator === 'harmonic-distortion'
  const hasSinglePhase = isCurrent || isHarmonic

  const dateAfterStr = dateAfter ? formatDateISO(dateAfter) : undefined
  const dateBeforeStr = dateBefore ? formatDateISO(dateBefore) : undefined

  const { data, isLoading } = useQuery({
    queryKey:
      indicator === 'energy'
        ? ['alerts-history', puntoId, dateAfterStr, dateBeforeStr, page, subtype, category]
        : indicator === 'voltage-fluctuation'
          ? ['voltage-fluctuation-history', puntoId, dateAfterStr, dateBeforeStr, page, subtype, phase]
          : indicator === 'current-monitoring'
            ? ['current-monitoring-history', puntoId, dateAfterStr, dateBeforeStr, page, subtype, phase]
            : indicator === 'power-demand'
              ? ['power-demand-history', puntoId, dateAfterStr, dateBeforeStr, page, subtype]
              : ['harmonic-distortion-history', puntoId, dateAfterStr, dateBeforeStr, page, subtype, phase],
    queryFn: () => {
      if (!puntoId) throw new Error('Missing measurement point')
      if (isEnergy) {
        return fetchAlertsHistory({
          measurementPointId: puntoId,
          dateAfter: dateAfterStr,
          dateBefore: dateBeforeStr,
          energySubtype: subtype ? [subtype] : undefined,
          energyCategory: category as 'active' | 'reactive' | undefined,
          page,
        })
      }
      if (isVoltage) {
        return fetchVoltageFluctuationHistory({
          measurementPointId: puntoId,
          dateAfter: dateAfterStr,
          dateBefore: dateBeforeStr,
          fluctuationSubtype: subtype ? [subtype as 'overvoltage' | 'undervoltage' | 'zero_voltage'] : undefined,
          phaseType: phase ? [phase as 'R' | 'S' | 'T' | 'RS' | 'ST' | 'RT'] : undefined,
          page,
        })
      }
      if (isCurrent) {
        return fetchCurrentMonitoringHistory({
          measurementPointId: puntoId,
          dateAfter: dateAfterStr,
          dateBefore: dateBeforeStr,
          currentSubtype: subtype
            ? [subtype as 'max_current_exceeded' | 'min_current_subceeded' | 'zero_current' | 'current_unbalance']
            : undefined,
          currentPhase: phase ? [phase as 'A' | 'B' | 'C'] : undefined,
          page,
        })
      }
      if (isHarmonic) {
        return fetchHarmonicDistortionHistory({
          measurementPointId: puntoId,
          dateAfter: dateAfterStr,
          dateBefore: dateBeforeStr,
          harmonicSubtype: subtype
            ? [subtype as 'individual_distortion' | 'total_distortion']
            : undefined,
          phaseType: phase ? [phase as 'A' | 'B' | 'C'] : undefined,
          page,
        })
      }
      return fetchPowerDemandHistory({
        measurementPointId: puntoId,
        dateAfter: dateAfterStr,
        dateBefore: dateBeforeStr,
        powerSubtype: subtype
          ? [subtype as 'max_demand_exceeded' | 'contracted_power_exceeded' | 'installed_power_exceeded' | 'max_reactive_exceeded' | 'min_reactive_subceeded']
          : undefined,
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
      if (isEnergy) {
        await downloadAlertsHistoryReport({
          measurementPointId: puntoId,
          dateAfter: dateAfterStr,
          dateBefore: dateBeforeStr,
          energySubtype: subtype,
        })
      } else if (isVoltage) {
        await downloadVoltageFluctuationHistoryReport({
          measurementPointId: puntoId,
          dateAfter: dateAfterStr,
          dateBefore: dateBeforeStr,
          fluctuationSubtype: subtype as 'overvoltage' | 'undervoltage' | 'zero_voltage' | undefined,
        })
      } else if (isCurrent) {
        await downloadCurrentMonitoringHistoryReport({
          measurementPointId: puntoId,
          dateAfter: dateAfterStr,
          dateBefore: dateBeforeStr,
          currentSubtype: subtype as 'max_current_exceeded' | 'min_current_subceeded' | 'zero_current' | 'current_unbalance' | undefined,
        })
      } else if (isHarmonic) {
        await downloadHarmonicDistortionHistoryReport({
          measurementPointId: puntoId,
          dateAfter: dateAfterStr,
          dateBefore: dateBeforeStr,
          harmonicSubtype: subtype as 'individual_distortion' | 'total_distortion' | undefined,
        })
      } else {
        await downloadPowerDemandHistoryReport({
          measurementPointId: puntoId,
          dateAfter: dateAfterStr,
          dateBefore: dateBeforeStr,
          powerSubtype: subtype as 'max_demand_exceeded' | 'contracted_power_exceeded' | 'installed_power_exceeded' | 'max_reactive_exceeded' | 'min_reactive_subceeded' | undefined,
        })
      }
    } catch (error) {
      console.error('Error downloading report:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const subtypeOptions = isEnergy
    ? ENERGY_SUBTYPE_OPTIONS
    : isVoltage
      ? FLUCTUATION_SUBTYPE_OPTIONS
      : isCurrent
        ? CURRENT_SUBTYPE_OPTIONS
        : isHarmonic
          ? HARMONIC_SUBTYPE_OPTIONS
          : POWER_SUBTYPE_OPTIONS

  const subtypeLabel = isEnergy
    ? 'Subtipo'
    : isVoltage
      ? 'Tipo de fluctuación'
      : isCurrent
        ? 'Subtipo de corriente'
        : isHarmonic
          ? 'Subtipo de distorsión'
          : 'Subtipo de potencia'
  const subtypePlaceholder = isEnergy
    ? 'Seleccionar subtipo'
    : isVoltage
      ? 'Seleccionar tipo'
      : isCurrent
        ? 'Seleccionar subtipo de corriente'
        : isHarmonic
          ? 'Seleccionar subtipo de distorsión'
          : 'Seleccionar subtipo de potencia'
  const allSubtypesLabel = isEnergy
    ? 'Todos los subtipos'
    : isVoltage
      ? 'Todos los tipos'
      : isCurrent
        ? 'Todos los subtipos de corriente'
        : isHarmonic
          ? 'Todos los subtipos de distorsión'
          : 'Todos los subtipos de potencia'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historial de Alertas</CardTitle>
        <CardDescription>
          Total de alertas: {totalCount} | Página {page} de {totalPages || 1}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex flex-col gap-1.5 min-w-[200px]">
              <label className="label-executive" style={{ color: '#88939b' }}>{subtypeLabel}</label>
              <ZeiaSelect
                value={subtype ?? ''}
                onChange={(value) => setSubtype(value || undefined)}
                options={[
                  { value: '', label: allSubtypesLabel },
                  ...subtypeOptions,
                ]}
                placeholder={subtypePlaceholder}
              />
            </div>
            {isEnergy && (
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
            )}
            {(isVoltage || hasSinglePhase) && (
              <div className="flex flex-col gap-1.5 min-w-[200px]">
                <label className="label-executive" style={{ color: '#88939b' }}>Fase</label>
                <ZeiaSelect
                  value={phase ?? ''}
                  onChange={(value) => setPhase(value || undefined)}
                  options={[
                    { value: '', label: 'Todas las fases' },
                    ...(isVoltage ? PHASE_TYPE_OPTIONS : SINGLE_PHASE_OPTIONS),
                  ]}
                  placeholder="Seleccionar fase"
                />
              </div>
            )}
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
                  {alerts.map((alert: AlertItem) => (
                    <tr key={alert.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-3">{alert.indicator_name}</td>
                      <td className="py-2 px-3">{alert.subindicator_name}</td>
                      <td className="py-2 px-3">{alert.origin}</td>
                      <td className="py-2 px-3">{alert.date}</td>
                      <td className="py-2 px-3">{alert.time}</td>
                      <td className="py-2 px-3 text-right">
                        {alert.limit !== null ? alert.limit.toFixed(2) : '—'}
                      </td>
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
