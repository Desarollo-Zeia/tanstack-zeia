import { useEffect, useCallback, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { formatDateISO, parseDateSafe } from '@/lib/date-utils'

export const AVAILABLE_INDICATORS = [
  { indicator: 'CO2', unit: 'PPM' },
  { indicator: 'HUMIDITY', unit: 'PERCENT' },
  { indicator: 'TEMPERATURE', unit: 'CELSIUS' },
] as const

export type IndicatorKey = (typeof AVAILABLE_INDICATORS)[number]['indicator']

export function usePicosFilters() {
  const navigate = useNavigate({ from: '/ambiental/dashboard/analisis/picoshistoricos' })
  const search = useSearch({ from: '/ambiental/dashboard/analisis/picoshistoricos' })

  const indicador = typeof search.indicador === 'string' ? search.indicador : null
  const unidad = typeof search.unidad === 'string' ? search.unidad : null
  const dateAfter = parseDateSafe(typeof search.desde === 'string' ? search.desde : undefined)
  const dateBefore = parseDateSafe(typeof search.hasta === 'string' ? search.hasta : undefined)
  const page = typeof search.pagina === 'string' ? Number(search.pagina) : 1

  const today = useMemo(() => new Date(), [])

  // Auto-select: indicator → dates → page
  useEffect(() => {
    const firstIndicator = AVAILABLE_INDICATORS[0]
    const targetIndicator = indicador ?? firstIndicator.indicator
    const targetUnit = unidad ?? firstIndicator.unit
    const targetDateAfter = dateAfter ?? today
    const targetDateBefore = dateBefore ?? today
    const targetPage = page >= 1 ? page : 1

    const needsNavigation =
      indicador !== targetIndicator ||
      unidad !== targetUnit ||
      dateAfter?.getTime() !== targetDateAfter.getTime() ||
      dateBefore?.getTime() !== targetDateBefore.getTime() ||
      page !== targetPage

    if (needsNavigation) {
      navigate({
        search: {
          indicador: targetIndicator,
          unidad: targetUnit,
          desde: formatDateISO(targetDateAfter),
          hasta: formatDateISO(targetDateBefore),
          pagina: String(targetPage),
        },
      })
    }
  }, [indicador, unidad, dateAfter, dateBefore, page, today, navigate])

  const setIndicator = useCallback(
    (indicatorKey: string, unitKey: string) => {
      navigate({
        search: {
          indicador: indicatorKey,
          unidad: unitKey,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
          pagina: '1',
        },
      })
    },
    [navigate, dateAfter, dateBefore, today]
  )

  const setDateRange = useCallback(
    (range: { startDate: Date | null; endDate: Date | null }) => {
      navigate({
        search: {
          indicador: indicador ?? undefined,
          unidad: unidad ?? undefined,
          desde: formatDateISO(range.startDate),
          hasta: formatDateISO(range.endDate),
          pagina: '1',
        },
      })
    },
    [navigate, indicador, unidad]
  )

  const setPage = useCallback(
    (newPage: number) => {
      navigate({
        search: {
          indicador: indicador ?? undefined,
          unidad: unidad ?? undefined,
          desde: formatDateISO(dateAfter),
          hasta: formatDateISO(dateBefore),
          pagina: String(newPage),
        },
      })
    },
    [navigate, indicador, unidad, dateAfter, dateBefore]
  )

  const isReady =
    !!indicador &&
    !!unidad &&
    !!dateAfter &&
    !!dateBefore &&
    page >= 1

  return {
    indicador,
    unidad,
    dateAfter,
    dateBefore,
    page,
    setIndicator,
    setDateRange,
    setPage,
    isReady,
  }
}
