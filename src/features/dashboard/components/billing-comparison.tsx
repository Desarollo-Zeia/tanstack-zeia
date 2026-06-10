import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Zap, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ZeiaSelect } from '@/components/ui/select'
import { fetchRateConsumptionDateRange } from '../api/rate-consumption-date-range'
import { formatDateISO } from '@/lib/date-utils'

interface BillingComparisonProps {
  sedeId: number
}

interface MonthOption {
  value: string
  label: string
  year: number
  month: number
}

function getMonthOptions(): MonthOption[] {
  const today = new Date()
  const options: MonthOption[] = []

  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
    const year = date.getFullYear()
    const month = date.getMonth()
    const monthName = date.toLocaleString('es-ES', { month: 'long' })
    options.push({
      value: `${year}-${String(month + 1).padStart(2, '0')}`,
      label: `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${year}`,
      year,
      month,
    })
  }

  return options
}

function getMonthRange(year: number, month: number): { startDate: Date; endDate: Date } {
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 0)
  return { startDate, endDate }
}

function formatMonthRange(monthValue: string): string {
  if (!monthValue || !monthValue.includes('-')) return '—'
  const [year, month] = monthValue.split('-').map(Number)
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 0)
  const startDay = startDate.getDate()
  const endDay = endDate.getDate()
  const startMonth = startDate.toLocaleString('es-ES', { month: 'long' })
  const endMonth = endDate.toLocaleString('es-ES', { month: 'long' })
  return `${startDay} de ${startMonth} — ${endDay} de ${endMonth}`
}

function useBillingData(
  sedeId: number,
  monthValue: string | null
) {
  const dateRange = useMemo(() => {
    if (!monthValue) return { startDate: null, endDate: null }
    const parts = monthValue.split('-')
    if (parts.length !== 2) return { startDate: null, endDate: null }
    const [year, month] = parts.map(Number)
    return getMonthRange(year, month - 1)
  }, [monthValue])

  const dateAfter = formatDateISO(dateRange.startDate)
  const dateBefore = formatDateISO(dateRange.endDate)

  return useQuery({
    queryKey: ['rate-consumption-date-range', sedeId, dateAfter, dateBefore],
    queryFn: () => {
      if (!dateAfter || !dateBefore) {
        throw new Error('Missing date range')
      }
      return fetchRateConsumptionDateRange(sedeId, dateAfter, dateBefore)
    },
    enabled: !!dateAfter && !!dateBefore,
  })
}

interface BillingCardProps {
  title: string
  sedeId: number
  defaultMonthValue: string
}

const MONTH_OPTIONS = getMonthOptions()

function BillingCard({ title, sedeId, defaultMonthValue }: BillingCardProps) {
  const [monthValue, setMonthValue] = useState<string>(defaultMonthValue)

  const { data, isLoading } = useBillingData(sedeId, monthValue)

  const formatNumber = (value: number, unit: string) => {
    return `${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${unit}`
  }

  const selectOptions = MONTH_OPTIONS.map((m) => ({
    value: m.value,
    label: m.label,
  }))

  return (
    <Card>
      <div className="relative bg-primary/10 border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-primary tracking-wide">
          {title}
        </h3>
        <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1">
          <Calendar className="w-3 h-3" />
          <span>{formatMonthRange(monthValue)}</span>
        </div>
        <div className="absolute top-2 right-4 w-40">
          <ZeiaSelect
            options={selectOptions}
            value={monthValue}
            onChange={(val) => setMonthValue(val)}
            placeholder="Seleccionar mes"
          />
        </div>
      </div>

      <CardContent className="p-6 space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
              <div className="h-16 bg-muted rounded-lg animate-pulse" />
              <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
              <div className="h-16 bg-muted rounded-lg animate-pulse" />
            </div>
            <div className="h-8 bg-muted rounded animate-pulse" />
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
              {/* Consumption */}
              <div className="bg-secondary rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Zap className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">
                    Consumo
                  </span>
                </div>
                <div className="text-lg font-bold text-text-primary">
                  {formatNumber(data.consumption.total, data.consumption.unit)}
                </div>
              </div>

              {/* Equals */}
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-lg font-bold text-primary">=</span>
              </div>

              {/* Cost */}
              <div className="bg-danger/5 rounded-lg p-4 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <DollarSign className="w-3.5 h-3.5 text-danger" />
                  <span className="text-[10px] font-medium text-text-secondary uppercase tracking-wide">
                    Costo
                  </span>
                </div>
                <div className="text-lg font-bold text-danger">
                  {formatNumber(data.cost.total, data.cost.unit)}
                </div>
              </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">
                  Punta: {formatNumber(data.consumption.peak, data.consumption.unit)}
                </span>
                <span className="font-medium text-danger">
                  {formatNumber(data.cost.peak, data.cost.unit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-secondary">
                  Fuera de Punta: {formatNumber(data.consumption.off_peak, data.consumption.unit)}
                </span>
                <span className="font-medium text-danger">
                  {formatNumber(data.cost.off_peak, data.cost.unit)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="h-32 flex items-center justify-center text-text-muted text-sm">
            Seleccione un rango de fechas
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DifferenceAlert({
  leftCost,
  rightCost,
}: {
  leftCost: number | undefined
  rightCost: number | undefined
}) {
  const diff = useMemo(() => {
    if (leftCost === undefined || rightCost === undefined) return null
    return rightCost - leftCost
  }, [leftCost, rightCost])

  if (diff === null) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-4 flex items-center justify-center text-text-muted text-sm min-h-[60px]">
          Cargando comparación...
        </CardContent>
      </Card>
    )
  }

  const isIncrease = diff > 0
  const absDiff = Math.abs(diff)

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-2">
          {isIncrease ? (
            <TrendingUp className="w-5 h-5 text-danger" />
          ) : (
            <TrendingDown className="w-5 h-5 text-success" />
          )}
          <span className="text-sm font-semibold">
            {isIncrease ? (
              <>
                <span className="text-danger">Tu consumo se ha excedido en </span>
                <span className="text-danger font-bold">${absDiff.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </>
            ) : (
              <>
                <span className="text-success">Tu consumo se ha reducido en </span>
                <span className="text-success font-bold">${absDiff.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </>
            )}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export function BillingComparison({ sedeId }: BillingComparisonProps) {
  const today = new Date()
  const currentMonthValue = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`
  const prevMonthValue = `${today.getFullYear()}-${String(today.getMonth()).padStart(2, '0')}`

  const { data: leftData } = useBillingData(sedeId, prevMonthValue)
  const { data: rightData } = useBillingData(sedeId, currentMonthValue)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-4 items-stretch">
        <BillingCard
          title="PERIODO ANTERIOR"
          sedeId={sedeId}
          defaultMonthValue={prevMonthValue}
        />

        <div className="flex items-center justify-center py-4 lg:py-0">
          <span className="text-2xl font-black text-text-muted tracking-wider">VS</span>
        </div>

        <BillingCard
          title="PERIODO ACTUAL"
          sedeId={sedeId}
          defaultMonthValue={currentMonthValue}
        />
      </div>

      <DifferenceAlert leftCost={leftData?.cost.total} rightCost={rightData?.cost.total} />
    </div>
  )
}
