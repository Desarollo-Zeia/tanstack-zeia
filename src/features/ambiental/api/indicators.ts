import { apiOcupacionalFetch } from '@/lib/ocupacional-api-client'
import type { IndicatorGraphResponse } from '../types'

export interface FetchIndicatorGraphsParams {
  indicator: string
  unit: string
}

export function fetchIndicatorGraphs(
  params: FetchIndicatorGraphsParams
): Promise<IndicatorGraphResponse> {
  const searchParams = new URLSearchParams({
    indicator: params.indicator,
    unit: params.unit,
  })
  return apiOcupacionalFetch<IndicatorGraphResponse>(
    `/readings/api/rooms/indicators/graphs?${searchParams.toString()}`
  )
}
