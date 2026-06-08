import { apiOcupacionalFetch } from '@/lib/ocupacional-api-client'
import type { AlertsResponse } from '../types'

export interface FetchAlertsParams {
  roomId: number
  indicator?: string
  dateAfter?: string
  dateBefore?: string
  page?: number
}

export function fetchAlerts(params: FetchAlertsParams): Promise<AlertsResponse> {
  const searchParams = new URLSearchParams()

  if (params.indicator) {
    searchParams.set('indicator', params.indicator)
  }
  if (params.dateAfter) {
    searchParams.set('date_after', params.dateAfter)
  }
  if (params.dateBefore) {
    searchParams.set('date_before', params.dateBefore)
  }
  if (params.page && params.page > 1) {
    searchParams.set('page', String(params.page))
  }

  const queryString = searchParams.toString()
  const path = `/alerts/api/room/${params.roomId}/alerts/${queryString ? `?${queryString}` : ''}`

  return apiOcupacionalFetch<AlertsResponse>(path)
}
