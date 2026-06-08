import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { formatDateISO, parseDateSafe } from '@/lib/date-utils'
import { fetchOcupacionalRooms } from '../api/rooms'

export function useAlertsFilters() {
  const navigate = useNavigate({ from: '/ambiental/dashboard/alertas' })
  const search = useSearch({ from: '/ambiental/dashboard/alertas' })

  const roomId = typeof search.sala === 'string' ? Number(search.sala) : null
  const indicador = typeof search.indicador === 'string' ? search.indicador : null
  const dateAfter = parseDateSafe(typeof search.desde === 'string' ? search.desde : undefined)
  const dateBefore = parseDateSafe(typeof search.hasta === 'string' ? search.hasta : undefined)
  const page = typeof search.pagina === 'string' ? Number(search.pagina) : 1

  const today = useMemo(() => new Date(), [])
  const sevenDaysAgo = useMemo(() => {
    const d = new Date(today)
    d.setDate(d.getDate() - 7)
    return d
  }, [today])

  const { data: roomsData, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['ocupacional-rooms-all'],
    queryFn: () => fetchOcupacionalRooms({ limit: 1000, offset: 0 }),
  })

  const rooms = useMemo(() => roomsData?.results ?? [], [roomsData])
  const currentRoom = useMemo(
    () => rooms.find((r) => r.id === roomId) ?? null,
    [rooms, roomId]
  )

  const hasAutoSelected = useRef(false)

  useEffect(() => {
    if (roomId === null) {
      hasAutoSelected.current = false
    }
  }, [roomId])

  useEffect(() => {
    if (hasAutoSelected.current) return
    if (rooms.length === 0) return

    const targetRoomId = roomId ?? rooms[0]?.id ?? null
    const targetIndicador = indicador ?? 'CO2'
    const targetDateAfter = dateAfter ?? sevenDaysAgo
    const targetDateBefore = dateBefore ?? today
    const targetPage = page >= 1 ? page : 1

    const needsNavigation =
      roomId !== targetRoomId ||
      indicador !== targetIndicador ||
      dateAfter?.getTime() !== targetDateAfter.getTime() ||
      dateBefore?.getTime() !== targetDateBefore.getTime() ||
      page !== targetPage

    if (!needsNavigation) return
    if (!targetRoomId) return

    hasAutoSelected.current = true
    navigate({
      search: {
        sala: String(targetRoomId),
        indicador: targetIndicador,
        desde: formatDateISO(targetDateAfter),
        hasta: formatDateISO(targetDateBefore),
        pagina: String(targetPage),
      },
    })
  }, [rooms, roomId, indicador, dateAfter, dateBefore, page, today, sevenDaysAgo, navigate])

  const setRoomId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sala: String(id),
          indicador: indicador ?? undefined,
          desde: formatDateISO(dateAfter ?? sevenDaysAgo),
          hasta: formatDateISO(dateBefore ?? today),
          pagina: '1',
        },
      })
    },
    [navigate, indicador, dateAfter, dateBefore, today, sevenDaysAgo]
  )

  const setIndicator = useCallback(
    (indicatorKey: string) => {
      navigate({
        search: {
          sala: roomId ? String(roomId) : undefined,
          indicador: indicatorKey,
          desde: formatDateISO(dateAfter),
          hasta: formatDateISO(dateBefore),
          pagina: '1',
        },
      })
    },
    [navigate, roomId, dateAfter, dateBefore]
  )

  const setDateRange = useCallback(
    (range: { startDate: Date | null; endDate: Date | null }) => {
      navigate({
        search: {
          sala: roomId ? String(roomId) : undefined,
          indicador: indicador ?? undefined,
          desde: formatDateISO(range.startDate),
          hasta: formatDateISO(range.endDate),
          pagina: '1',
        },
      })
    },
    [navigate, roomId, indicador]
  )

  const setPage = useCallback(
    (newPage: number) => {
      navigate({
        search: {
          sala: roomId ? String(roomId) : undefined,
          indicador: indicador ?? undefined,
          desde: formatDateISO(dateAfter),
          hasta: formatDateISO(dateBefore),
          pagina: String(newPage),
        },
      })
    },
    [navigate, roomId, indicador, dateAfter, dateBefore]
  )

  const isReady = !!roomId && !!indicador && !!dateAfter && !!dateBefore && page >= 1

  return {
    rooms,
    currentRoom,
    roomId,
    indicador,
    page,
    dateAfter,
    dateBefore,
    setRoomId,
    setIndicator,
    setDateRange,
    setPage,
    isLoadingRooms,
    isReady,
  }
}
