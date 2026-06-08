import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Bell, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatDateISO, formatDateShort } from '@/lib/date-utils'
import { useAlertsFilters } from '../hooks/use-alerts-filters'
import { fetchAlerts } from '../api/alerts'
import { downloadAlertsReport } from '../api/alerts-report'
import type { Alert } from '../types'

const LEVEL_STYLES: Record<string, { label: string; bg: string; text: string }> = {
  GOOD: { label: 'Bueno', bg: 'bg-success/10', text: 'text-success' },
  UNHEALTHY: { label: 'No saludable', bg: 'bg-warning/10', text: 'text-warning' },
  DANGEROUS: { label: 'Peligroso', bg: 'bg-danger/10', text: 'text-danger' },
  MODERATE: { label: 'Moderado', bg: 'bg-warning/10', text: 'text-warning' },
  HUMIDITY_MAX: { label: 'Humedad máxima', bg: 'bg-warning/10', text: 'text-warning' },
  TEMP_MAX: { label: 'Temperatura máxima', bg: 'bg-warning/10', text: 'text-warning' },
  TEMP_MIN: { label: 'Temperatura mínima', bg: 'bg-warning/10', text: 'text-warning' },
  CO2_MAX: { label: 'CO₂ máximo', bg: 'bg-warning/10', text: 'text-warning' },
  OFFLINE: { label: 'Desconectado', bg: 'bg-danger/10', text: 'text-danger' },
  DISABLED: { label: 'Deshabilitado', bg: 'bg-muted', text: 'text-text-primary' },
}

function getLevelStyle(level: string) {
  return (
    LEVEL_STYLES[level] ?? {
      label: level,
      bg: 'bg-muted',
      text: 'text-text-primary',
    }
  )
}

const UNIT_LABELS: Record<string, string> = {
  PPM: 'ppm',
  CELSIUS: '°C',
  PERCENT: '%',
  PERCENTAGE: '%',
  MG_M3: 'mg/m³',
  UG_M3: 'μg/m³',
  PA: 'Pa',
  HPA: 'hPa',
  LUX: 'lux',
  DB: 'dB',
  M_S: 'm/s',
  KMH: 'km/h',
  W_M2: 'W/m²',
  V: 'V',
  A: 'A',
  W: 'W',
  KWH: 'kWh',
  MW: 'MW',
  GW: 'GW',
  L: 'L',
  ML: 'mL',
  M3: 'm³',
  CM3: 'cm³',
  G: 'g',
  KG: 'kg',
  MG: 'mg',
  UG: 'μg',
  NG: 'ng',
  M: 'm',
  CM: 'cm',
  MM: 'mm',
  KM: 'km',
  S: 's',
  MIN: 'min',
  H: 'h',
  D: 'd',
  Y: 'a',
  HZ: 'Hz',
  KHZ: 'kHz',
  MHZ: 'MHz',
  GHZ: 'GHz',
  B: 'B',
  KB: 'KB',
  MB: 'MB',
  GB: 'GB',
  TB: 'TB',
  PB: 'PB',
  EB: 'EB',
  ZB: 'ZB',
  YB: 'YB',
  BQ: 'Bq',
  CI: 'Ci',
  GY: 'Gy',
  RAD: 'rad',
  SV: 'Sv',
  REM: 'rem',
  K: 'K',
  DEG: '°',
  RADIAN: 'rad',
  SR: 'sr',
  LM: 'lm',
  CD: 'cd',
  MOL: 'mol',
  AT: 'at',
  BAR: 'bar',
  ATM: 'atm',
  TORR: 'Torr',
  PSI: 'psi',
  MMHG: 'mmHg',
  INHG: 'inHg',
  FT: 'ft',
  IN: 'in',
  YD: 'yd',
  MI: 'mi',
  NMI: 'nmi',
  FT3: 'ft³',
  IN3: 'in³',
  YD3: 'yd³',
  GAL: 'gal',
  QT: 'qt',
  PT: 'pt',
  CUP: 'cup',
  FLOZ: 'fl oz',
  TBSP: 'tbsp',
  TSP: 'tsp',
  LB: 'lb',
  OZ: 'oz',
  ST: 'st',
  GR: 'gr',
  DWT: 'dwt',
  TROY_OZ: 'oz t',
  CARAT: 'ct',
  TON: 't',
  UK_TON: 'UK t',
  US_TON: 'US t',
  C: '°C',
  F: '°F',
  R: '°R',
}

function formatUnit(unit: string): string {
  return UNIT_LABELS[unit.toUpperCase()] ?? unit.toLowerCase()
}

const INDICATOR_OPTIONS = [
  { value: 'CO2', label: 'CO₂', unit: 'PPM' },
  { value: 'TEMPERATURE', label: 'Temperatura', unit: 'CELSIUS' },
  { value: 'HUMIDITY', label: 'Humedad', unit: 'PERCENT' },
]

function AlertRowSkeleton() {
  return (
    <tr className="border-b border-border/50">
      <td className="px-5 py-4">
        <div className="h-4 w-24 bg-muted rounded animate-pulse" />
      </td>
      <td className="px-5 py-4">
        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
      </td>
      <td className="px-5 py-4">
        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
      </td>
      <td className="px-5 py-4">
        <div className="h-4 w-12 bg-muted rounded animate-pulse" />
      </td>
      <td className="px-5 py-4">
        <div className="h-6 w-24 bg-muted rounded animate-pulse" />
      </td>
    </tr>
  )
}

interface AlertRowProps {
  alert: Alert
}

function AlertRow({ alert }: AlertRowProps) {
  const level = getLevelStyle(alert.level)

  return (
    <tr className="border-b border-border/50 hover:bg-primary/5 transition-colors">
      <td className="px-5 py-4 text-sm text-text-primary whitespace-nowrap">
        {formatDateShort(alert.date)}
      </td>
      <td className="px-5 py-4 text-sm text-text-primary whitespace-nowrap">
        {alert.hours}
      </td>
      <td className="px-5 py-4 text-sm text-text-primary font-mono font-semibold whitespace-nowrap">
        {alert.value}
      </td>
      <td className="px-5 py-4 text-sm text-text-secondary whitespace-nowrap">
        {formatUnit(alert.unit)}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
              level.bg,
              level.text
            )}
          >
            {level.label}
          </span>
          {alert.resolved && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-success/10 text-success">
              Resuelto
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

export function AlertsTable() {
  const { roomId, indicador, setIndicator, page, dateAfter, dateBefore, setPage, isReady } = useAlertsFilters()
  const [isDownloading, setIsDownloading] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['ocupacional-alerts', roomId, indicador, dateAfter, dateBefore, page],
    queryFn: () =>
      fetchAlerts({
        roomId: roomId!,
        indicator: indicador!,
        dateAfter: formatDateISO(dateAfter),
        dateBefore: formatDateISO(dateBefore),
        page,
      }),
    enabled: isReady,
  })

  const alerts = data?.results ?? []
  const totalCount = data?.count ?? 0
  const totalPages = Math.max(1, Math.ceil(totalCount / 10))
  const hasPrev = data?.previous !== null && data?.previous !== undefined
  const hasNext = data?.next !== null && data?.next !== undefined

  const handleDownload = async () => {
    if (!dateAfter || !dateBefore) return
    setIsDownloading(true)
    try {
      const dateAfterStr = formatDateISO(dateAfter)!
      const dateBeforeStr = formatDateISO(dateBefore)!
      await downloadAlertsReport(
        dateAfterStr,
        dateBeforeStr,
        `reporte_alertas_${dateAfterStr}_${dateBeforeStr}.xlsx`
      )
    } catch (error) {
      console.error('Error downloading report:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const currentIndicator = INDICATOR_OPTIONS.find((opt) => opt.value === indicador)

  const cardTitle = currentIndicator?.label ?? 'Alertas'

  const cardDescription = isReady
    ? `${totalCount} ${totalCount === 1 ? 'alerta' : 'alertas'} registrada${totalCount !== 1 ? 's' : ''}`
    : 'Seleccione una sala y un indicador para ver las alertas'

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <CardTitle>{cardTitle}</CardTitle>
            <CardDescription>{cardDescription}</CardDescription>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Indicator Toggle */}
            <div className="flex gap-2 flex-wrap">
              {INDICATOR_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setIndicator(option.value)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    indicador === option.value
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {/* Download Excel */}
            <button
              onClick={handleDownload}
              disabled={isDownloading || !isReady}
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
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Fecha
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Hora
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Valor
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Unidad
                  </th>
                  <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <AlertRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-danger mb-3" />
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              Error al cargar alertas
            </h3>
            <p className="text-sm text-text-muted">
              Intente recargar la página o cambie los filtros seleccionados.
            </p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Bell className="w-12 h-12 text-text-muted mb-3" />
            <h3 className="text-lg font-semibold text-text-primary mb-1">
              No hay alertas registradas
            </h3>
            <p className="text-sm text-text-muted">
              No se encontraron alertas para la sala y fechas seleccionadas.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Fecha
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Hora
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Valor
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Unidad
                    </th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert, index) => (
                    <AlertRow key={index} alert={alert} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
              <div className="text-sm text-text-muted">
                Mostrando {alerts.length} de {totalCount} alertas · Página {page} de {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={!hasPrev || page <= 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={!hasNext || page >= totalPages}
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
