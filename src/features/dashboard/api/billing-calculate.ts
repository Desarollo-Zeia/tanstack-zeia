import { apiFetch } from '@/lib/api-client'
import type { BillingCalculateResponse } from '../types'

export function fetchBillingCalculate(
  headquarterId: number,
  startDate: string,
  endDate: string
): Promise<BillingCalculateResponse> {
  const params = new URLSearchParams({
    start_date: startDate,
    end_date: endDate,
  })
  return apiFetch<BillingCalculateResponse>(
    `/headquarter/${headquarterId}/billing-calculate/?${params.toString()}`
  )
}
