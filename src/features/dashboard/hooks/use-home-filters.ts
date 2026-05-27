import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchHeadquarters } from '../api/headquarters'
import { fetchDeviceMeasurementPointsList } from '../api/measurement-points'
import { formatDateISO, parseDateSafe } from '@/lib/date-utils'

export const VALID_CATEGORIES = ['power', 'energy', 'current', 'voltage'] as const
export type Category = (typeof VALID_CATEGORIES)[number]

export function useHomeFilters() {
  const navigate = useNavigate({ from: '/energia/dashboard/home' })
  const search = useSearch({ from: '/energia/dashboard/home' })

  // Read ALL state directly from URL — single source of truth
  const sedeId = typeof search.sede === 'string' ? Number(search.sede) : null
  const panelId = typeof search.panel === 'string' ? Number(search.panel) : null
  const puntoId = typeof search.punto === 'string' ? Number(search.punto) : null
  const category =
    typeof search.categoria === 'string' && VALID_CATEGORIES.includes(search.categoria as Category)
      ? (search.categoria as Category)
      : null
  const page = typeof search.pagina === 'string' ? Number(search.pagina) : 1
  const dateAfter = parseDateSafe(typeof search.desde === 'string' ? search.desde : undefined)
  const dateBefore = parseDateSafe(typeof search.hasta === 'string' ? search.hasta : undefined)

  const today = useMemo(() => new Date(), [])

  // Fetch headquarters
  const { data: headquartersData, isLoading: isLoadingHeadquarters } = useQuery({
    queryKey: ['headquarters'],
    queryFn: fetchHeadquarters,
  })

  const headquarters = useMemo(() => headquartersData?.results ?? [], [headquartersData])

  // Derived: current headquarter and panels
  const currentHeadquarter = useMemo(() => {
    return headquarters.find((h) => h.id === sedeId) ?? null
  }, [headquarters, sedeId])

  const panels = useMemo(() => {
    return currentHeadquarter?.electrical_panels.filter((p) => p.is_active) ?? []
  }, [currentHeadquarter])

  const currentPanel = useMemo(() => {
    return panels.find((p) => p.id === panelId) ?? null
  }, [panels, panelId])

  // Fetch measurement points for current panel
  const { data: measurementPointsData, isLoading: isLoadingMeasurementPoints } = useQuery({
    queryKey: ['device-measurement-points-list', sedeId, panelId],
    queryFn: () => {
      if (!sedeId || !panelId) throw new Error('Missing required parameters')
      return fetchDeviceMeasurementPointsList(sedeId, panelId)
    },
    enabled: !!sedeId && !!panelId,
  })

  const measurementPoints = useMemo(() => {
    return measurementPointsData?.results.filter((mp) => mp.is_active) ?? []
  }, [measurementPointsData])

  // Auto-select: if URL is missing values, navigate to defaults
  const hasAutoSelected = useRef(false)

  useEffect(() => {
    if (hasAutoSelected.current) return
    if (headquarters.length === 0) return

    const firstActiveSede = headquarters.find((h) => h.is_active) ?? headquarters[0]
    const targetSedeId = sedeId ?? firstActiveSede?.id ?? null

    if (!targetSedeId) return

    const targetHeadquarter = headquarters.find((h) => h.id === targetSedeId)
    const availablePanels = targetHeadquarter?.electrical_panels.filter((p) => p.is_active) ?? []
    const targetPanelId = panelId ?? availablePanels[0]?.id ?? null

    const targetDateAfter = dateAfter ?? today
    const targetDateBefore = dateBefore ?? today

    const targetCategory = category ?? 'power'

    // Only auto-select punto if measurement points are loaded
    const targetPuntoId =
      puntoId ??
      (measurementPoints.length > 0 ? measurementPoints[0]?.id : null) ??
      null

    const targetPage = page ?? 1

    const needsNavigation =
      sedeId !== targetSedeId ||
      panelId !== targetPanelId ||
      dateAfter?.getTime() !== targetDateAfter.getTime() ||
      dateBefore?.getTime() !== targetDateBefore.getTime() ||
      category !== targetCategory ||
      puntoId !== targetPuntoId ||
      page !== targetPage

    if (needsNavigation) {
      hasAutoSelected.current = true
      navigate({
        search: {
          sede: String(targetSedeId),
          panel: targetPanelId ? String(targetPanelId) : undefined,
          punto: targetPuntoId ? String(targetPuntoId) : undefined,
          categoria: targetCategory,
          pagina: targetPage > 1 ? String(targetPage) : undefined,
          desde: formatDateISO(targetDateAfter),
          hasta: formatDateISO(targetDateBefore),
        },
      })
    }
  }, [
    headquarters,
    sedeId,
    panelId,
    puntoId,
    category,
    page,
    dateAfter,
    dateBefore,
    today,
    navigate,
    measurementPoints,
  ])

  // Handlers — just navigate, no local state
  const setSedeId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sede: String(id),
          panel: undefined,
          punto: undefined,
          categoria: category ?? 'power',
          pagina: undefined,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
        },
      })
    },
    [navigate, category, dateAfter, dateBefore, today]
  )

  const setPanelId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sede: String(sedeId),
          panel: String(id),
          punto: undefined,
          categoria: category ?? 'power',
          pagina: undefined,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
        },
      })
    },
    [navigate, sedeId, category, dateAfter, dateBefore, today]
  )

  const setPuntoId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sede: String(sedeId),
          panel: String(panelId),
          punto: String(id),
          categoria: category ?? 'power',
          pagina: undefined,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
        },
      })
    },
    [navigate, sedeId, panelId, category, dateAfter, dateBefore, today]
  )

  const setCategory = useCallback(
    (cat: Category) => {
      navigate({
        search: {
          sede: String(sedeId),
          panel: String(panelId),
          punto: String(puntoId),
          categoria: cat,
          pagina: undefined,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
        },
      })
    },
    [navigate, sedeId, panelId, puntoId, dateAfter, dateBefore, today]
  )

  const setDateRange = useCallback(
    (range: { startDate: Date | null; endDate: Date | null }) => {
      navigate({
        search: {
          sede: String(sedeId),
          panel: String(panelId),
          punto: String(puntoId),
          categoria: category ?? 'power',
          pagina: undefined,
          desde: formatDateISO(range.startDate),
          hasta: formatDateISO(range.endDate),
        },
      })
    },
    [navigate, sedeId, panelId, puntoId, category]
  )

  const setPage = useCallback(
    (newPage: number) => {
      navigate({
        search: {
          sede: String(sedeId),
          panel: String(panelId),
          punto: String(puntoId),
          categoria: category ?? 'power',
          pagina: newPage > 1 ? String(newPage) : undefined,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
        },
      })
    },
    [navigate, sedeId, panelId, puntoId, category, dateAfter, dateBefore, today]
  )

  const isReady = !!sedeId && !!panelId && !!puntoId && !!dateAfter && !!dateBefore && !!category

  return {
    // Data
    headquarters,
    panels,
    measurementPoints,
    currentHeadquarter,
    currentPanel,

    // State (from URL)
    sedeId,
    panelId,
    puntoId,
    category,
    page,
    dateAfter,
    dateBefore,

    // Handlers
    setSedeId,
    setPanelId,
    setPuntoId,
    setCategory,
    setDateRange,
    setPage,

    // Status
    isLoadingHeadquarters,
    isLoadingMeasurementPoints,
    isReady,
  }
}
