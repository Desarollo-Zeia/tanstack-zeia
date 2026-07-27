import { getIndicatorCategory } from '@/lib/electric-parameters'
import type { Category } from '../hooks/use-home-filters'
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

/**
 * Filtra las claves de indicadores dejando solo las que pertenecen a la
 * categoría seleccionada (p. ej. para `energy` excluye P/Q/S de potencia).
 * Las claves cuya categoría es desconocida se conservan para no ocultar
 * indicadores nuevos del backend.
 */
export function filterIndicatorsByCategory(
  indicatorKeys: string[],
  category: Category
): string[] {
  return indicatorKeys.filter((key) => {
    const keyCategory = getIndicatorCategory(key)
    return keyCategory === null || keyCategory === category
  })
}
