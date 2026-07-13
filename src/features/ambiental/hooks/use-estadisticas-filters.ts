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

function getDatesInRange(start: Date, end: Date): string[] {
  const dates: string[] = []
  const current = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const limit = new Date(end.getFullYear(), end.getMonth(), end.getDate())

  while (current <= limit) {
    dates.push(formatDateISO(current) as string)
    current.setDate(current.getDate() + 1)
  }
  return dates
}

function resolveOverride<T>(override: T | undefined, current: T): T {
  return override !== undefined ? override : current
}

export function useEstadisticasFilters() {
  const navigate = useNavigate({ from: '/ambiental/dashboard/analisis/estadisticas' })
  const search = useSearch({ from: '/ambiental/dashboard/analisis/estadisticas' })

  const sedeId = typeof search.sede === 'string' ? Number(search.sede) : null
  const salaId = typeof search.sala === 'string' ? Number(search.sala) : null
  const salaIds = useMemo(
    () => (search.salas ?? []).map(Number).filter((id) => !isNaN(id) && id > 0),
    [search.salas]
  )
  const indicador = typeof search.indicador === 'string' ? search.indicador : null
  const unidad = typeof search.unidad === 'string' ? search.unidad : null
  const dateAfter = parseDateSafe(typeof search.desde === 'string' ? search.desde : undefined)
  const dateBefore = parseDateSafe(typeof search.hasta === 'string' ? search.hasta : undefined)
  const selectedDates = useMemo(() => search.fechas ?? [], [search.fechas])
  const intervalo =
    typeof search.intervalo === 'string'
      ? search.intervalo === 'null'
        ? null
        : Number(search.intervalo)
      : null
  const viewMode: ViewMode =
    search.vista === 'by-date' || search.vista === 'combined' ? search.vista : 'by-room'

  const today = useMemo(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  }, [])

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

  const datesInRange = useMemo(() => {
    if (!dateAfter || !dateBefore) return []
    return getDatesInRange(dateAfter, dateBefore)
  }, [dateAfter, dateBefore])

  // Auto-select: sede → sala(s) → indicator → dates → interval → view mode
  useEffect(() => {
    if (headquarters.length === 0) return

    const targetSedeId = sedeId ?? headquarters[0]?.id ?? null
    if (!targetSedeId) return

    const targetRooms = allRooms.filter((r) => r.headquarter.id === targetSedeId)
    const firstIndicator = AVAILABLE_INDICATORS[0]
    const targetIndicator = indicador ?? firstIndicator.indicator
    const targetUnit = unidad ?? firstIndicator.unit
    const targetDateAfter = dateAfter ?? today
    const targetDateBefore = dateBefore ?? today
    const targetIntervalo = intervalo ?? null
    const targetViewMode = viewMode

    let targetSalaId: number | undefined = salaId ?? undefined
    let targetSalaIds: number[] | undefined = undefined
    let targetFechas: string[] | undefined = undefined

    if (targetViewMode === 'combined') {
      const validSalaIds = salaIds.filter((id) => targetRooms.some((r) => r.id === id))
      targetSalaIds =
        validSalaIds.length > 0 ? validSalaIds : targetRooms[0]?.id ? [targetRooms[0].id] : []
      targetSalaId = undefined

      const rangeDates = getDatesInRange(targetDateAfter, targetDateBefore)
      const validFechas = selectedDates.filter((d) => rangeDates.includes(d))
      targetFechas =
        validFechas.length > 0 ? validFechas : rangeDates.length > 0 ? [rangeDates[0]] : []
    } else {
      targetSalaId = salaId ?? targetRooms[0]?.id ?? undefined
      targetSalaIds = undefined
      targetFechas = undefined
    }

    const needsNavigation =
      sedeId !== targetSedeId ||
      salaId !== targetSalaId ||
      indicador !== targetIndicator ||
      unidad !== targetUnit ||
      dateAfter?.getTime() !== targetDateAfter.getTime() ||
      dateBefore?.getTime() !== targetDateBefore.getTime() ||
      intervalo !== targetIntervalo ||
      viewMode !== targetViewMode ||
      (targetViewMode === 'combined' &&
        (JSON.stringify(salaIds.sort((a, b) => a - b)) !==
          JSON.stringify((targetSalaIds ?? []).sort((a, b) => a - b)) ||
          JSON.stringify(selectedDates.slice().sort()) !==
            JSON.stringify((targetFechas ?? []).slice().sort())))

    if (!needsNavigation) return

    navigate({
      search: {
        sede: String(targetSedeId),
        sala: targetSalaId ? String(targetSalaId) : undefined,
        salas: targetViewMode === 'combined' ? targetSalaIds?.map(String) : undefined,
        indicador: targetIndicator,
        unidad: targetUnit,
        desde: formatDateISO(targetDateAfter),
        hasta: formatDateISO(targetDateBefore),
        fechas: targetViewMode === 'combined' ? targetFechas : undefined,
        intervalo: targetIntervalo === null ? 'null' : String(targetIntervalo),
        vista: targetViewMode,
      },
    })
  }, [
    headquarters,
    allRooms,
    sedeId,
    salaId,
    salaIds,
    indicador,
    unidad,
    dateAfter,
    dateBefore,
    selectedDates,
    intervalo,
    viewMode,
    today,
    navigate,
  ])

  const buildBaseSearch = useCallback(
    (overrides: {
      sede?: number | null
      sala?: number | null
      salas?: number[]
      indicador?: string | null
      unidad?: string | null
      dateAfter?: Date | null
      dateBefore?: Date | null
      fechas?: string[]
      intervalo?: number | null
      viewMode?: ViewMode
    }) => {
      const mode = overrides.viewMode ?? viewMode
      const isCombined = mode === 'combined'
      const targetSedeId = resolveOverride(overrides.sede, sedeId)
      const targetSalaId = resolveOverride(overrides.sala, salaId)
      const targetSalaIds = resolveOverride(
        overrides.salas,
        isCombined ? salaIds : salaId ? [salaId] : undefined
      )
      const targetIndicator = resolveOverride(overrides.indicador, indicador)
      const targetUnit = resolveOverride(overrides.unidad, unidad)
      const targetDateAfter = resolveOverride(overrides.dateAfter, dateAfter)
      const targetDateBefore = resolveOverride(overrides.dateBefore, dateBefore)
      const targetFechas = resolveOverride(
        overrides.fechas,
        isCombined ? selectedDates : undefined
      )
      const targetIntervalo = resolveOverride(overrides.intervalo, intervalo)

      return {
        sede: targetSedeId ? String(targetSedeId) : undefined,
        sala: !isCombined && targetSalaId ? String(targetSalaId) : undefined,
        salas: isCombined ? targetSalaIds?.map(String) : undefined,
        indicador: targetIndicator ?? undefined,
        unidad: targetUnit ?? undefined,
        desde: formatDateISO(targetDateAfter),
        hasta: formatDateISO(targetDateBefore),
        fechas: isCombined ? targetFechas : undefined,
        intervalo: targetIntervalo === null ? 'null' : String(targetIntervalo),
        vista: mode,
      }
    },
    [sedeId, salaId, salaIds, indicador, unidad, dateAfter, dateBefore, selectedDates, intervalo, viewMode]
  )

  const setSedeId = useCallback(
    (id: number) => {
      navigate({
        search: buildBaseSearch({
          sede: id,
          sala: null,
          salas: viewMode === 'combined' ? [] : undefined,
          fechas: viewMode === 'combined' ? [] : undefined,
        }),
      })
    },
    [navigate, buildBaseSearch, viewMode]
  )

  const setSalaId = useCallback(
    (id: number) => {
      navigate({
        search: buildBaseSearch({ sala: id, salas: [id] }),
      })
    },
    [navigate, buildBaseSearch]
  )

  const toggleSala = useCallback(
    (id: number) => {
      const next = salaIds.includes(id)
        ? salaIds.filter((s) => s !== id)
        : [...salaIds, id]
      navigate({
        search: buildBaseSearch({ salas: next }),
      })
    },
    [navigate, buildBaseSearch, salaIds]
  )

  const selectAllSalas = useCallback(() => {
    navigate({
      search: buildBaseSearch({ salas: rooms.map((r) => r.id) }),
    })
  }, [navigate, buildBaseSearch, rooms])

  const clearSalas = useCallback(() => {
    navigate({
      search: buildBaseSearch({ salas: [] }),
    })
  }, [navigate, buildBaseSearch])

  const setIndicator = useCallback(
    (indicatorKey: string, unitKey: string) => {
      navigate({
        search: buildBaseSearch({ indicador: indicatorKey, unidad: unitKey }),
      })
    },
    [navigate, buildBaseSearch]
  )

  const setDateRange = useCallback(
    (range: { startDate: Date | null; endDate: Date | null }) => {
      const start = range.startDate ?? dateAfter ?? today
      const end = range.endDate ?? dateBefore ?? today
      const newRangeDates = getDatesInRange(start, end)
      const validFechas =
        viewMode === 'combined'
          ? selectedDates.filter((d) => newRangeDates.includes(d))
          : undefined
      navigate({
        search: buildBaseSearch({
          dateAfter: start,
          dateBefore: end,
          fechas: validFechas,
        }),
      })
    },
    [navigate, buildBaseSearch, dateAfter, dateBefore, selectedDates, viewMode, today]
  )

  const toggleFecha = useCallback(
    (date: string) => {
      const next = selectedDates.includes(date)
        ? selectedDates.filter((d) => d !== date)
        : [...selectedDates, date]
      navigate({
        search: buildBaseSearch({ fechas: next }),
      })
    },
    [navigate, buildBaseSearch, selectedDates]
  )

  const selectAllFechas = useCallback(() => {
    navigate({
      search: buildBaseSearch({ fechas: datesInRange }),
    })
  }, [navigate, buildBaseSearch, datesInRange])

  const clearFechas = useCallback(() => {
    navigate({
      search: buildBaseSearch({ fechas: [] }),
    })
  }, [navigate, buildBaseSearch])

  const setIntervalo = useCallback(
    (val: number | null) => {
      navigate({
        search: buildBaseSearch({ intervalo: val }),
      })
    },
    [navigate, buildBaseSearch]
  )

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      const isCombined = mode === 'combined'
      const wasCombined = viewMode === 'combined'

      let nextSala: number | null | undefined = salaId ?? undefined
      let nextSalas: number[] | undefined = undefined
      let nextFechas: string[] | undefined = undefined

      if (isCombined && !wasCombined) {
        nextSala = null
        nextSalas = salaId ? [salaId] : rooms[0]?.id ? [rooms[0].id] : []
        nextFechas = datesInRange.length > 0 ? [datesInRange[0]] : []
      } else if (!isCombined && wasCombined) {
        nextSala = salaIds[0] ?? rooms[0]?.id ?? undefined
        nextSalas = undefined
        nextFechas = undefined
      }

      navigate({
        search: buildBaseSearch({
          viewMode: mode,
          sala: nextSala,
          salas: nextSalas,
          fechas: nextFechas,
        }),
      })
    },
    [navigate, buildBaseSearch, viewMode, salaId, salaIds, rooms, datesInRange]
  )

  const currentHeadquarter = useMemo(() => {
    return headquarters.find((h) => h.id === sedeId) ?? null
  }, [headquarters, sedeId])

  const currentRoom = useMemo(() => {
    return rooms.find((r) => r.id === salaId) ?? null
  }, [rooms, salaId])

  const isReady =
    !!sedeId &&
    !!indicador &&
    !!unidad &&
    !!dateAfter &&
    !!dateBefore &&
    (viewMode !== 'combined' || (salaIds.length > 0 && selectedDates.length > 0))

  return {
    // Data
    headquarters,
    rooms,
    currentHeadquarter,
    currentRoom,
    datesInRange,

    // State (from URL)
    sedeId,
    salaId,
    salaIds,
    indicador,
    unidad,
    dateAfter,
    dateBefore,
    selectedDates,
    intervalo,
    viewMode,

    // Handlers
    setSedeId,
    setSalaId,
    toggleSala,
    selectAllSalas,
    clearSalas,
    setIndicator,
    setDateRange,
    toggleFecha,
    selectAllFechas,
    clearFechas,
    setIntervalo,
    setViewMode,

    // Status
    isLoadingHeadquarters,
    isLoadingRooms,
    isReady,
  }
}
