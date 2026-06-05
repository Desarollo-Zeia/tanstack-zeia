import { apiOcupacionalFetch } from '@/lib/ocupacional-api-client'
import type { RoomReadingsResponse } from '../types'

export interface FetchRoomReadingsParams {
  roomId: number
  indicator: string
  unit: string
  dateAfter: string
  dateBefore: string
  page?: number
}

export function fetchRoomReadings(
  params: FetchRoomReadingsParams
): Promise<RoomReadingsResponse> {
  const searchParams = new URLSearchParams({
    indicator: params.indicator,
    unit: params.unit,
    date_after: params.dateAfter,
    date_before: params.dateBefore,
  })

  if (params.page && params.page > 1) {
    searchParams.set('page', String(params.page))
  }

  return apiOcupacionalFetch<RoomReadingsResponse>(
    `/readings/api/room/${params.roomId}/indicator?${searchParams.toString()}`
  )
}
