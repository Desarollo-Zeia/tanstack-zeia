import { useQuery } from '@tanstack/react-query'
import { Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchRateConsumptionDetailTariff } from '../api/rate-consumption-detail-tariff'

interface BillingDetailTableProps {
  sedeId: number
}

export function BillingDetailTable({ sedeId }: BillingDetailTableProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['rate-consumption-detail-tariff', sedeId],
    queryFn: () => fetchRateConsumptionDetailTariff(sedeId),
    enabled: !!sedeId,
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-5 w-64 bg-muted rounded animate-pulse" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
            <div className="h-8 bg-muted rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return null
  }

  const formatValue = (value: number) => {
    return value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Receipt className="w-4 h-4 text-primary" />
          Detalle Tarifario
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-primary text-white">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide whitespace-nowrap rounded-tl-lg">
                  {data.billing_data.billing_data_type}
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                  Tarifa
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide whitespace-nowrap">
                  Consumo
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide whitespace-nowrap rounded-tr-lg">
                  Importe
                </th>
              </tr>
            </thead>
            <tbody>
              {data.charges.map((charge, index) => (
                <tr
                  key={index}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3 text-text-primary whitespace-nowrap">
                    {charge.description}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary whitespace-nowrap">
                    {formatValue(charge.cargo.value)} {charge.cargo.unit}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary whitespace-nowrap">
                    {formatValue(charge.consumption.value)} {charge.consumption.unit}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary whitespace-nowrap">
                    {charge.billed.unit} {formatValue(charge.billed.value)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-danger/5">
                <td
                  colSpan={3}
                  className="px-4 py-3 text-right text-sm font-semibold text-danger rounded-bl-lg"
                >
                  Costo total
                </td>
                <td className="px-4 py-3 text-right text-sm font-bold text-danger rounded-br-lg">
                  {data.unit_cost} {formatValue(data.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
