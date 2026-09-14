import { apiFetch } from '@/lib/api-client'
import type { WaterBillingConceptsResponse } from '../types'

export function fetchWaterBillingConcepts(
  headquarterId: number
): Promise<WaterBillingConceptsResponse> {
  return apiFetch<WaterBillingConceptsResponse>(
    `/headquarter/${headquarterId}/water/billing-concepts/`
  )
}
