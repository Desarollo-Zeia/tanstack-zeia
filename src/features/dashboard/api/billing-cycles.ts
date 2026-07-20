import { apiFetch } from '@/lib/api-client'
import type { BillingCyclesResponse } from '../types'

export function fetchBillingCycles(headquarterId: number): Promise<BillingCyclesResponse> {
  return apiFetch<BillingCyclesResponse>(`/headquarter/${headquarterId}/billing-cycles/`)
}
