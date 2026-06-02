import { useQuery } from '@tanstack/react-query'
import { FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchRateConsumptionCycle } from '../api/rate-consumption-cycle'

interface BillingCycleTableProps {
  sedeId: number
}

function parseCycleDate(dateStr: string): Date {
  const months: Record<string, number> = {
    Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
    Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
  }
  const [day, month, year] = dateStr.split('-')
  return new Date(Number(year), months[month] ?? 0, Number(day))
}

function formatCycleDate(dateStr: string): string {
  const date = parseCycleDate(dateStr)
  const day = date.getDate().toString().padStart(2, '0')
  const month = date.toLocaleString('es-ES', { month: 'long' })
  return `${day} ${month}`
}

export function BillingCycleTable({ sedeId }: BillingCycleTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['rate-consumption-cycle', sedeId],
    queryFn: () => fetchRateConsumptionCycle(sedeId),
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

  const columns = [
    { label: 'Empresa Concesionaria', value: data.energy_provider ?? 'Sin especificar' },
    { label: 'N° de Suministro', value: data.supply_number ?? 'N/A' },
    {
      label: 'Días Facturados',
      value: `${data.ratedays} de ${data.totalratedays} días`,
    },
    {
      label: 'Ciclo de Facturación',
      value: `${formatCycleDate(data.billing_cycle_start)} — ${formatCycleDate(data.billing_cycle_end)}`,
    },
    { label: 'Potencia Contratada', value: `${data.power_contracted} kW` },
    { label: 'Tipo', value: data.electrical_panel_type },
  ]

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="w-4 h-4 text-primary" />
          Ciclo de Facturación
        </CardTitle>
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
