import { useEffect, useCallback, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchOcupacionalHeadquarters } from '../api/headquarters'
import { fetchOcupacionalRooms } from '../api/rooms'
import { fetchRoomDetail } from '../api/room-detail'
import { formatDateISO, parseDateSafe } from '@/lib/date-utils'

export function useIndicadoresFilters() {
  const navigate = useNavigate({ from: '/ambiental/dashboard/analisis/indicadores' })
  const search = useSearch({ from: '/ambiental/dashboard/analisis/indicadores' })

  // Read state directly from URL
  const sedeId = typeof search.sede === 'string' ? Number(search.sede) : null
  const salaId = typeof search.sala === 'string' ? Number(search.sala) : null
  const indicador = typeof search.indicador === 'string' ? search.indicador : null
  const unidad = typeof search.unidad === 'string' ? search.unidad : null
  const dateAfter = parseDateSafe(typeof search.desde === 'string' ? search.desde : undefined)
  const dateBefore = parseDateSafe(typeof search.hasta === 'string' ? search.hasta : undefined)
  const page = typeof search.pagina === 'string' ? Number(search.pagina) : 1

  const today = useMemo(() => new Date(), [])

  // Fetch headquarters
  const { data: headquartersData, isLoading: isLoadingHeadquarters } = useQuery({
    queryKey: ['ocupacional-headquarters'],
    queryFn: fetchOcupacionalHeadquarters,
  })

  const headquarters = useMemo(() => headquartersData?.results ?? [], [headquartersData])

  // Fetch rooms (large limit to get all for filtering by headquarter)
  const { data: roomsData, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['ocupacional-rooms-all', sedeId],
    queryFn: () => fetchOcupacionalRooms({ limit: 1000, offset: 0 }),
    enabled: !!sedeId,
  })

  const allRooms = useMemo(() => roomsData?.results ?? [], [roomsData])

  const rooms = useMemo(() => {
    return allRooms.filter((r) => r.headquarter.id === sedeId)
  }, [allRooms, sedeId])

  // Fetch room detail to get indicators_activated
  const { data: roomDetail, isLoading: isLoadingRoomDetail } = useQuery({
    queryKey: ['ocupacional-room-detail', salaId],
    queryFn: () => {
      if (!salaId) throw new Error('Missing roomId')
      return fetchRoomDetail(salaId)
    },
    enabled: !!salaId,
  })

  const availableIndicators = useMemo(() => {
    return roomDetail?.indicators_activated ?? []
  }, [roomDetail])

  // Auto-select: sede → sala → indicador → dates → page
  useEffect(() => {
    if (headquarters.length === 0) return

    const targetSedeId = sedeId ?? headquarters[0]?.id ?? null
    if (!targetSedeId) return

    const targetRooms = allRooms.filter((r) => r.headquarter.id === targetSedeId)
    const targetSalaId = salaId ?? targetRooms[0]?.id ?? null

    const targetIndicator =
      indicador ?? roomDetail?.indicators_activated[0]?.indicator ?? null
    const targetUnit =
      unidad ?? roomDetail?.indicators_activated[0]?.unit ?? null

    const targetDateAfter = dateAfter ?? today
    const targetDateBefore = dateBefore ?? today
    const targetPage = page >= 1 ? page : 1

    const needsNavigation =
      sedeId !== targetSedeId ||
      salaId !== targetSalaId ||
      indicador !== targetIndicator ||
      unidad !== targetUnit ||
      dateAfter?.getTime() !== targetDateAfter.getTime() ||
      dateBefore?.getTime() !== targetDateBefore.getTime() ||
      page !== targetPage

    if (needsNavigation) {
      navigate({
        search: {
          sede: String(targetSedeId),
          sala: targetSalaId ? String(targetSalaId) : undefined,
          indicador: targetIndicator ?? undefined,
          unidad: targetUnit ?? undefined,
          desde: formatDateISO(targetDateAfter),
          hasta: formatDateISO(targetDateBefore),
          pagina: String(targetPage),
        },
      })
    }
  }, [
    headquarters,
    allRooms,
    roomDetail,
    sedeId,
    salaId,
    indicador,
    unidad,
    dateAfter,
    dateBefore,
    page,
    today,
    navigate,
  ])

  // Handlers
  const setSedeId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sede: String(id),
          sala: undefined,
          indicador: undefined,
          unidad: undefined,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
          pagina: '1',
        },
      })
    },
    [navigate, dateAfter, dateBefore, today]
  )

  const setSalaId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sede: String(sedeId),
          sala: String(id),
          indicador: undefined,
          unidad: undefined,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
          pagina: '1',
        },
      })
    },
    [navigate, sedeId, dateAfter, dateBefore, today]
  )

  const setIndicator = useCallback(
    (indicatorKey: string, unitKey: string) => {
      navigate({
        search: {
          sede: String(sedeId),
          sala: String(salaId),
          indicador: indicatorKey,
          unidad: unitKey,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
          pagina: '1',
        },
      })
    },
    [navigate, sedeId, salaId, dateAfter, dateBefore, today]
  )

  const setDateRange = useCallback(
    (range: { startDate: Date | null; endDate: Date | null }) => {
      navigate({
        search: {
          sede: String(sedeId),
          sala: String(salaId),
          indicador: indicador ?? undefined,
          unidad: unidad ?? undefined,
          desde: formatDateISO(range.startDate),
          hasta: formatDateISO(range.endDate),
          pagina: '1',
        },
      })
    },
    [navigate, sedeId, salaId, indicador, unidad]
  )

  const setPage = useCallback(
    (newPage: number) => {
      navigate({
        search: {
          sede: String(sedeId),
          sala: String(salaId),
          indicador: indicador ?? undefined,
          unidad: unidad ?? undefined,
          desde: formatDateISO(dateAfter),
          hasta: formatDateISO(dateBefore),
          pagina: String(newPage),
        },
      })
    },
    [navigate, sedeId, salaId, indicador, unidad, dateAfter, dateBefore]
  )

  const currentHeadquarter = useMemo(() => {
    return headquarters.find((h) => h.id === sedeId) ?? null
  }, [headquarters, sedeId])

  const currentRoom = useMemo(() => {
    return rooms.find((r) => r.id === salaId) ?? null
  }, [rooms, salaId])

  const isReady =
    !!sedeId &&
    !!salaId &&
    !!indicador &&
    !!unidad &&
    !!dateAfter &&
    !!dateBefore &&
    page >= 1

  return {
    // Data
    headquarters,
    rooms,
    currentHeadquarter,
    currentRoom,
    roomDetail,
    availableIndicators,

    // State (from URL)
    sedeId,
    salaId,
    indicador,
    unidad,
    dateAfter,
    dateBefore,
    page,

    // Handlers
    setSedeId,
    setSalaId,
    setIndicator,
    setDateRange,
    setPage,

    // Status
    isLoadingHeadquarters,
    isLoadingRooms,
    isLoadingRoomDetail,
    isReady,
  }
}
