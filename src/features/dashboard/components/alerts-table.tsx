import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ZeiaSelect } from '@/components/ui/select'
import {
  fetchAlertsLatestBySubtype,
  fetchVoltageFluctuationLatestByPhase,
  fetchPowerDemandLatestBySubtype,
  fetchCurrentMonitoringLatestByPhase,
  fetchHarmonicDistortionLatestByPhase,
  downloadAlertsReport,
  downloadVoltageFluctuationLatestReport,
  downloadPowerDemandLatestReport,
  downloadCurrentMonitoringLatestReport,
  downloadHarmonicDistortionLatestReport,
  type FetchAlertsLatestBySubtypeParams,
  type FetchVoltageFluctuationLatestByPhaseParams,
  type FetchPowerDemandLatestBySubtypeParams,
  type FetchCurrentMonitoringLatestByPhaseParams,
  type FetchHarmonicDistortionLatestByPhaseParams,
} from '@/features/dashboard/api/alerts'
import { cn } from '@/lib/utils'

interface AlertsTableProps {
  measurementPointId: number
}

type Indicator = 'energy' | 'voltage-fluctuation' | 'power-demand' | 'current-monitoring' | 'harmonic-distortion'

const ENERGY_SUBTYPE_OPTIONS = [
  { value: 'overconsumption', label: 'Sobreconsumo' },
  { value: 'undervaluation', label: 'Subvaluación' },
  { value: 'reactive_inductive_exceeded', label: 'Reactiva Inductiva' },
  { value: 'reactive_capacitive_exceeded', label: 'Reactiva Capacitiva' },
] as const

const ENERGY_CATEGORY_OPTIONS = [
  { value: 'active', label: 'Activa' },
  { value: 'reactive', label: 'Reactiva' },
] as const

const FLUCTUATION_SUBTYPE_OPTIONS = [
  { value: 'overvoltage', label: 'Sobretensión' },
  { value: 'undervoltage', label: 'Subtensión' },
  { value: 'zero_voltage', label: 'Voltaje Cero' },
] as const

const POWER_SUBTYPE_OPTIONS = [
  { value: 'max_demand_exceeded', label: 'Máxima Demanda Excedida' },
  { value: 'contracted_power_exceeded', label: 'Potencia Contratada Excedida' },
  { value: 'installed_power_exceeded', label: 'Potencia Instalada Excedida' },
  { value: 'max_reactive_exceeded', label: 'Máxima Reactiva Excedida' },
  { value: 'min_reactive_subceeded', label: 'Mínima Reactiva Subexcedida' },
] as const

const CURRENT_SUBTYPE_OPTIONS = [
  { value: 'max_current_exceeded', label: 'Corriente Máxima Excedida' },
  { value: 'min_current_subceeded', label: 'Corriente Mínima Subexcedida' },
  { value: 'zero_current', label: 'Corriente Cero' },
  { value: 'current_unbalance', label: 'Desbalance de Corriente' },
] as const

const HARMONIC_SUBTYPE_OPTIONS = [
  { value: 'individual_distortion', label: 'Distorsión Individual' },
  { value: 'total_distortion', label: 'Distorsión Total' },
] as const

function formatDate(dateStr: string): string {
  const match = dateStr.match(/(.+?), (\d+) de (.+?) de (\d+)/)
  if (!match) return dateStr

  const [, dayName, day, month] = match
  const months: Record<string, string> = {
    'enero': 'enero',
    'febrero': 'febrero',
    'marzo': 'marzo',
    'abril': 'abril',
    'mayo': 'mayo',
    'junio': 'junio',
    'julio': 'julio',
    'agosto': 'agosto',
    'septiembre': 'septiembre',
    'octubre': 'octubre',
    'noviembre': 'noviembre',
    'diciembre': 'diciembre',
  }

  const monthLower = month.toLowerCase()
  const translatedMonth = months[monthLower] || monthLower

  return `${dayName}, ${day} de ${translatedMonth}`
}

export function AlertsTable({ measurementPointId }: AlertsTableProps) {
  const [indicator, setIndicator] = useState<Indicator>('energy')
  const [energySubtype, setEnergySubtype] = useState<FetchAlertsLatestBySubtypeParams['energySubtype']>()
  const [energyCategory, setEnergyCategory] = useState<FetchAlertsLatestBySubtypeParams['energyCategory']>()
  const [fluctuationSubtype, setFluctuationSubtype] = useState<FetchVoltageFluctuationLatestByPhaseParams['fluctuationSubtype']>()
  const [powerSubtype, setPowerSubtype] = useState<FetchPowerDemandLatestBySubtypeParams['powerSubtype']>()
  const [currentSubtype, setCurrentSubtype] = useState<FetchCurrentMonitoringLatestByPhaseParams['currentSubtype']>()
  const [harmonicSubtype, setHarmonicSubtype] = useState<FetchHarmonicDistortionLatestByPhaseParams['harmonicSubtype']>()
  const [isDownloading, setIsDownloading] = useState(false)
  const router = useRouter()

  const handleIndicatorChange = (next: Indicator) => {
    setIndicator(next)
    setEnergySubtype(undefined)
    setEnergyCategory(undefined)
    setFluctuationSubtype(undefined)
    setPowerSubtype(undefined)
    setCurrentSubtype(undefined)
    setHarmonicSubtype(undefined)
  }

  const handleDownloadExcel = async () => {
    setIsDownloading(true)
    try {
      if (indicator === 'energy') {
        await downloadAlertsReport({ measurementPointId, energySubtype })
      } else if (indicator === 'voltage-fluctuation') {
        await downloadVoltageFluctuationLatestReport({
          measurementPointId,
          fluctuationSubtype,
        })
      } else if (indicator === 'power-demand') {
        await downloadPowerDemandLatestReport({ measurementPointId, powerSubtype })
      } else if (indicator === 'current-monitoring') {
        await downloadCurrentMonitoringLatestReport({ measurementPointId, currentSubtype })
      } else {
        await downloadHarmonicDistortionLatestReport({ measurementPointId, harmonicSubtype })
      }
    } catch (error) {
      console.error('Error al descargar el reporte:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const { data, isLoading } = useQuery({
    queryKey:
      indicator === 'energy'
        ? ['alerts-latest-by-subtype', measurementPointId, energySubtype, energyCategory]
        : indicator === 'voltage-fluctuation'
          ? ['voltage-fluctuation-latest-by-phase', measurementPointId, fluctuationSubtype]
          : indicator === 'power-demand'
            ? ['power-demand-latest-by-subtype', measurementPointId, powerSubtype]
            : indicator === 'current-monitoring'
              ? ['current-monitoring-latest-by-phase', measurementPointId, currentSubtype]
              : ['harmonic-distortion-latest-by-phase', measurementPointId, harmonicSubtype],
    queryFn: () => {
      if (indicator === 'energy') {
        return fetchAlertsLatestBySubtype({
          measurementPointId,
          energySubtype,
          energyCategory,
        })
      }
      if (indicator === 'voltage-fluctuation') {
        return fetchVoltageFluctuationLatestByPhase({
          measurementPointId,
          fluctuationSubtype,
        })
      }
      if (indicator === 'power-demand') {
        return fetchPowerDemandLatestBySubtype({
          measurementPointId,
          powerSubtype,
        })
      }
      if (indicator === 'current-monitoring') {
        return fetchCurrentMonitoringLatestByPhase({
          measurementPointId,
          currentSubtype,
        })
      }
      return fetchHarmonicDistortionLatestByPhase({
        measurementPointId,
        harmonicSubtype,
      })
    },
  })

  const alerts = data?.results ?? []

  const description =
    indicator === 'energy'
      ? 'Historial de alertas por subtipo de energía'
      : indicator === 'voltage-fluctuation'
        ? 'Historial de alertas por tipo de fluctuación de tensión'
        : indicator === 'power-demand'
          ? 'Historial de alertas por subtipo de potencia'
          : indicator === 'current-monitoring'
            ? 'Historial de alertas por subtipo de corriente'
            : 'Historial de alertas por subtipo de distorsión armónica'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle de Alertas</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
          <div className="inline-flex rounded-lg border border-border bg-muted p-1 flex-wrap">
            <button
              onClick={() => handleIndicatorChange('energy')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                indicator === 'energy'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              Energía
            </button>
            <button
              onClick={() => handleIndicatorChange('voltage-fluctuation')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                indicator === 'voltage-fluctuation'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              Voltaje
            </button>
            <button
              onClick={() => handleIndicatorChange('power-demand')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                indicator === 'power-demand'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              Potencia
            </button>
            <button
              onClick={() => handleIndicatorChange('current-monitoring')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                indicator === 'current-monitoring'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              Corriente
            </button>
            <button
              onClick={() => handleIndicatorChange('harmonic-distortion')}
              className={cn(
                'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
                indicator === 'harmonic-distortion'
                  ? 'bg-primary text-white shadow-soft'
                  : 'text-text-secondary hover:text-text-primary'
              )}
            >
              Distorsión
            </button>
          </div>

          <button
            onClick={() => {
              router.navigate({
                to: '/energia/dashboard/alertas-historial',
                search: (prev) => ({
                  sede: prev.sede,
                  panel: prev.panel,
                  punto: prev.punto,
                  desde: prev.desde,
                  hasta: prev.hasta,
                  pagina: '1',
                  subtype: undefined,
                  category: undefined,
                  indicator,
                  phase: undefined,
                }),
              })
            }}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              'bg-primary text-white hover:bg-primary/90'
            )}
          >
            Ver historial de alertas
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
          {indicator === 'energy' && (
            <div className="flex gap-2 flex-wrap">
              {ENERGY_SUBTYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setEnergySubtype(energySubtype === option.value ? undefined : option.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    energySubtype === option.value
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          {indicator === 'voltage-fluctuation' && (
            <div className="flex gap-2">
              {FLUCTUATION_SUBTYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFluctuationSubtype(fluctuationSubtype === option.value ? undefined : option.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    fluctuationSubtype === option.value
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          {indicator === 'power-demand' && (
            <div className="flex gap-2 flex-wrap">
              {POWER_SUBTYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPowerSubtype(powerSubtype === option.value ? undefined : option.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    powerSubtype === option.value
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          {indicator === 'current-monitoring' && (
            <div className="flex gap-2 flex-wrap">
              {CURRENT_SUBTYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setCurrentSubtype(currentSubtype === option.value ? undefined : option.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    currentSubtype === option.value
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
          {indicator === 'harmonic-distortion' && (
            <div className="flex gap-2 flex-wrap">
              {HARMONIC_SUBTYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setHarmonicSubtype(harmonicSubtype === option.value ? undefined : option.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    harmonicSubtype === option.value
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {indicator === 'energy' && (
              <div className="min-w-[200px]">
                <ZeiaSelect
                  options={[
                    { value: '', label: 'Todas las categorías' },
                    ...ENERGY_CATEGORY_OPTIONS.map(opt => ({ value: opt.value, label: opt.label }))
                  ]}
                  value={energyCategory || ''}
                  onChange={(val) => setEnergyCategory(val as FetchAlertsLatestBySubtypeParams['energyCategory'] || undefined)}
                  placeholder="Categoría de energía"
                />
              </div>
            )}

            <button
              onClick={handleDownloadExcel}
              disabled={isDownloading}
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
        </div>

        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-muted">Cargando alertas...</p>
            </div>
          </div>
        ) : alerts.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-text-muted">
            <div className="text-center space-y-2">
              <p>No hay alertas registradas</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Indicador</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Sub Indicador</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Origen</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Fecha</th>
                  <th className="text-left py-3 px-4 font-medium text-text-secondary">Hora</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">Límite</th>
                  <th className="text-right py-3 px-4 font-medium text-text-secondary">Valor</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 text-text-primary">{alert.indicator_name}</td>
                    <td className="py-3 px-4 text-text-primary">{alert.subindicator_name}</td>
                    <td className="py-3 px-4 text-text-primary">{alert.origin}</td>
                    <td className="py-3 px-4 text-text-primary">{formatDate(alert.date)}</td>
                    <td className="py-3 px-4 text-text-primary">{alert.time}</td>
                    <td className="py-3 px-4 text-right text-text-primary">
                      {alert.limit !== null
                        ? alert.limit.toLocaleString('es-PE', { maximumFractionDigits: 2 })
                        : '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-text-primary">
                      {alert.value.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
