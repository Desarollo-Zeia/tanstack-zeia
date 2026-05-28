import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ZeiaSelect } from '@/components/ui/select'
import { fetchAlertsLatestBySubtype, downloadAlertsReport } from '@/features/dashboard/api/alerts'
import type { FetchAlertsLatestBySubtypeParams } from '@/features/dashboard/api/alerts'
import { cn } from '@/lib/utils'

interface AlertsTableProps {
  measurementPointId: number
}

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
  const [energySubtype, setEnergySubtype] = useState<FetchAlertsLatestBySubtypeParams['energySubtype']>()
  const [energyCategory, setEnergyCategory] = useState<FetchAlertsLatestBySubtypeParams['energyCategory']>()
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadExcel = async () => {
    setIsDownloading(true)
    try {
      await downloadAlertsReport({
        measurementPointId,
        energySubtype,
      })
    } catch (error) {
      console.error('Error al descargar el reporte:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const { data, isLoading } = useQuery({
    queryKey: ['alerts-latest-by-subtype', measurementPointId, energySubtype, energyCategory],
    queryFn: () => fetchAlertsLatestBySubtype({ 
      measurementPointId,
      energySubtype,
      energyCategory,
    }),
  })

  const alerts = data?.results ?? []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalle de Alertas</CardTitle>
        <CardDescription>Historial de alertas por subtipo de energía</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between gap-4 mb-6">
          {/* Toggle de energy_subtype */}
          <div className="flex gap-2">
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

          {/* Select de energy_category y botón de descarga */}
          <div className="flex items-center gap-3">
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
                      {alert.limit.toLocaleString('es-PE', { maximumFractionDigits: 2 })}
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
