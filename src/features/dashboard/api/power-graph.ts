import { apiFetch } from '@/lib/api-client'
import type { PowerGraphResponse } from '../types'

export function fetchPowerGraph(
  headquarterId: number,
  dateAfter: string,
  dateBefore: string,
  groupBy: string = 'hour'
): Promise<PowerGraphResponse> {
  const params = new URLSearchParams({
    date_after: dateAfter,
    date_before: dateBefore,
    group_by: groupBy,
  })
  return apiFetch<PowerGraphResponse>(
    `/headquarter/${headquarterId}/electrical_panel/powers/graph?${params.toString()}`
  )
}
