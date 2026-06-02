import { apiFetch } from '@/lib/api-client'
import type { RateConsumptionResponse } from '../types'

export function fetchRateConsumption(headquarterId: number): Promise<RateConsumptionResponse> {
  return apiFetch<RateConsumptionResponse>(
    `/headquarter/${headquarterId}/electrical_panel/rate-consumption`
  )
}
