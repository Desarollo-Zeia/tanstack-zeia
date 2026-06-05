import { useEffect, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'

export const AVAILABLE_INDICATORS = [
  { indicator: 'CO2', unit: 'PPM' },
  { indicator: 'HUMIDITY', unit: 'PERCENT' },
  { indicator: 'TEMPERATURE', unit: 'CELSIUS' },
] as const

export type IndicatorKey = (typeof AVAILABLE_INDICATORS)[number]['indicator']

export function useMonitoreoFilters() {
  const navigate = useNavigate({ from: '/ambiental/dashboard/monitoreo' })
  const search = useSearch({ from: '/ambiental/dashboard/monitoreo' })

  const indicator =
    typeof search.indicador === 'string' ? search.indicador : null
  const unit =
    typeof search.unidad === 'string' ? search.unidad : null

  const hasAutoSelected = useRef(false)

  useEffect(() => {
    if (hasAutoSelected.current) return

    const firstIndicator = AVAILABLE_INDICATORS[0]
    const targetIndicator = indicator ?? firstIndicator.indicator
    const targetUnit = unit ?? firstIndicator.unit

    if (indicator !== targetIndicator || unit !== targetUnit) {
      hasAutoSelected.current = true
      navigate({
        search: {
          indicador: targetIndicator,
          unidad: targetUnit,
        },
      })
    }
  }, [indicator, unit, navigate])

  const isReady =
    !!indicator &&
    !!unit &&
    AVAILABLE_INDICATORS.some(
      (i) => i.indicator === indicator && i.unit === unit
    )

  return {
    indicator,
    unit,
    isReady,
  }
}
