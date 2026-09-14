import { apiFetch } from '@/lib/api-client'
import type { WaterBillingCyclesResponse } from '../types'

export function fetchWaterBillingCycles(
  headquarterId: number
): Promise<WaterBillingCyclesResponse> {
  return apiFetch<WaterBillingCyclesResponse>(
    `/headquarter/${headquarterId}/water/billing-cycles/`
  )
}
