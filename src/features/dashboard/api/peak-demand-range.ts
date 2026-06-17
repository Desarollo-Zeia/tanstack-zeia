import { apiFetch } from '@/lib/api-client'
import type { PeakDemandRangeResponse } from '../types'

export function fetchPeakDemandRange(): Promise<PeakDemandRangeResponse> {
  return apiFetch<PeakDemandRangeResponse>('/coes/peak-demand-range/')
}
