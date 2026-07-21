import type {
  BillingCalculateDetails,
  BillingCalculateItem,
  BillingCalculateResponse,
  BillingCycleItem,
} from '../types'

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  PEN: 'S/',
}

export function formatMoney(value: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  return `${symbol}${value.toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export interface BillingTotal {
  currency: string
  amount: number
}

/**
 * Totales de facturación por moneda. Prefiere `totals_by_currency`;
 * hace fallback a `total_amount`/`currency` (respuesta de una única moneda).
 */
export function getBillingTotals(data: BillingCalculateResponse): BillingTotal[] {
  const entries = Object.entries(data.totals_by_currency ?? {})
  if (entries.length > 0) {
    return entries.map(([currency, amount]) => ({ currency, amount }))
  }
  if (data.total_amount != null && data.currency != null) {
    return [{ currency: data.currency, amount: data.total_amount }]
  }
  return []
}

function getPowerUnit(details: BillingCalculateDetails): string {
  if (!('rate_unit' in details)) return 'kW'
  return details.rate_unit.includes('/') ? details.rate_unit.split('/')[1] : 'kW'
}

/** Linea de detalle para la lista de cargos: "145.89 MWh" / "21802.28 kVArh" / "434.01 kW" / null */
export function getChargeDetailLine(item: BillingCalculateItem): string | null {
  const { details } = item
  if (!details) return null
  // Energia reactiva: se factura el exceso sobre el umbral (excess * rate = value)
  if ('active_energy_consumption' in details) {
    return `${details.excess_consumption.toFixed(2)} ${details.unit}`
  }
  if ('consumption' in details) {
    return `${details.consumption.toFixed(2)} ${details.unit}`
  }
  return `${details.max_power.toFixed(2)} ${getPowerUnit(details)}`
}

/** Tarifa formateada: "38.18 $ / MWh" / "6.25 $ / kW" / null */
export function formatRate(details: BillingCalculateDetails | null): string | null {
  if (!details || !('rate' in details)) return null
  const [currency, unit] = details.rate_unit.includes('/')
    ? details.rate_unit.split('/')
    : [details.rate_unit, '']
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency
  return `${details.rate.toFixed(2)} ${symbol} / ${unit}`
}

function parseISODateLocal(dateStr: string): Date | null {
  const parts = dateStr.split('-')
  if (parts.length !== 3) return null
  const [year, month, day] = parts.map(Number)
  return new Date(year, month - 1, day)
}

/** Rango de ciclo legible: "1 de julio — 31 de julio" */
export function formatCycleRange(startDate: string, endDate: string): string {
  const start = parseISODateLocal(startDate)
  const end = parseISODateLocal(endDate)
  if (!start || !end) return '—'
  const startMonth = start.toLocaleString('es-ES', { month: 'long' })
  const endMonth = end.toLocaleString('es-ES', { month: 'long' })
  return `${start.getDate()} de ${startMonth} — ${end.getDate()} de ${endMonth}`
}

/** Etiqueta del ciclo segun el mes de su fecha de inicio: "Julio 2026" */
export function getCycleLabel(cycle: BillingCycleItem): string {
  const start = parseISODateLocal(cycle.start_date)
  if (!start) return '—'
  const monthName = start.toLocaleString('es-ES', { month: 'long' })
  return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} ${start.getFullYear()}`
}
