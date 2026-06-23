import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { fetchCurrentImbalanced } from '@/features/dashboard/api/current-imbalanced'
import { fetchVoltageImbalanced } from '@/features/dashboard/api/voltage-imbalanced'
import { formatDateISO, formatDateReadable, formatTime } from '@/lib/date-utils'
import type { UnbalancedType } from './unbalanced-counters-graph'

interface ImbalancedEventsTableProps {
  headquarterId: number
  panelId: number
  measurementPointId: number
  dateAfter: Date
  dateBefore: Date
  type: UnbalancedType
}

interface PhaseConfig {
  key: string
  label: string
}

interface TypeConfig {
  title: string
  description: string
  unit: string
  phases: PhaseConfig[]
  fetchFn: typeof fetchCurrentImbalanced
}

const TYPE_CONFIG: Record<UnbalancedType, TypeConfig> = {
  current: {
    title: 'Detalle de eventos desbalanceados',
    description: 'Eventos de desbalance de corriente por fase',
    unit: 'A',
    phases: [
      { key: 'Ia', label: 'Fase A' },
      { key: 'Ib', label: 'Fase B' },
      { key: 'Ic', label: 'Fase C' },
    ],
    fetchFn: fetchCurrentImbalanced,
  },
  voltage: {
    title: 'Detalle de eventos desbalanceados',
    description: 'Eventos de desbalance de voltaje por línea',
    unit: 'V',
    phases: [
      { key: 'Uab', label: 'Línea AB' },
      { key: 'Ubc', label: 'Línea BC' },
      { key: 'Uac', label: 'Línea AC' },
    ],
    fetchFn: fetchVoltageImbalanced,
  },
}

function formatValue(value: number | null | undefined, unit: string): string {
  if (value === null || value === undefined) return '—'
  return `${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`
}

export function ImbalancedEventsTable({
  headquarterId,
  panelId,
  measurementPointId,
  dateAfter,
  dateBefore,
  type,
}: ImbalancedEventsTableProps) {
  const config = TYPE_CONFIG[type]
  const dateAfterStr = formatDateISO(dateAfter) ?? ''
  const dateBeforeStr = formatDateISO(dateBefore) ?? ''
  const [page, setPage] = useState(1)

  const enabled =
    !!headquarterId && !!panelId && !!measurementPointId && !!dateAfterStr && !!dateBeforeStr

  const currentQuery = useQuery({
    queryKey: [
      'current-imbalanced-events',
      headquarterId,
      panelId,
      measurementPointId,
      dateAfterStr,
      dateBeforeStr,
      page,
    ],
    queryFn: () =>
      fetchCurrentImbalanced(
        headquarterId,
        panelId,
        measurementPointId,
        dateAfterStr,
        dateBeforeStr,
        page
      ),
    enabled,
  })

  const voltageQuery = useQuery({
    queryKey: [
      'voltage-imbalanced-events',
      headquarterId,
      panelId,
      measurementPointId,
      dateAfterStr,
      dateBeforeStr,
      page,
    ],
    queryFn: () =>
      fetchVoltageImbalanced(
        headquarterId,
        panelId,
        measurementPointId,
        dateAfterStr,
        dateBeforeStr,
        page
      ),
    enabled,
  })

  const activeQuery = type === 'current' ? currentQuery : voltageQuery
  const data = activeQuery.data
  const isLoading = activeQuery.isLoading
  const error = activeQuery.error

  const events = data?.results ?? []
  const hasPrevious = data?.previous !== null
  const hasNext = data?.next !== null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{config.title}</CardTitle>
        <CardDescription>{config.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-text-muted">Cargando eventos...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center min-h-[200px] text-danger">
            <p>Error al cargar los eventos: {error.message}</p>
          </div>
        ) : events.length === 0 ? (
          <div className="flex items-center justify-center min-h-[200px] text-text-muted">
            <div className="text-center space-y-2">
              <p>No hay eventos desbalanceados para el rango seleccionado</p>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-text-secondary">Hora</th>
                    {config.phases.map((phase) => (
                      <th
                        key={phase.key}
                        className="text-right py-3 px-4 font-medium text-text-secondary"
                      >
                        {phase.label} ({config.unit})
                      </th>
                    ))}
                    <th className="text-right py-3 px-4 font-medium text-text-secondary">
                      % Desbalance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const values = event.values_per_channel[0]?.values ?? {}
                    return (
                      <tr key={event.id} className="border-b border-border hover:bg-muted/50">
                        <td className="py-3 px-4 text-text-primary">
                          {formatDateReadable(event.created_at)}
                        </td>
                        <td className="py-3 px-4 text-text-primary font-mono">
                          {formatTime(event.created_at)}
                        </td>
                        {config.phases.map((phase) => (
                          <td
                            key={phase.key}
                            className="py-3 px-4 text-right text-text-primary font-mono"
                          >
                            {formatValue(values[phase.key], config.unit)}
                          </td>
                        ))}
                        <td className="py-3 px-4 text-right text-text-primary font-mono">
                          {event.cuf_percentage}%
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!hasPrevious}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </Button>
              <span className="text-sm text-muted-foreground">Página {page}</span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={!hasNext}
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
