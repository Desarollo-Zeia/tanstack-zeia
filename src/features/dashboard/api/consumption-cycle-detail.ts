import { apiFetch } from '@/lib/api-client'
import type { ConsumptionCycleDetailResponse } from '../types'

export function fetchConsumptionCycleDetail(
  headquarterId: number
): Promise<ConsumptionCycleDetailResponse> {
  return apiFetch<ConsumptionCycleDetailResponse>(
    `/headquarter/${headquarterId}/consumption-cycle/detail/`
  )
}
