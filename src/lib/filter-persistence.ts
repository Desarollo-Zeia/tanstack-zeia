export type FilterResource = 'energy' | 'water'

export interface PersistedFilterSelection {
  sede?: number
  panel?: number
  tuberia?: number
  punto?: number
}

const STORAGE_KEY = 'zeia-filter-selection'

type PersistedStore = Partial<Record<FilterResource, PersistedFilterSelection>>

function readAll(): PersistedStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PersistedStore
    return typeof parsed === 'object' && parsed !== null ? parsed : {}
  } catch {
    return {}
  }
}

/**
 * Última selección válida del usuario para un recurso (sede/panel/tubería/punto).
 * Se usa como default al entrar a un módulo sin filtros en la URL, para que la
 * selección persista entre navegación.
 */
export function getPersistedSelection(resource: FilterResource): PersistedFilterSelection {
  return readAll()[resource] ?? {}
}

/** Guarda (merge) la selección efectiva del usuario para restaurarla en otros módulos. */
export function persistSelection(resource: FilterResource, patch: PersistedFilterSelection): void {
  const all = readAll()
  all[resource] = { ...all[resource], ...patch }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
  } catch {
    // storage no disponible (ej. modo privado): la persistencia es best-effort
  }
}

/**
 * Devuelve el id persistido solo si sigue existiendo en los candidatos cargados,
 * para descartar selecciones de otra sesión u otro usuario.
 */
export function getPersistedFilterId(
  resource: FilterResource,
  field: keyof PersistedFilterSelection,
  candidates: Array<{ id: number }>
): number | null {
  const value = getPersistedSelection(resource)[field]
  if (value == null) return null
  return candidates.some((c) => c.id === value) ? value : null
}
