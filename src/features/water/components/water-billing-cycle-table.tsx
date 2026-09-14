import { useQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchWaterConsumptionCycleDetail } from '../api/water-consumption-cycle-detail'
import { formatDateShort } from '@/lib/date-utils'

interface WaterBillingCycleTableProps {
  sedeId: number
}

export function WaterBillingCycleTable({ sedeId }: WaterBillingCycleTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['water-consumption-cycle-detail', sedeId],
    queryFn: () => fetchWaterConsumptionCycleDetail(sedeId),
    enabled: !!sedeId,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-48 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="h-12 bg-muted rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const hasCycle = data.billing_cycle_start != null && data.billing_cycle_end != null
  const mainPipe = data.water_pipes.find((p) => p.is_main) ?? data.water_pipes[0] ?? null

  const columns = [
    {
      label: 'Factor de Descarga',
      value: data.water_discharge_factor != null ? `${data.water_discharge_factor}` : 'Sin configurar',
    },
    {
      label: 'Días Facturados',
      value:
        data.ratedays != null && data.totalratedays != null
          ? `${data.ratedays} de ${data.totalratedays} días`
          : '—',
    },
    {
      label: 'Ciclo de Facturación',
      value: hasCycle
        ? `${formatDateShort(data.billing_cycle_start as string)} — ${formatDateShort(data.billing_cycle_end as string)}`
        : 'Sin ciclo vigente',
    },
    {
      label: 'Tuberías',
      value:
        data.water_pipes.length > 0
          ? `${data.water_pipes.length} tubería${data.water_pipes.length > 1 ? 's' : ''}${mainPipe ? ` · Principal: ${mainPipe.name}` : ''}`
          : 'Sin tuberías',
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="w-4 h-4 text-primary" />
            Ciclo de Facturación
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.label}
                    className="px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                {columns.map((col) => (
                  <td
                    key={col.label}
                    className="px-4 py-3 text-text-primary whitespace-nowrap"
                  >
                    {col.value}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
