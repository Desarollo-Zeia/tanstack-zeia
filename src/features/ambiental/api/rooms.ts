import { apiOcupacionalFetch } from '@/lib/ocupacional-api-client'
import type { Room, RoomsResponse } from '../types'

export const ROOMS_PAGE_SIZE = 10

const ROOMS_FETCH_CHUNK = 100

export interface FetchOcupacionalRoomsParams {
  limit: number
  offset: number
}

export function fetchOcupacionalRooms(
  params: FetchOcupacionalRoomsParams
): Promise<RoomsResponse> {
  const searchParams = new URLSearchParams({
    limit: String(params.limit),
    offset: String(params.offset),
  })
  return apiOcupacionalFetch<RoomsResponse>(
    `/enterprise/api/enterprise/room-list/?${searchParams.toString()}`
  )
}

export async function fetchAllOcupacionalRooms(): Promise<Room[]> {
  const all: Room[] = []
  let offset = 0
  let total = Number.POSITIVE_INFINITY

  while (all.length < total) {
    const response = await fetchOcupacionalRooms({
      limit: ROOMS_FETCH_CHUNK,
      offset,
    })

    total = response.count
    if (response.results.length === 0) break

    all.push(...response.results)
    offset += response.results.length
  }

  return all
}
