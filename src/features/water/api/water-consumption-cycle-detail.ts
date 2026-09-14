import { apiFetch } from '@/lib/api-client'
import type { WaterConsumptionCycleDetail } from '../types'

export function fetchWaterConsumptionCycleDetail(
  headquarterId: number
): Promise<WaterConsumptionCycleDetail> {
  return apiFetch<WaterConsumptionCycleDetail>(
    `/headquarter/${headquarterId}/water/consumption-cycle/detail/`
  )
}
