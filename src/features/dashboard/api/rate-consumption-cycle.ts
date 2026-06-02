import { apiFetch } from '@/lib/api-client'
import type { RateConsumptionCycleResponse } from '../types'

export function fetchRateConsumptionCycle(
  headquarterId: number
): Promise<RateConsumptionCycleResponse> {
  return apiFetch<RateConsumptionCycleResponse>(
    `/headquarter/${headquarterId}/electrical_panel/rate-consumption/cycle`
  )
}
