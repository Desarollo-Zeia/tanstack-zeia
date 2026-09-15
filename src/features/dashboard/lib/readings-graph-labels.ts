import { formatDateShort, formatDateTimeShort } from '@/lib/date-utils'
import type { ReadingGraphPoint } from '../types'

export type ReadingsLastBy = 'minute' | '15min' | '30min' | 'hour' | 'day' | 'week' | 'month'

/**
 * Extrae "YYYY-MM-DD" directamente del string sin pasar por `new Date`,
 * para evitar corrimientos de día por zona horaria (p.ej. "2026-09-09T00:00:00Z"
 * visto en Lima como 8 de septiembre).
 */
function extractDateKey(value: string | null | undefined): string | null {
  if (!value) return null
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/)
  return match ? match[1] : null
}

/** Construye un Date local (mediodía para evitar DST) desde "YYYY-MM-DD". */
function parseLocalDate(dateKey: string): Date | null {
  const match = dateKey.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const d = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
  return isNaN(d.getTime()) ? null : d
}

function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Rango real del bucket semanal/mensual a partir de `first_reading` →
 * `last_reading`. Si ambos caen el mismo día (o falta alguno), cae al rango
 * calendario derivado de `period` (semana = inicio + 6 días, mes = 1 → fin
 * de mes) para seguir mostrando un intervalo y no una fecha sola.
 */
function getWeekMonthRange(point: ReadingGraphPoint, lastBy: 'week' | 'month'): string {
  const firstKey = extractDateKey(point.first_reading)
  const lastKey = extractDateKey(point.last_reading)

  if (firstKey && lastKey && firstKey !== lastKey) {
    return `${formatDateShort(firstKey)} → ${formatDateShort(lastKey)}`
  }

  const periodKey = extractDateKey(point.period)
  const anchor = (periodKey ? parseLocalDate(periodKey) : null) ?? (firstKey ? parseLocalDate(firstKey) : null)
  if (!anchor) {
    const fallback = firstKey ?? periodKey ?? point.period
    return formatDateShort(fallback)
  }

  if (lastBy === 'week') {
    const end = new Date(anchor.getTime())
    end.setDate(end.getDate() + 6)
    const startKey = toDateKey(anchor)
    const endKey = toDateKey(end)
    if (startKey === endKey) return formatDateShort(startKey)
    return `${formatDateShort(startKey)} → ${formatDateShort(endKey)}`
  }

  const monthStart = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
  const monthEnd = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 0)
  const startKey = toDateKey(monthStart)
  const endKey = toDateKey(monthEnd)
  if (startKey === endKey) return formatDateShort(startKey)
  return `${formatDateShort(startKey)} → ${formatDateShort(endKey)}`
}

/**
 * Etiqueta del eje X. Siempre fecha simple (inicio del bucket desde `period`):
 * el rango completo solo se muestra en el tooltip.
 */
export function formatReadingsAxisLabel(point: ReadingGraphPoint, lastBy: ReadingsLastBy): string {
  if (lastBy === 'week' || lastBy === 'month' || lastBy === 'day') {
    // El bucket lo define `period`; usar `first_reading` aquí corría el día
    // cuando el timestamp venía en UTC.
    const periodKey = extractDateKey(point.period)
    if (periodKey) return formatDateShort(periodKey)
    const firstKey = extractDateKey(point.first_reading)
    if (firstKey) return formatDateShort(firstKey)
    return formatDateShort(point.first_reading)
  }

  const date = new Date(point.first_reading)
  if (isNaN(date.getTime())) return point.first_reading
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

/**
 * Título del tooltip. Para semana/mes muestra el rango completo
 * ("8 de septiembre → 14 de septiembre"); el eje X se mantiene en fecha simple.
 */
export function formatReadingsTooltipTitle(point: ReadingGraphPoint, lastBy: ReadingsLastBy): string {
  if (lastBy === 'week' || lastBy === 'month') {
    return getWeekMonthRange(point, lastBy)
  }

  if (lastBy === 'day') {
    const periodKey = extractDateKey(point.period)
    if (periodKey) return formatDateShort(periodKey)
    return formatDateShort(point.first_reading)
  }

  return formatDateTimeShort(point.first_reading)
}
