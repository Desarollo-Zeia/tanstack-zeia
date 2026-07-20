import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Zap,
  Gauge,
  Receipt,
  FileText,
  Calendar,
  Info,
  TrendingUp,
  TrendingDown,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { ZeiaSelect } from '@/components/ui/select'
import { fetchBillingCalculate } from '../api/billing-calculate'
import { useBillingCycles } from '../hooks/use-billing-cycles'
import type { BillingCalculateResponse, BillingCycleItem } from '../types'
import {
  formatMoney,
  getChargeDetailLine,
  formatCycleRange,
  getCycleLabel,
} from '../lib/billing-format'
import { cn } from '@/lib/utils'

interface BillingComparisonProps {
  sedeId: number
}

interface ChargeStyle {
  bar: string
  iconBg: string
  Icon: LucideIcon
}

const CHARGE_STYLES: Record<string, ChargeStyle> = {
  cargo_fijo_mensual: { bar: 'bg-text-muted', iconBg: 'bg-text-muted', Icon: Receipt },
  energia_activa_horas_punta: { bar: 'bg-foreground', iconBg: 'bg-foreground', Icon: Zap },
  energia_activa_horas_fuera_punta: { bar: 'bg-primary', iconBg: 'bg-primary', Icon: Zap },
  potencia_activa_generacion_punta: {
    bar: 'bg-text-secondary',
    iconBg: 'bg-text-secondary',
    Icon: Gauge,
  },
}

// Colores extra para codigos de cargo no mapeados (evitan repetir colores en la misma tarjeta)
const EXTRA_COLORS = ['bg-warning', 'bg-success', 'bg-danger', 'bg-text-muted', 'bg-primary-hover']

const FALLBACK_CHARGE_STYLE: ChargeStyle = {
  bar: 'bg-border',
  iconBg: 'bg-border',
  Icon: FileText,
}

function getEnergyConsumption(data: BillingCalculateResponse | undefined): number {
  if (!data) return 0
  return data.results.reduce((sum, item) => {
    if (item.details && 'consumption' in item.details) {
      return sum + item.details.consumption
    }
    return sum
  }, 0)
}

function useBillingCalculateData(sedeId: number, cycle: BillingCycleItem | null) {
  const startDate = cycle?.start_date ?? null
  const endDate = cycle?.end_date ?? null

  return useQuery({
    queryKey: ['billing-calculate', sedeId, startDate, endDate],
    queryFn: () => {
      if (!startDate || !endDate) {
        throw new Error('Missing billing cycle')
      }
      return fetchBillingCalculate(sedeId, startDate, endDate)
    },
    enabled: !!startDate && !!endDate,
  })
}

interface BillingCardProps {
  cycles: BillingCycleItem[]
  selectedCycle: BillingCycleItem | null
  onCycleChange: (cycleId: string) => void
  data: BillingCalculateResponse | undefined
  isLoading: boolean
}

function BillingCardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2 text-center">
        <div className="mx-auto h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="mx-auto h-9 w-44 animate-pulse rounded bg-muted" />
      </div>
      <div className="h-4 w-full animate-pulse rounded-full bg-muted" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
              <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
            </div>
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

function BillingCard({
  cycles,
  selectedCycle,
  onCycleChange,
  data,
  isLoading,
}: BillingCardProps) {
  const [hoveredCode, setHoveredCode] = useState<string | null>(null)

  const selectOptions = cycles.map((cycle) => ({
    value: String(cycle.id),
    label: getCycleLabel(cycle),
  }))

  // Asigna un color unico por cargo: color fijo si el codigo es conocido,
  // color extra (no repetido en la tarjeta) para codigos desconocidos
  const itemStyles = useMemo(() => {
    const map = new Map<string, ChargeStyle>()
    if (!data) return map
    const usedColors = new Set(
      data.results
        .map((item) => CHARGE_STYLES[item.code]?.bar)
        .filter((color): color is string => Boolean(color))
    )
    const extraPool = EXTRA_COLORS.filter((color) => !usedColors.has(color))
    let extraIndex = 0
    for (const item of data.results) {
      const known = CHARGE_STYLES[item.code]
      if (known) {
        map.set(item.code, known)
        continue
      }
      const pool = extraPool.length > 0 ? extraPool : EXTRA_COLORS
      const color = pool[extraIndex % pool.length]
      extraIndex++
      map.set(item.code, { bar: color, iconBg: color, Icon: FileText })
    }
    return map
  }, [data])

  const segments = useMemo(() => {
    if (!data || data.total_amount <= 0) return []
    return data.results.map((item) => ({
      code: item.code,
      pct: (item.value / data.total_amount) * 100,
      color: itemStyles.get(item.code)?.bar ?? FALLBACK_CHARGE_STYLE.bar,
    }))
  }, [data, itemStyles])

  return (
    <Card>
      <div className="flex items-start justify-between gap-3 border-b border-border bg-primary/10 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold tracking-wide text-primary">
            Ciclo de facturación
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-text-muted">
            <Calendar className="h-3 w-3" />
            <span>
              {selectedCycle
                ? formatCycleRange(selectedCycle.start_date, selectedCycle.end_date)
                : '—'}
            </span>
          </div>
        </div>
        <div className="w-36 shrink-0">
          <ZeiaSelect
            options={selectOptions}
            value={selectedCycle ? String(selectedCycle.id) : ''}
            onChange={(val) => onCycleChange(val)}
            placeholder="Seleccionar ciclo"
          />
        </div>
      </div>

      <CardContent className="space-y-5 p-6">
        {isLoading ? (
          <BillingCardSkeleton />
        ) : data ? (
          <>
            {/* Costo total */}
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
                Costo total
              </p>
              <p className="mt-1 font-mono text-3xl font-bold text-primary">
                {formatMoney(data.total_amount, data.currency)}
              </p>
            </div>

            {/* Distribución de cargos */}
            <div>
              <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
                <span className="font-medium">Distribución de cargos</span>
                <span>% Facturado</span>
              </div>
              <div className="flex h-4 w-full overflow-hidden rounded-full bg-muted">
                {segments.map((segment) => (
                  <div
                    key={segment.code}
                    onMouseEnter={() => setHoveredCode(segment.code)}
                    onMouseLeave={() => setHoveredCode(null)}
                    className={cn(
                      'flex h-full cursor-pointer items-center justify-center transition-all duration-300',
                      segment.color,
                      hoveredCode !== null &&
                        hoveredCode !== segment.code &&
                        'opacity-30',
                      hoveredCode === segment.code && 'brightness-110 saturate-150'
                    )}
                    style={{ width: `${segment.pct}%` }}
                  >
                    {segment.pct >= 5 && (
                      <span className="text-[10px] font-semibold text-white">
                        {Math.round(segment.pct)}%
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Lista de cargos */}
            <ul className="space-y-3">
              {data.results.map((item) => {
                const style = itemStyles.get(item.code) ?? FALLBACK_CHARGE_STYLE
                const detailLine = getChargeDetailLine(item)
                const isHovered = hoveredCode === item.code
                return (
                  <li
                    key={item.code}
                    onMouseEnter={() => setHoveredCode(item.code)}
                    onMouseLeave={() => setHoveredCode(null)}
                    className={cn(
                      '-mx-2 flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 transition-all duration-300',
                      isHovered && 'scale-[1.02] bg-primary/10 shadow-soft'
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-300',
                        style.iconBg,
                        isHovered && 'scale-110'
                      )}
                    >
                      <style.Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate text-sm font-medium transition-colors duration-300',
                          isHovered ? 'text-primary-hover' : 'text-text-primary'
                        )}
                      >
                        {item.name}
                      </p>
                      {detailLine && <p className="text-xs text-text-muted">{detailLine}</p>}
                    </div>
                    <span
                      className={cn(
                        'font-mono text-sm font-semibold transition-colors duration-300',
                        isHovered ? 'text-primary-hover' : 'text-text-primary'
                      )}
                    >
                      {formatMoney(item.value, item.currency)}
                    </span>
                  </li>
                )
              })}
            </ul>
          </>
        ) : (
          <div className="flex h-32 items-center justify-center text-sm text-text-muted">
            No hay datos disponibles para este ciclo
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface SavingsBannerProps {
  leftData: BillingCalculateResponse | undefined
  rightData: BillingCalculateResponse | undefined
  leftCycle: BillingCycleItem | null
  rightCycle: BillingCycleItem | null
  isLoading: boolean
  hasCycles: boolean
}

function SavingsBanner({
  leftData,
  rightData,
  leftCycle,
  rightCycle,
  isLoading,
  hasCycles,
}: SavingsBannerProps) {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex min-h-[72px] items-center justify-center p-4 text-sm text-text-muted">
          Cargando comparación...
        </CardContent>
      </Card>
    )
  }

  if (!hasCycles || !leftData || !rightData || !leftCycle || !rightCycle) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex min-h-[72px] items-center justify-center p-4 text-sm text-text-muted">
          No hay ciclos de facturación disponibles para comparar
        </CardContent>
      </Card>
    )
  }

  const costDiff = leftData.total_amount - rightData.total_amount
  const isSaving = costDiff >= 0
  const formattedDiff = formatMoney(Math.abs(costDiff), rightData.currency)

  const leftConsumption = getEnergyConsumption(leftData)
  const rightConsumption = getEnergyConsumption(rightData)
  const consumptionPct =
    leftConsumption > 0
      ? ((leftConsumption - rightConsumption) / leftConsumption) * 100
      : null

  const TrendIcon = isSaving ? TrendingDown : TrendingUp

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between',
        isSaving ? 'border-primary/20 bg-primary/10' : 'border-danger/20 bg-danger/5'
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white',
            isSaving ? 'bg-primary' : 'bg-danger'
          )}
        >
          <TrendIcon className="h-5 w-5" />
        </span>
        <div>
          <p
            className={cn(
              'text-sm font-semibold',
              isSaving ? 'text-primary' : 'text-danger'
            )}
          >
            {isSaving ? 'Ahorro registrado: ' : 'Incremento registrado: '}
            <span className="font-mono font-bold">{formattedDiff}</span>
          </p>
          <p className="text-xs text-text-muted">
            Comparando {getCycleLabel(leftCycle)} - {getCycleLabel(rightCycle)}
          </p>
        </div>
      </div>

      {consumptionPct !== null && (
        <div className="flex items-center gap-2">
          <Info className={cn('h-4 w-4', isSaving ? 'text-primary' : 'text-danger')} />
          <p className="text-sm text-text-secondary">
            Su consumo ha {consumptionPct >= 0 ? 'disminuido' : 'aumentado'} un{' '}
            <span
              className={cn(
                'font-mono font-semibold',
                isSaving ? 'text-primary' : 'text-danger'
              )}
            >
              {Math.abs(consumptionPct).toFixed(1)} %
            </span>
          </p>
        </div>
      )}
    </div>
  )
}

export function BillingComparison({ sedeId }: BillingComparisonProps) {
  const { data: cyclesData, isLoading: isLoadingCycles } = useBillingCycles(sedeId)

  const cycles = useMemo(() => {
    const results = cyclesData?.results ?? []
    return [...results].sort((a, b) => b.start_date.localeCompare(a.start_date))
  }, [cyclesData])

  const defaultRightCycle = useMemo(
    () => cycles.find((cycle) => cycle.is_current) ?? cycles[0] ?? null,
    [cycles]
  )

  const defaultLeftCycle = useMemo(() => {
    if (!defaultRightCycle) return null
    const index = cycles.findIndex((cycle) => cycle.id === defaultRightCycle.id)
    return cycles[index + 1] ?? defaultRightCycle
  }, [cycles, defaultRightCycle])

  const [leftCycleId, setLeftCycleId] = useState<string | null>(null)
  const [rightCycleId, setRightCycleId] = useState<string | null>(null)

  const leftCycle = useMemo(() => {
    const found = leftCycleId
      ? cycles.find((cycle) => String(cycle.id) === leftCycleId)
      : null
    return found ?? defaultLeftCycle
  }, [leftCycleId, cycles, defaultLeftCycle])

  const rightCycle = useMemo(() => {
    const found = rightCycleId
      ? cycles.find((cycle) => String(cycle.id) === rightCycleId)
      : null
    return found ?? defaultRightCycle
  }, [rightCycleId, cycles, defaultRightCycle])

  const { data: leftData, isLoading: isLoadingLeft } = useBillingCalculateData(sedeId, leftCycle)
  const { data: rightData, isLoading: isLoadingRight } = useBillingCalculateData(
    sedeId,
    rightCycle
  )

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <BillingCard
          cycles={cycles}
          selectedCycle={leftCycle}
          onCycleChange={setLeftCycleId}
          data={leftData}
          isLoading={isLoadingCycles || isLoadingLeft}
        />

        <div className="flex items-center justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card shadow-medium">
            <span className="text-lg font-black italic text-primary">Vs</span>
          </div>
        </div>

        <BillingCard
          cycles={cycles}
          selectedCycle={rightCycle}
          onCycleChange={setRightCycleId}
          data={rightData}
          isLoading={isLoadingCycles || isLoadingRight}
        />
      </div>

      <SavingsBanner
        leftData={leftData}
        rightData={rightData}
        leftCycle={leftCycle}
        rightCycle={rightCycle}
        isLoading={isLoadingCycles || isLoadingLeft || isLoadingRight}
        hasCycles={cycles.length > 0}
      />
    </div>
  )
}
