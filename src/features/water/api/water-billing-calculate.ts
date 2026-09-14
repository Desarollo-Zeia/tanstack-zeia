import { apiFetch } from '@/lib/api-client'
import type { WaterBillingCalculateResponse } from '../types'

export function fetchWaterBillingCalculate(
  headquarterId: number,
  startDate: string,
  endDate: string
): Promise<WaterBillingCalculateResponse> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  })
  return apiFetch<WaterBillingCalculateResponse>(
    `/headquarter/${headquarterId}/water/billing-calculate/?${params.toString()}`
  )
}
