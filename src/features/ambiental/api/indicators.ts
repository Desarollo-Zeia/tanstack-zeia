import { apiOcupacionalFetch } from '@/lib/ocupacional-api-client'
import type { IndicatorGraphResponse, RoomIndicatorGraphResponse } from '../types'

export interface FetchIndicatorGraphsParams {
  indicator: string
  unit: string
  dateAfter?: string
  dateBefore?: string
  interval?: number | null
}

export function fetchIndicatorGraphs(
  params: FetchIndicatorGraphsParams
): Promise<IndicatorGraphResponse> {
  const searchParams = new URLSearchParams({
    indicator: params.indicator,
    unit: params.unit,
  })

  if (params.dateAfter) {
    searchParams.set('date_after', params.dateAfter)
  }
  if (params.dateBefore) {
    searchParams.set('date_before', params.dateBefore)
  }
  if (params.interval !== undefined && params.interval !== null) {
    searchParams.set('interval', String(params.interval))
  }

  return apiOcupacionalFetch<IndicatorGraphResponse>(
    `/readings/api/rooms/indicators/graphs?${searchParams.toString()}`
  )
}

export interface FetchRoomIndicatorGraphParams {
  roomId: number
  indicator: string
  unit: string
  dateAfter?: string
  dateBefore?: string
  interval?: number | null
}

export function fetchRoomIndicatorGraph(
  params: FetchRoomIndicatorGraphParams
): Promise<RoomIndicatorGraphResponse> {
  const searchParams = new URLSearchParams({
    indicator: params.indicator,
    unit: params.unit,
  })

  if (params.dateAfter) {
    searchParams.set('date_after', params.dateAfter)
  }
  if (params.dateBefore) {
    searchParams.set('date_before', params.dateBefore)
  }
  if (params.interval !== undefined && params.interval !== null) {
    searchParams.set('interval', String(params.interval))
  }

  return apiOcupacionalFetch<RoomIndicatorGraphResponse>(
    `/readings/api/room/${params.roomId}/indicator/graph?${searchParams.toString()}`
  )
}
