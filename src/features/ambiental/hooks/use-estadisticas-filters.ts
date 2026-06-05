import { useEffect, useCallback, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { formatDateISO, parseDateSafe } from '@/lib/date-utils'

export const AVAILABLE_INDICATORS = [
  { indicator: 'CO2', unit: 'PPM' },
  { indicator: 'HUMIDITY', unit: 'PERCENT' },
  { indicator: 'TEMPERATURE', unit: 'CELSIUS' },
] as const

export const INTERVAL_OPTIONS = [
  { value: null, label: '5 minutos' },
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 240, label: '4 horas' },
  { value: 360, label: '6 horas' },
  { value: 720, label: '12 horas' },
  { value: 1440, label: '24 horas' },
] as const

export type IndicatorKey = (typeof AVAILABLE_INDICATORS)[number]['indicator']

export function useEstadisticasFilters() {
  const navigate = useNavigate({ from: '/ambiental/dashboard/analisis/estadisticas' })
  const search = useSearch({ from: '/ambiental/dashboard/analisis/estadisticas' })

  const indicador = typeof search.indicador === 'string' ? search.indicador : null
  const unidad = typeof search.unidad === 'string' ? search.unidad : null
  const dateAfter = parseDateSafe(typeof search.desde === 'string' ? search.desde : undefined)
  const dateBefore = parseDateSafe(typeof search.hasta === 'string' ? search.hasta : undefined)
  const intervalo =
    typeof search.intervalo === 'string'
      ? search.intervalo === 'null'
        ? null
        : Number(search.intervalo)
      : null

  const today = useMemo(() => new Date(), [])

  // Auto-select: indicator → dates → interval
  useEffect(() => {
    const firstIndicator = AVAILABLE_INDICATORS[0]
    const targetIndicator = indicador ?? firstIndicator.indicator
    const targetUnit = unidad ?? firstIndicator.unit
    const targetDateAfter = dateAfter ?? today
    const targetDateBefore = dateBefore ?? today
    const targetIntervalo = intervalo ?? null

    const needsNavigation =
      indicador !== targetIndicator ||
      unidad !== targetUnit ||
      dateAfter?.getTime() !== targetDateAfter.getTime() ||
      dateBefore?.getTime() !== targetDateBefore.getTime() ||
      intervalo !== targetIntervalo

    if (needsNavigation) {
      navigate({
        search: {
          indicador: targetIndicator,
          unidad: targetUnit,
          desde: formatDateISO(targetDateAfter),
          hasta: formatDateISO(targetDateBefore),
          intervalo: targetIntervalo === null ? 'null' : String(targetIntervalo),
        },
      })
    }
  }, [indicador, unidad, dateAfter, dateBefore, intervalo, today, navigate])

  const setIndicator = useCallback(
    (indicatorKey: string, unitKey: string) => {
      navigate({
        search: {
          indicador: indicatorKey,
          unidad: unitKey,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
          intervalo: intervalo === null ? 'null' : String(intervalo),
        },
      })
    },
    [navigate, dateAfter, dateBefore, intervalo, today]
  )

  const setDateRange = useCallback(
    (range: { startDate: Date | null; endDate: Date | null }) => {
      navigate({
        search: {
          indicador: indicador ?? undefined,
          unidad: unidad ?? undefined,
          desde: formatDateISO(range.startDate),
          hasta: formatDateISO(range.endDate),
          intervalo: intervalo === null ? 'null' : String(intervalo),
        },
      })
    },
    [navigate, indicador, unidad, intervalo]
  )

  const setIntervalo = useCallback(
    (val: number | null) => {
      navigate({
        search: {
          indicador: indicador ?? undefined,
          unidad: unidad ?? undefined,
          desde: formatDateISO(dateAfter),
          hasta: formatDateISO(dateBefore),
          intervalo: val === null ? 'null' : String(val),
        },
      })
    },
    [navigate, indicador, unidad, dateAfter, dateBefore]
  )

  const isReady =
    !!indicador &&
    !!unidad &&
    !!dateAfter &&
    !!dateBefore

  return {
    indicador,
    unidad,
    dateAfter,
    dateBefore,
    intervalo,
    setIndicator,
    setDateRange,
    setIntervalo,
    isReady,
  }
}
