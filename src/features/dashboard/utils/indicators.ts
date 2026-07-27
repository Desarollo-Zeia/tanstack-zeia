import type { Reading } from '../types'

/**
 * Devuelve el primer indicador (según el orden de `indicatorKeys`) que tenga
 * al menos una lectura con valor numérico en los resultados, o null si ninguno
 * tiene datos. Un valor 0 cuenta como dato válido; null/undefined/NaN no.
 */
export function findFirstIndicatorWithData(
  indicatorKeys: string[],
  results: Reading[]
): string | null {
  for (const key of indicatorKeys) {
    const hasData = results.some((reading) => {
      const value = reading.indicators.values[key]
      return typeof value === 'number' && !Number.isNaN(value)
    })
    if (hasData) return key
  }
  return null
}
