import {
  CURRENCY_SYMBOLS,
  formatCycleRange,
  formatMoney,
  getCycleLabel,
} from '@/features/dashboard/lib/billing-format'
import type {
  WaterBillingCalculateDetails,
  WaterBillingCalculateItem,
  WaterBillingCalculateResponse,
} from '../types'

export { formatCycleRange as formatWaterCycleRange, formatMoney, getCycleLabel as getWaterCycleLabel, CURRENCY_SYMBOLS }

export interface WaterBillingTotal {
  currency: string
  amount: number
}

/**
 * Totales de facturación de agua por moneda. Prefiere `totals_by_currency`;
 * hace fallback a `total_amount`/`currency` (respuesta de una única moneda).
 */
export function getWaterBillingTotals(data: WaterBillingCalculateResponse): WaterBillingTotal[] {
  const entries = Object.entries(data.totals_by_currency ?? {})
  if (entries.length > 0) {
    return entries.map(([currency, amount]) => ({ currency, amount }))
  }
  if (data.total_amount != null && data.currency != null) {
    return [{ currency: data.currency, amount: data.total_amount }]
  }
  return []
}

/**
 * Línea de detalle para la lista de cargos de agua:
 * - Agua potable: "139.00 m³"
 * - Alcantarillado: "139.00 m³ × 0.8 = 111.20 m³"
 * - null cuando el concepto no tiene tarifa configurada (details = null)
 */
export function getWaterChargeDetailLine(item: WaterBillingCalculateItem): string | null {
  const { details } = item
  if (!details) return null
  const consumption = `${details.consumption.toFixed(2)} ${details.unit}`
  if (details.factor != null && details.billed_volume != null) {
    return `${consumption} × ${details.factor} = ${details.billed_volume.toFixed(2)} ${details.unit}`
  }
  return consumption
}

/** Tarifa formateada: "8.82 PEN/m³" / null */
export function formatWaterRate(details: WaterBillingCalculateDetails | null): string | null {
  if (!details) return null
  return `${details.rate.toFixed(2)} ${details.rate_unit}`
}
