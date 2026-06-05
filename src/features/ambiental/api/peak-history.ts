import { apiOcupacionalFetch } from '@/lib/ocupacional-api-client'
import type { PeakHistoryResponse } from '../types'

export interface FetchPeakHistoryParams {
  indicator: string
  unit: string
  dateAfter: string
  dateBefore: string
}

export function fetchPeakHistory(
  params: FetchPeakHistoryParams
): Promise<PeakHistoryResponse> {
  const searchParams = new URLSearchParams({
    indicator: params.indicator,
    unit: params.unit,
    date_after: params.dateAfter,
    date_before: params.dateBefore,
  })

  return apiOcupacionalFetch<PeakHistoryResponse>(
    `/readings/api/rooms/indicators/metrics/high/history?${searchParams.toString()}`
  )
}
