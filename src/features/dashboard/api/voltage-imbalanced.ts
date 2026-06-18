import { apiFetch } from '@/lib/api-client'
import type { ImbalancedEventsResponse } from '../types'

export function fetchVoltageImbalanced(
  headquarterId: number,
  panelId: number,
  measurementPointId: number,
  dateAfter: string,
  dateBefore: string,
  page = 1
): Promise<ImbalancedEventsResponse> {
  const params = new URLSearchParams({
    status: 'unbalanced',
    date_after: dateAfter,
    date_before: dateBefore,
    page: String(page),
  })
  return apiFetch<ImbalancedEventsResponse>(
    `/headquarter/${headquarterId}/electrical_panel/${panelId}/measurement_point/${measurementPointId}/voltage-imbalanced?${params.toString()}`
  )
}
