import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchHeadquarters } from '../api/headquarters'
import { fetchDeviceMeasurementPointsList } from '../api/measurement-points'
import { formatDateISO, parseDateSafe } from '@/lib/date-utils'

const NO_SCROLL = { resetScroll: false, hashScrollIntoView: false } as const

export function useDesbalanceAlertasFilters() {
  const navigate = useNavigate({ from: '/energia/dashboard/desbalance/alertas' })
  const search = useSearch({ from: '/energia/dashboard/desbalance/alertas' })

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
        ...NO_SCROLL,
      })
    }
  }, [headquarters, sedeId, panelId, dateAfter, dateBefore, today, navigate])

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
      ...NO_SCROLL,
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
        ...NO_SCROLL,
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
        ...NO_SCROLL,
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
        ...NO_SCROLL,
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
        ...NO_SCROLL,
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
