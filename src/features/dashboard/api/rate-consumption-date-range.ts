import { apiFetch } from '@/lib/api-client'
import type { RateConsumptionDateRangeResponse } from '../types'

export function fetchRateConsumptionDateRange(
  headquarterId: number,
  dateAfter: string,
  dateBefore: string
): Promise<RateConsumptionDateRangeResponse> {
  const params = new URLSearchParams({
    date_after: dateAfter,
    date_before: dateBefore,
  })
  return apiFetch<RateConsumptionDateRangeResponse>(
    `/headquarter/${headquarterId}/electrical_panel/rate-consumption/date-range?${params.toString()}`
  )
}
