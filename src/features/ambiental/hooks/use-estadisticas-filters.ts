import { useEffect, useCallback, useMemo } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchOcupacionalHeadquarters } from '../api/headquarters'
import { fetchOcupacionalRooms } from '../api/rooms'
import { formatDateISO, parseDateSafe } from '@/lib/date-utils'
import type { ViewMode } from '../types'

export const AVAILABLE_INDICATORS = [
  { indicator: 'CO2', unit: 'PPM' },
  { indicator: 'HUMIDITY', unit: 'PERCENT' },
  { indicator: 'TEMPERATURE', unit: 'CELSIUS' },
] as const

export const INTERVAL_OPTIONS = [
  { value: null, label: '5 minutos' },
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 240, label: '4 horas' },
  { value: 360, label: '6 horas' },
  { value: 720, label: '12 horas' },
  { value: 1440, label: '24 horas' },
] as const

export type IndicatorKey = (typeof AVAILABLE_INDICATORS)[number]['indicator']

export function useEstadisticasFilters() {
  const navigate = useNavigate({ from: '/ambiental/dashboard/analisis/estadisticas' })
  const search = useSearch({ from: '/ambiental/dashboard/analisis/estadisticas' })

  const sedeId = typeof search.sede === 'string' ? Number(search.sede) : null
  const salaId = typeof search.sala === 'string' ? Number(search.sala) : null
  const indicador = typeof search.indicador === 'string' ? search.indicador : null
  const unidad = typeof search.unidad === 'string' ? search.unidad : null
  const dateAfter = parseDateSafe(typeof search.desde === 'string' ? search.desde : undefined)
  const dateBefore = parseDateSafe(typeof search.hasta === 'string' ? search.hasta : undefined)
  const intervalo =
    typeof search.intervalo === 'string'
      ? search.intervalo === 'null'
        ? null
        : Number(search.intervalo)
      : null
  const viewMode: ViewMode = search.vista === 'by-date' ? 'by-date' : 'by-room'

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

  // Auto-select: sede → sala → indicator → dates → interval
  useEffect(() => {
    if (headquarters.length === 0) return

    const targetSedeId = sedeId ?? headquarters[0]?.id ?? null
    if (!targetSedeId) return

    const targetRooms = allRooms.filter((r) => r.headquarter.id === targetSedeId)
    const targetSalaId = salaId ?? targetRooms[0]?.id ?? null

    const firstIndicator = AVAILABLE_INDICATORS[0]
    const targetIndicator = indicador ?? firstIndicator.indicator
    const targetUnit = unidad ?? firstIndicator.unit
    const targetDateAfter = dateAfter ?? today
    const targetDateBefore = dateBefore ?? today
    const targetIntervalo = intervalo ?? null

    const needsNavigation =
      sedeId !== targetSedeId ||
      salaId !== targetSalaId ||
      indicador !== targetIndicator ||
      unidad !== targetUnit ||
      dateAfter?.getTime() !== targetDateAfter.getTime() ||
      dateBefore?.getTime() !== targetDateBefore.getTime() ||
      intervalo !== targetIntervalo

    if (needsNavigation) {
      navigate({
        search: {
          sede: String(targetSedeId),
          sala: targetSalaId ? String(targetSalaId) : undefined,
          indicador: targetIndicator,
          unidad: targetUnit,
          desde: formatDateISO(targetDateAfter),
          hasta: formatDateISO(targetDateBefore),
          intervalo: targetIntervalo === null ? 'null' : String(targetIntervalo),
          vista: viewMode,
        },
      })
    }
  }, [
    headquarters,
    allRooms,
    sedeId,
    salaId,
    indicador,
    unidad,
    dateAfter,
    dateBefore,
    intervalo,
    viewMode,
    today,
    navigate,
  ])

  const setSedeId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sede: String(id),
          sala: undefined,
          indicador: indicador ?? undefined,
          unidad: unidad ?? undefined,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
          intervalo: intervalo === null ? 'null' : String(intervalo),
          vista: viewMode,
        },
      })
    },
    [navigate, indicador, unidad, dateAfter, dateBefore, intervalo, viewMode, today]
  )

  const setSalaId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sede: String(sedeId),
          sala: String(id),
          indicador: indicador ?? undefined,
          unidad: unidad ?? undefined,
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
          intervalo: intervalo === null ? 'null' : String(intervalo),
          vista: viewMode,
        },
      })
    },
    [navigate, sedeId, indicador, unidad, dateAfter, dateBefore, intervalo, viewMode, today]
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
          intervalo: intervalo === null ? 'null' : String(intervalo),
          vista: viewMode,
        },
      })
    },
    [navigate, sedeId, salaId, dateAfter, dateBefore, intervalo, viewMode, today]
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
          intervalo: intervalo === null ? 'null' : String(intervalo),
          vista: viewMode,
        },
      })
    },
    [navigate, sedeId, salaId, indicador, unidad, intervalo, viewMode]
  )

  const setIntervalo = useCallback(
    (val: number | null) => {
      navigate({
        search: {
          sede: String(sedeId),
          sala: String(salaId),
          indicador: indicador ?? undefined,
          unidad: unidad ?? undefined,
          desde: formatDateISO(dateAfter),
          hasta: formatDateISO(dateBefore),
          intervalo: val === null ? 'null' : String(val),
          vista: viewMode,
        },
      })
    },
    [navigate, sedeId, salaId, indicador, unidad, dateAfter, dateBefore, viewMode]
  )

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      navigate({
        search: {
          sede: String(sedeId),
          sala: String(salaId),
          indicador: indicador ?? undefined,
          unidad: unidad ?? undefined,
          desde: formatDateISO(dateAfter),
          hasta: formatDateISO(dateBefore),
          intervalo: intervalo === null ? 'null' : String(intervalo),
          vista: mode,
        },
      })
    },
    [navigate, sedeId, salaId, indicador, unidad, dateAfter, dateBefore, intervalo]
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
    !!dateBefore

  return {
    // Data
    headquarters,
    rooms,
    currentHeadquarter,
    currentRoom,

    // State (from URL)
    sedeId,
    salaId,
    indicador,
    unidad,
    dateAfter,
    dateBefore,
    intervalo,
    viewMode,

    // Handlers
    setSedeId,
    setSalaId,
    setIndicator,
    setDateRange,
    setIntervalo,
    setViewMode,

    // Status
    isLoadingHeadquarters,
    isLoadingRooms,
    isReady,
  }
}
