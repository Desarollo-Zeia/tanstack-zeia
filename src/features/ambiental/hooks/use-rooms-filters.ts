import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { fetchOcupacionalHeadquarters } from '../api/headquarters'
import { ROOMS_PAGE_SIZE } from '../api/rooms'

export function useRoomsFilters() {
  const navigate = useNavigate({ from: '/ambiental/dashboard/rooms' })
  const search = useSearch({ from: '/ambiental/dashboard/rooms' })

  const sedeId = typeof search.sede === 'string' ? Number(search.sede) : null
  const page = typeof search.pagina === 'string' ? Number(search.pagina) : 1

  const { data: headquartersData, isLoading: isLoadingHeadquarters } = useQuery({
    queryKey: ['ocupacional-headquarters'],
    queryFn: fetchOcupacionalHeadquarters,
  })

  const headquarters = useMemo(
    () => headquartersData?.results ?? [],
    [headquartersData]
  )

  const currentHeadquarter = useMemo(
    () => headquarters.find((h) => h.id === sedeId) ?? null,
    [headquarters, sedeId]
  )

  const hasAutoSelected = useRef(false)

  useEffect(() => {
    if (sedeId === null) {
      hasAutoSelected.current = false
    }
  }, [sedeId])

  useEffect(() => {
    if (hasAutoSelected.current) return
    if (headquarters.length === 0) return

    const targetSedeId = sedeId ?? headquarters[0]?.id ?? null
    if (!targetSedeId) return

    if (sedeId !== targetSedeId) {
      hasAutoSelected.current = true
      navigate({
        search: {
          sede: String(targetSedeId),
          pagina: '1',
        },
      })
    }
  }, [headquarters, sedeId, navigate])

  const setSedeId = useCallback(
    (id: number) => {
      navigate({
        search: {
          sede: String(id),
          pagina: '1',
        },
      })
    },
    [navigate]
  )

  const setPage = useCallback(
    (newPage: number) => {
      navigate({
        search: {
          sede: sedeId ? String(sedeId) : undefined,
          pagina: String(newPage),
        },
      })
    },
    [navigate, sedeId]
  )

  const offset = (page - 1) * ROOMS_PAGE_SIZE

  const isReady = !!sedeId

  return {
    headquarters,
    currentHeadquarter,
    sedeId,
    page,
    offset,
    pageSize: ROOMS_PAGE_SIZE,
    setSedeId,
    setPage,
    isLoadingHeadquarters,
    isReady,
  }
}
