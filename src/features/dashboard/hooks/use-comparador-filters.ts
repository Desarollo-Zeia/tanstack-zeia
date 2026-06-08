import { useEffect, useCallback, useMemo, useRef, useState } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchHeadquarters } from '../api/headquarters'
import { fetchDeviceMeasurementPointsList } from '../api/measurement-points'
import { fetchFavoritePoints } from '../api/favorite-points'
import { formatDateISO, parseDateSafe } from '@/lib/date-utils'

export function useComparadorFilters() {
  const navigate = useNavigate({ from: '/energia/dashboard/comparador' })
  const search = useSearch({ from: '/energia/dashboard/comparador' })

  const sedeId = typeof search.sede === 'string' ? Number(search.sede) : null
  const panelId = typeof search.panel === 'string' ? Number(search.panel) : null
  const puntoId = typeof search.punto === 'string' ? Number(search.punto) : null
  const dateAfter = parseDateSafe(typeof search.desde === 'string' ? search.desde : undefined)
  const dateBefore = parseDateSafe(typeof search.hasta === 'string' ? search.hasta : undefined)

  const today = useMemo(() => new Date(), [])

  // Fetch favorite points
  const { data: favoritePointsData, isLoading: isLoadingFavoritePoints } = useQuery({
    queryKey: ['favorite-points'],
    queryFn: fetchFavoritePoints,
  })

  const favoritePoints = useMemo(() => favoritePointsData?.results ?? [], [favoritePointsData])

  // Track selected favorite point (not persisted in URL)
  const [selectedFavoriteId, setSelectedFavoriteId] = useState<number | null>(null)

  // Sync selectedFavoriteId with URL params: if the current sede/panel/punto
  // no longer matches the selected favorite, clear it
  useEffect(() => {
    if (selectedFavoriteId === null) return
    const selected = favoritePoints.find((f) => f.id === selectedFavoriteId)
    if (!selected) return
    const matches =
      sedeId === selected.energy_headquarter_id &&
      panelId === selected.electrical_panel_id &&
      puntoId === selected.measurement_point
    if (!matches) {
      setSelectedFavoriteId(null)
    }
  }, [sedeId, panelId, puntoId, favoritePoints, selectedFavoriteId])

  const { data: headquartersData, isLoading: isLoadingHeadquarters } = useQuery({
    queryKey: ['headquarters'],
    queryFn: fetchHeadquarters,
  })

  const headquarters = useMemo(() => headquartersData?.results ?? [], [headquartersData])

  const currentHeadquarter = useMemo(() => {
    return headquarters.find((h) => h.id === sedeId) ?? null
  }, [headquarters, sedeId])

  const panels = useMemo(() => {
    return currentHeadquarter?.electrical_panels.filter((p) => p.is_active) ?? []
  }, [currentHeadquarter])

  const currentPanel = useMemo(() => {
    return panels.find((p) => p.id === panelId) ?? null
  }, [panels, panelId])

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

  const hasAutoSelected = useRef(false)
  const hasAutoSelectedPunto = useRef(false)
  const lastPanelIdForPunto = useRef<number | null>(null)

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

    const needsNavigation =
      sedeId !== targetSedeId ||
      panelId !== targetPanelId ||
      dateAfter?.getTime() !== targetDateAfter.getTime() ||
      dateBefore?.getTime() !== targetDateBefore.getTime()

    if (needsNavigation) {
      hasAutoSelected.current = true
      navigate({
        search: {
          sede: String(targetSedeId),
          panel: targetPanelId ? String(targetPanelId) : undefined,
          punto: undefined,
          desde: formatDateISO(targetDateAfter),
          hasta: formatDateISO(targetDateBefore),
        },
      })
    }
  }, [
    headquarters,
    sedeId,
    panelId,
    dateAfter,
    dateBefore,
    today,
    navigate,
  ])

  useEffect(() => {
    if (panelId !== lastPanelIdForPunto.current) {
      hasAutoSelectedPunto.current = false
      lastPanelIdForPunto.current = panelId
    }

    if (hasAutoSelectedPunto.current) return
    if (puntoId !== null) {
      hasAutoSelectedPunto.current = true
      return
    }
    if (measurementPoints.length === 0) return

    hasAutoSelectedPunto.current = true
    navigate({
      search: {
        sede: String(sedeId),
        panel: String(panelId),
        punto: String(measurementPoints[0].id),
        desde: formatDateISO(dateAfter ?? today),
        hasta: formatDateISO(dateBefore ?? today),
      },
    })
  }, [measurementPoints, puntoId, panelId, sedeId, dateAfter, dateBefore, today, navigate])

  const setSedeId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sede: String(id),
          panel: undefined,
          punto: undefined,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
        },
      })
    },
    [navigate, dateAfter, dateBefore, today]
  )

  const setPanelId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sede: String(sedeId),
          panel: String(id),
          punto: undefined,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
        },
      })
    },
    [navigate, sedeId, dateAfter, dateBefore, today]
  )

  const setPuntoId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sede: String(sedeId),
          panel: String(panelId),
          punto: String(id),
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
        },
      })
    },
    [navigate, sedeId, panelId, dateAfter, dateBefore, today]
  )

  const setDateRange = useCallback(
    (range: { startDate: Date | null; endDate: Date | null }) => {
      navigate({
        search: {
          sede: String(sedeId),
          panel: String(panelId),
          punto: String(puntoId),
          desde: formatDateISO(range.startDate),
          hasta: formatDateISO(range.endDate),
        },
      })
    },
    [navigate, sedeId, panelId, puntoId]
  )

  const setFavoritePoint = useCallback(
    (favoriteId: number) => {
      const favorite = favoritePoints.find((f) => f.id === favoriteId)
      if (!favorite) return
      setSelectedFavoriteId(favoriteId)
      navigate({
        search: {
          sede: String(favorite.energy_headquarter_id),
          panel: String(favorite.electrical_panel_id),
          punto: String(favorite.measurement_point),
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
        },
      })
    },
    [navigate, favoritePoints, dateAfter, dateBefore, today]
  )

  const isReady = !!sedeId && !!panelId && !!puntoId && !!dateAfter && !!dateBefore

  return {
    headquarters,
    panels,
    measurementPoints,
    currentHeadquarter,
    currentPanel,
    favoritePoints,
    sedeId,
    panelId,
    puntoId,
    dateAfter,
    dateBefore,
    selectedFavoriteId,
    setSedeId,
    setPanelId,
    setPuntoId,
    setDateRange,
    setFavoritePoint,
    isLoadingHeadquarters,
    isLoadingMeasurementPoints,
    isLoadingFavoritePoints,
    isReady,
  }
}
