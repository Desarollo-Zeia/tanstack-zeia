import { useMemo } from 'react'
import { Activity, ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { ReadingsResponse } from '@/features/dashboard/types'
import { getElectricParameter } from '@/lib/electric-parameters'

interface ReadingsTableProps {
  data: ReadingsResponse | undefined
  isLoading: boolean
  dateAfter: Date
  dateBefore: Date
  page: number
  onPageChange: (page: number) => void
  indicatorLabel: string
}

const MONTH_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const WEEKDAY_NAMES = [
  'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
]

function formatReadingDate(createdAt: string): { dateLabel: string; timeLabel: string } {
  const date = new Date(createdAt)
  const weekday = WEEKDAY_NAMES[date.getDay()]
  const day = date.getDate()
  const month = MONTH_NAMES[date.getMonth()]

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return {
    dateLabel: `${weekday}, ${day} de ${month}`,
    timeLabel: `${hours}:${minutes}`,
  }
}

function formatDateLong(date: Date): string {
  const weekday = WEEKDAY_NAMES[date.getDay()]
  const day = date.getDate()
  const month = MONTH_NAMES[date.getMonth()]
  return `${weekday}, ${day} de ${month}`
}

export function ReadingsTable({
  data,
  isLoading,
  dateAfter,
  dateBefore,
  page,
  onPageChange,
  indicatorLabel,
}: ReadingsTableProps) {
  const indicatorKeys = useMemo(() => {
    if (!data || data.results.length === 0) return []
    return Object.keys(data.results[0].indicators.values)
  }, [data])

  const hasPrevious = !!data?.previous
  const hasNext = !!data?.next
  const totalCount = data?.count ?? 0

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{indicatorLabel}</CardTitle>
          <CardDescription>
            Cargando datos del punto de monitoreo seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-text-muted">Cargando datos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const results = data?.results ?? []

  if (results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{indicatorLabel}</CardTitle>
          <CardDescription>
            No se encontraron registros para los filtros seleccionados
          </CardDescription>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center text-text-muted">
          <div className="text-center space-y-2">
            <Activity className="w-12 h-12 mx-auto text-text-muted/40" />
            <p>Seleccione los filtros para cargar las registros</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{indicatorLabel}</CardTitle>
        <CardDescription>
          {totalCount} registro{totalCount !== 1 ? 's' : ''} total{totalCount !== 1 ? 'es' : ''} — Página {page} | {formatDateLong(dateAfter)} → {formatDateLong(dateBefore)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-text-secondary whitespace-nowrap">Fecha</th>
                <th className="text-left py-3 px-2 font-medium text-text-secondary whitespace-nowrap">Hora</th>
                {indicatorKeys.map((key) => {
                  const param = getElectricParameter(key)
                  const label = param ? `${param.parameter} (${param.unit})` : key
                  return (
                    <th
                      key={key}
                      className="text-left py-3 px-2 font-medium text-text-secondary whitespace-nowrap"
                    >
                      {label}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {results.map((reading, index) => {
                const { dateLabel, timeLabel } = formatReadingDate(reading.created_at)
                return (
                  <tr
                    key={index}
                    className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <td className="py-3 px-2 font-medium text-text-primary whitespace-nowrap">
                      {dateLabel}
                    </td>
                    <td className="py-3 px-2 text-text-secondary whitespace-nowrap">
                      {timeLabel}
                    </td>
                    {indicatorKeys.map((key) => {
                      const value = reading.indicators.values[key]
                      return (
                        <td
                          key={key}
                          className="py-3 px-2 text-text-secondary whitespace-nowrap font-mono"
                        >
                          {value !== null && value !== undefined
                            ? Number(value).toLocaleString('es-PE', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                            : '—'}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <div className="text-sm text-text-muted">
            Mostrando {results.length} de {totalCount} registros
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onPageChange(page - 1)}
              disabled={!hasPrevious}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary text-text-primary"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
            <span className="text-sm font-medium text-text-primary px-2">
              Página {page}
            </span>
            <button
              type="button"
              onClick={() => onPageChange(page + 1)}
              disabled={!hasNext}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary text-text-primary"
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
