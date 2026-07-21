import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Receipt } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { fetchBillingCalculate } from '../api/billing-calculate'
import { useBillingCycles } from '../hooks/use-billing-cycles'
import {
  CURRENCY_SYMBOLS,
  formatCycleRange,
  formatRate,
  getBillingTotals,
  getChargeDetailLine,
} from '../lib/billing-format'
import { cn } from '@/lib/utils'

interface BillingDetailTableProps {
  sedeId: number
}

function formatImporte(value: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  return `${symbol} ${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function BillingDetailTable({ sedeId }: BillingDetailTableProps) {
  const { data: cyclesData, isLoading: isLoadingCycles } = useBillingCycles(sedeId)

  const currentCycle = useMemo(() => {
    const results = cyclesData?.results ?? []
    if (results.length === 0) return null
    return results.find((cycle) => cycle.is_current) ?? results[0]
  }, [cyclesData])

  const { data, isLoading: isLoadingDetail } = useQuery({
    queryKey: [
      'billing-calculate',
      sedeId,
      currentCycle?.start_date ?? null,
      currentCycle?.end_date ?? null,
    ],
    queryFn: () => {
      if (!currentCycle) {
        throw new Error('Missing billing cycle')
      }
      return fetchBillingCalculate(sedeId, currentCycle.start_date, currentCycle.end_date)
    },
    enabled: !!currentCycle,
  })

  const isLoading = isLoadingCycles || (currentCycle !== null && isLoadingDetail)

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

  if (!currentCycle || !data) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Receipt className="w-4 h-4 text-primary" />
            Detalle Tarifario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 items-center justify-center text-sm text-text-muted">
            No hay un ciclo de facturación activo para esta sede
          </div>
        </CardContent>
      </Card>
    )
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
                  {formatCycleRange(currentCycle.start_date, currentCycle.end_date)}
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
              {data.results.map((item) => (
                <tr
                  key={item.code}
                  className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                >
                  <td className="px-4 py-3 text-text-primary whitespace-nowrap">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary whitespace-nowrap">
                    {formatRate(item.details) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary whitespace-nowrap">
                    {getChargeDetailLine(item) ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right text-text-secondary whitespace-nowrap">
                    {formatImporte(item.value, item.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {getBillingTotals(data).map((total, index, totals) => {
                const isLast = index === totals.length - 1
                return (
                  <tr key={total.currency} className="bg-danger/5">
                    <td
                      colSpan={3}
                      className={cn(
                        'px-4 py-3 text-right text-sm font-semibold text-danger',
                        isLast && 'rounded-bl-lg'
                      )}
                    >
                      Costo total{totals.length > 1 ? ` ${total.currency}` : ''}
                    </td>
                    <td
                      className={cn(
                        'px-4 py-3 text-right text-sm font-bold text-danger',
                        isLast && 'rounded-br-lg'
                      )}
                    >
                      {formatImporte(total.amount, total.currency)}
                    </td>
                  </tr>
                )
              })}
            </tfoot>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
