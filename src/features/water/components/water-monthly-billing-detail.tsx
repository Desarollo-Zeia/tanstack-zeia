import { Droplets, FileText, Waves } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  formatMoney,
  formatWaterCycleRange,
  getWaterChargeDetailLine,
  getWaterCycleLabel,
  getWaterBillingTotals,
} from '../lib/water-billing-format'
import { cn } from '@/lib/utils'
import type { WaterBillingCalculateResponse, WaterBillingCycleItem } from '../types'

interface WaterMonthlyBillingDetailProps {
  selectedCycle: WaterBillingCycleItem | null
  billingData: WaterBillingCalculateResponse | undefined
  isLoadingCalculate: boolean
}

function getChargeIcon(code: string): { Icon: LucideIcon; className: string } {
  if (code.includes('alcantarillado')) {
    return { Icon: Waves, className: 'bg-warning/10 text-warning' }
  }
  if (code.includes('agua') || code.includes('potable')) {
    return { Icon: Droplets, className: 'bg-primary/10 text-primary' }
  }
  return { Icon: FileText, className: 'bg-primary/10 text-primary' }
}

export function WaterMonthlyBillingDetail({
  selectedCycle,
  billingData,
  isLoadingCalculate,
}: WaterMonthlyBillingDetailProps) {
  if (isLoadingCalculate) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="h-5 w-64 animate-pulse rounded bg-muted" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-8 animate-pulse rounded bg-muted" />
            <div className="h-8 animate-pulse rounded bg-muted" />
            <div className="h-8 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!selectedCycle || !billingData) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Droplets className="h-4 w-4 text-primary" />
            Desglose del mes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-24 items-center justify-center text-sm text-text-muted">
            Seleccione un mes de la gráfica para ver su desglose
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Droplets className="h-4 w-4 text-primary" />
            Desglose — {getWaterCycleLabel(selectedCycle)}
          </CardTitle>
          {selectedCycle.is_current && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Mes actual
            </span>
          )}
        </div>
        <p className="text-xs text-text-muted">
          {formatWaterCycleRange(selectedCycle.start_date, selectedCycle.end_date)} ·{' '}
          {billingData.results.length} cargos
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-3">
          {billingData.results.map((item) => {
            const consumption = getWaterChargeDetailLine(item)
            const { Icon, className } = getChargeIcon(item.code)
            return (
              <li
                key={item.code}
                className="flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-colors hover:bg-secondary/30"
              >
                <span
                  className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    className
                  )}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium leading-snug text-text-primary">
                    {item.name}
                  </p>
                  <p className="mt-0.5 font-mono text-xs tabular-nums text-text-muted">
                    {consumption ?? 'Sin tarifa configurada'}
                  </p>
                </div>
                <span className="shrink-0 font-mono text-base font-bold tabular-nums text-text-primary">
                  {formatMoney(item.value, item.currency)}
                </span>
              </li>
            )
          })}
        </ul>

        <div className="space-y-2 rounded-lg bg-danger/5 p-4">
          {getWaterBillingTotals(billingData).map((total, _index, totals) => (
            <div key={total.currency} className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-danger">
                Total{totals.length > 1 ? ` ${total.currency}` : ''}
              </span>
              <span className="font-mono text-lg font-bold tabular-nums text-danger">
                {formatMoney(total.amount, total.currency)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
