import { useEffect, useCallback, useMemo, useRef } from 'react'
import { useSearch, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchHeadquarters } from '../api/headquarters'
import { formatDateISO, parseDateSafe } from '@/lib/date-utils'

export function useMonitoreoFilters() {
  const navigate = useNavigate({ from: '/energia/dashboard/monitoreo' })
  const search = useSearch({ from: '/energia/dashboard/monitoreo' })

  const sedeId = typeof search.sede === 'string' ? Number(search.sede) : null
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

  const hasAutoSelected = useRef(false)

  useEffect(() => {
    if (hasAutoSelected.current) return
    if (headquarters.length === 0) return

    const firstActiveSede = headquarters.find((h) => h.is_active) ?? headquarters[0]
    const targetSedeId = sedeId ?? firstActiveSede?.id ?? null

    if (!targetSedeId) return

    const targetDateAfter = dateAfter ?? today
    const targetDateBefore = dateBefore ?? today

    const needsNavigation =
      sedeId !== targetSedeId ||
      dateAfter?.getTime() !== targetDateAfter.getTime() ||
      dateBefore?.getTime() !== targetDateBefore.getTime()

    if (needsNavigation) {
      hasAutoSelected.current = true
      navigate({
        search: {
          sede: String(targetSedeId),
          desde: formatDateISO(targetDateAfter),
          hasta: formatDateISO(targetDateBefore),
        },
      })
    }
  }, [headquarters, sedeId, dateAfter, dateBefore, today, navigate])

  const setSedeId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sede: String(id),
          desde: formatDateISO(dateAfter ?? today),
          hasta: formatDateISO(dateBefore ?? today),
        },
      })
    },
    [navigate, dateAfter, dateBefore, today]
  )

  const setDateRange = useCallback(
    (range: { startDate: Date | null; endDate: Date | null }) => {
      navigate({
        search: {
          sede: String(sedeId),
          desde: formatDateISO(range.startDate),
          hasta: formatDateISO(range.endDate),
        },
      })
    },
    [navigate, sedeId]
  )

  const isReady = !!sedeId && !!dateAfter && !!dateBefore

  return {
    headquarters,
    currentHeadquarter,
    sedeId,
    dateAfter,
    dateBefore,
    setSedeId,
    setDateRange,
    isLoadingHeadquarters,
    isReady,
  }
}
