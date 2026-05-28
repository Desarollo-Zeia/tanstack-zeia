import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchHeadquarters } from '../api/headquarters'
import { fetchDeviceMeasurementPointsList } from '../api/measurement-points'
import { formatDateISO, parseDateSafe } from '@/lib/date-utils'

export function useDesbalanceFilters() {
  const navigate = useNavigate({ from: '/energia/dashboard/desbalance' })
  const search = useSearch({ from: '/energia/dashboard/desbalance' })

  const sedeId = typeof search.sede === 'string' ? Number(search.sede) : null
  const panelId = typeof search.panel === 'string' ? Number(search.panel) : null
  const puntoId = typeof search.punto === 'string' ? Number(search.punto) : null
  const dateAfter = parseDateSafe(typeof search.desde === 'string' ? search.desde : undefined)
  const dateBefore = parseDateSafe(typeof search.hasta === 'string' ? search.hasta : undefined)

  const today = useMemo(() => new Date(), [])

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

    const targetPuntoId =
      puntoId ??
      (measurementPoints.length > 0 ? measurementPoints[0]?.id : null) ??
      null

    const needsNavigation =
      sedeId !== targetSedeId ||
      panelId !== targetPanelId ||
      dateAfter?.getTime() !== targetDateAfter.getTime() ||
      dateBefore?.getTime() !== targetDateBefore.getTime() ||
      puntoId !== targetPuntoId

    if (needsNavigation) {
      hasAutoSelected.current = true
      navigate({
        search: {
          sede: String(targetSedeId),
          panel: targetPanelId ? String(targetPanelId) : undefined,
          punto: targetPuntoId ? String(targetPuntoId) : undefined,
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
    dateAfter,
    dateBefore,
    today,
    navigate,
    measurementPoints,
  ])

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

  const isReady = !!sedeId && !!panelId && !!puntoId && !!dateAfter && !!dateBefore

  return {
    headquarters,
    panels,
    measurementPoints,
    currentHeadquarter,
    currentPanel,
    sedeId,
    panelId,
    puntoId,
    dateAfter,
    dateBefore,
    setSedeId,
    setPanelId,
    setPuntoId,
    setDateRange,
    isLoadingHeadquarters,
    isLoadingMeasurementPoints,
    isReady,
  }
}
