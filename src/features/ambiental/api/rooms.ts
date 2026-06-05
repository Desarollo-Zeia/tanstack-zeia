import { apiOcupacionalFetch } from '@/lib/ocupacional-api-client'
import type { RoomsResponse } from '../types'

export const ROOMS_PAGE_SIZE = 10

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
