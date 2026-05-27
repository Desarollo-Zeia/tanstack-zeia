import { apiFetch } from '@/lib/api-client'
import type { ReadingsResponse } from '../types'

export function fetchReadings(
  headquarterId: number,
  panelId: number,
  measurementPointId: number,
  dateAfter: string,
  dateBefore: string,
  category: string,
  page: number = 1
): Promise<ReadingsResponse> {
  const params = new URLSearchParams({
    date_after: dateAfter,
    date_before: dateBefore,
    category,
    page: String(page),
  })
  return apiFetch<ReadingsResponse>(
    `/headquarter/${headquarterId}/electrical_panel/${panelId}/measurement_points/${measurementPointId}/readings?${params.toString()}`
  )
}
