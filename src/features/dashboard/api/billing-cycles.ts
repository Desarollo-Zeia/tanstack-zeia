import { apiFetch } from '@/lib/api-client'
import type { BillingCyclesResponse } from '../types'

export function fetchBillingCycles(headquarterId: number): Promise<BillingCyclesResponse> {
  const params = new URLSearchParams({ billing_type: 'energy' })
  return apiFetch<BillingCyclesResponse>(
    `/headquarter/${headquarterId}/billing-cycles/?${params.toString()}`
  )
}
