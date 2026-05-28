import { apiFetch } from '@/lib/api-client'
import type { UnbalancedCurrentCountersResponse } from '../types'

export function fetchUnbalancedCurrentCountersGraph(
  headquarterId: number,
  panelId: number,
  measurementPointId: number,
  dateAfter: string,
  dateBefore: string
): Promise<UnbalancedCurrentCountersResponse> {
  const params = new URLSearchParams({
    date_after: dateAfter,
    date_before: dateBefore,
  })
  return apiFetch<UnbalancedCurrentCountersResponse>(
    `/headquarter/${headquarterId}/electrical_panel/${panelId}/measurement_point/${measurementPointId}/unbalanced-current/counters-graph?${params.toString()}`
  )
}
