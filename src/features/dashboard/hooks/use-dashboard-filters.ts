import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchHeadquarters } from '../api/headquarters'

function formatDateISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function parseDateSafe(dateStr: string | undefined): Date | null {
  if (!dateStr) return null
  const d = new Date(dateStr + 'T00:00:00')
  return isNaN(d.getTime()) ? null : d
}

interface DashboardFiltersState {
  sedeId: number | null
  panelId: number | null
  dateAfter: Date | null
  dateBefore: Date | null
}

export function useDashboardFilters() {
  const navigate = useNavigate({ from: '/energia/dashboard/panel' })
  const search = useSearch({ from: '/energia/dashboard/panel' })

  const today = useMemo(() => new Date(), [])

  // Read from URL or defaults
  const urlSedeId = typeof search.sede === 'string' ? Number(search.sede) : null
  const urlPanelId = typeof search.panel === 'string' ? Number(search.panel) : null
  const urlDateAfter = parseDateSafe(typeof search.desde === 'string' ? search.desde : undefined)
  const urlDateBefore = parseDateSafe(typeof search.hasta === 'string' ? search.hasta : undefined)

  const [localState, setLocalState] = useState<DashboardFiltersState>({
    sedeId: urlSedeId,
    panelId: urlPanelId,
    dateAfter: urlDateAfter ?? today,
    dateBefore: urlDateBefore ?? today,
  })

  // Sync URL params back to local state when URL changes externally
  useEffect(() => {
    const urlSede = typeof search.sede === 'string' ? Number(search.sede) : null
    const urlPanel = typeof search.panel === 'string' ? Number(search.panel) : null
    const urlAfter = parseDateSafe(typeof search.desde === 'string' ? search.desde : undefined)
    const urlBefore = parseDateSafe(typeof search.hasta === 'string' ? search.hasta : undefined)

    setLocalState((prev) => {
      const sedeChanged = urlSede !== null && prev.sedeId !== urlSede
      const panelChanged = urlPanel !== null && prev.panelId !== urlPanel
      const afterChanged = urlAfter !== null && prev.dateAfter?.getTime() !== urlAfter.getTime()
      const beforeChanged = urlBefore !== null && prev.dateBefore?.getTime() !== urlBefore.getTime()

      if (sedeChanged || panelChanged || afterChanged || beforeChanged) {
        return {
          ...prev,
          sedeId: urlSede ?? prev.sedeId,
          panelId: urlPanel ?? prev.panelId,
          dateAfter: urlAfter ?? prev.dateAfter,
          dateBefore: urlBefore ?? prev.dateBefore,
        }
      }
      return prev
    })
  }, [search.sede, search.panel, search.desde, search.hasta])

  // Fetch headquarters
  const { data: headquartersData, isLoading: isLoadingHeadquarters } = useQuery({
    queryKey: ['headquarters'],
    queryFn: fetchHeadquarters,
  })

  const headquarters = useMemo(() => headquartersData?.results ?? [], [headquartersData])

  // Auto-select first headquarter if none selected
  useEffect(() => {
    if (headquarters.length > 0 && !localState.sedeId) {
      const firstActive = headquarters.find((h) => h.is_active) ?? headquarters[0]
      if (firstActive) {
        setLocalState((prev) => ({
          ...prev,
          sedeId: firstActive.id,
        }))
      }
    }
  }, [headquarters, localState.sedeId])

  // Get current headquarter and its panels
  const currentHeadquarter = useMemo(() => {
    return headquarters.find((h) => h.id === localState.sedeId) ?? null
  }, [headquarters, localState.sedeId])

  const panels = useMemo(() => {
    return currentHeadquarter?.electrical_panels.filter((p) => p.is_active) ?? []
  }, [currentHeadquarter])

  // Auto-select first panel when sede changes or panels load
  useEffect(() => {
    if (panels.length > 0) {
      const panelExists = panels.some((p) => p.id === localState.panelId)
      if (!localState.panelId || !panelExists) {
        setLocalState((prev) => ({
          ...prev,
          panelId: panels[0].id,
        }))
      }
    } else {
      setLocalState((prev) => ({ ...prev, panelId: null }))
    }
  }, [panels, localState.panelId])

  // Sync URL params with local state
  const updateURL = useCallback(
    (newState: Partial<DashboardFiltersState>) => {
      const merged = { ...localState, ...newState }
      const params = {
        sede: merged.sedeId ? String(merged.sedeId) : undefined,
        panel: merged.panelId ? String(merged.panelId) : undefined,
        desde: merged.dateAfter ? formatDateISO(merged.dateAfter) : undefined,
        hasta: merged.dateBefore ? formatDateISO(merged.dateBefore) : undefined,
      }

      navigate({ search: params })
    },
    [localState, navigate]
  )

  // Handlers
  const setSedeId = useCallback(
    (id: number) => {
      const newState = { sedeId: id, panelId: null, dateAfter: localState.dateAfter, dateBefore: localState.dateBefore }
      setLocalState(newState)
      updateURL(newState)
    },
    [localState.dateAfter, localState.dateBefore, updateURL]
  )

  const setPanelId = useCallback(
    (id: number) => {
      const newState = { ...localState, panelId: id }
      setLocalState(newState)
      updateURL(newState)
    },
    [localState, updateURL]
  )

  const setDateRange = useCallback(
    (range: { startDate: Date | null; endDate: Date | null }) => {
      const newState = { ...localState, dateAfter: range.startDate, dateBefore: range.endDate }
      setLocalState(newState)
      updateURL(newState)
    },
    [localState, updateURL]
  )

  const currentPanel = useMemo(() => {
    return panels.find((p) => p.id === localState.panelId) ?? null
  }, [panels, localState.panelId])

  const isReady = !!localState.sedeId && !!localState.panelId && !!localState.dateAfter && !!localState.dateBefore

  return {
    // Data
    headquarters,
    panels,
    currentHeadquarter,
    currentPanel,

    // State
    sedeId: localState.sedeId,
    panelId: localState.panelId,
    dateAfter: localState.dateAfter,
    dateBefore: localState.dateBefore,

    // Handlers
    setSedeId,
    setPanelId,
    setDateRange,

    // Status
    isLoadingHeadquarters,
    isReady,
  }
}
