import { useEffect } from 'react'
import {
  persistSelection,
  type FilterResource,
  type PersistedFilterSelection,
} from '@/lib/filter-persistence'

interface SelectionField {
  value: number | null
  candidates: Array<{ id: number }>
}

export interface PersistFilterSelectionInput {
  sede?: SelectionField
  panel?: SelectionField
  tuberia?: SelectionField
  punto?: SelectionField
}

/**
 * Persiste la selección efectiva (validada contra los candidatos cargados) de los
 * filtros de un módulo, para restaurarla al navegar a otro módulo del mismo recurso.
 */
export function usePersistFilterSelection(
  resource: FilterResource,
  input: PersistFilterSelectionInput
) {
  const sedeValue = input.sede?.value ?? null
  const sedeCandidates = input.sede?.candidates
  const panelValue = input.panel?.value ?? null
  const panelCandidates = input.panel?.candidates
  const tuberiaValue = input.tuberia?.value ?? null
  const tuberiaCandidates = input.tuberia?.candidates
  const puntoValue = input.punto?.value ?? null
  const puntoCandidates = input.punto?.candidates

  useEffect(() => {
    const patch: PersistedFilterSelection = {}
    if (sedeValue != null && sedeCandidates?.some((c) => c.id === sedeValue)) {
      patch.sede = sedeValue
    }
    if (panelValue != null && panelCandidates?.some((c) => c.id === panelValue)) {
      patch.panel = panelValue
    }
    if (tuberiaValue != null && tuberiaCandidates?.some((c) => c.id === tuberiaValue)) {
      patch.tuberia = tuberiaValue
    }
    if (puntoValue != null && puntoCandidates?.some((c) => c.id === puntoValue)) {
      patch.punto = puntoValue
    }
    if (Object.keys(patch).length > 0) {
      persistSelection(resource, patch)
    }
  }, [
    resource,
    sedeValue,
    sedeCandidates,
    panelValue,
    panelCandidates,
    tuberiaValue,
    tuberiaCandidates,
    puntoValue,
    puntoCandidates,
  ])
}
