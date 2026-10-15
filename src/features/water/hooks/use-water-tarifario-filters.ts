import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchWaterHeadquarters } from '../api/water-headquarters'
import { getPersistedFilterId } from '@/lib/filter-persistence'
import { usePersistFilterSelection } from '@/hooks/use-persist-filter-selection'

export function useWaterTarifarioFilters() {
  const navigate = useNavigate({ from: '/energia/water/dashboard/tarifario' })
  const search = useSearch({ from: '/energia/water/dashboard/tarifario' })

  const sedeId = typeof search.sede === 'string' ? Number(search.sede) : null
  const tab = search.tab === 'comparador' ? 'comparador' : 'mensual'

  const { data: headquartersData, isLoading: isLoadingHeadquarters } = useQuery({
    queryKey: ['water-headquarters'],
    queryFn: fetchWaterHeadquarters,
  })

  const headquarters = useMemo(() => headquartersData?.results ?? [], [headquartersData])

  const currentHeadquarter = useMemo(() => {
    return headquarters.find((h) => h.id === sedeId) ?? null
  }, [headquarters, sedeId])

  const hasAutoSelected = useRef(false)
  // Firma de las sedes cargadas: si cambia (ej. otro usuario/sesión),
  // los filtros de la URL deben revalidarse en vez de respetarse a ciegas.
  const lastHeadquartersKey = useRef<string | null>(null)

  useEffect(() => {
    if (headquarters.length === 0) return

    const headquartersKey = headquarters.map((h) => h.id).join(',')
    if (lastHeadquartersKey.current !== headquartersKey) {
      lastHeadquartersKey.current = headquartersKey
      hasAutoSelected.current = false
    }
    if (hasAutoSelected.current) return

    const firstActiveSede = headquarters.find((h) => h.is_active) ?? headquarters[0]
    // Ignora la sede de la URL si no pertenece al usuario actual (sesión anterior).
    // Si la URL no trae sede, restaura la última selección y cae a la primera activa.
    const targetSedeId =
      sedeId != null && headquarters.some((h) => h.id === sedeId)
        ? sedeId
        : (getPersistedFilterId('water', 'sede', headquarters) ?? firstActiveSede?.id ?? null)

    if (!targetSedeId) return

    if (sedeId !== targetSedeId) {
      hasAutoSelected.current = true
      navigate({
        search: {
          sede: String(targetSedeId),
          tab: search.tab,
        },
      })
    }
  }, [headquarters, sedeId, navigate, search.tab])

  // Persiste la selección efectiva para restaurarla al navegar entre módulos.
  usePersistFilterSelection('water', {
    sede: { value: sedeId, candidates: headquarters },
  })

  const setSedeId = useCallback(
    (id: number) => {
      navigate({
        search: (prev) => ({
          ...prev,
          sede: String(id),
        }),
      })
    },
    [navigate]
  )

  const setTab = useCallback(
    (next: 'comparador' | 'mensual') => {
      navigate({
        search: (prev) => ({
          ...prev,
          tab: next === 'comparador' ? 'comparador' : undefined,
        }),
      })
    },
    [navigate]
  )

  const isReady = !!sedeId

  return {
    headquarters,
    currentHeadquarter,
    sedeId,
    setSedeId,
    tab,
    setTab,
    isLoadingHeadquarters,
    isReady,
  }
}
