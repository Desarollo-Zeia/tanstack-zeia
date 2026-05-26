import { apiFetch } from '@/lib/api-client'
import type { ReadingGraphPoint } from '../types'

export function fetchReadingsGraph(
  headquarterId: number,
  panelId: number,
  measurementPointId: number,
  dateAfter: string,
  dateBefore: string,
  indicator: string,
  lastBy: string = 'minute'
): Promise<ReadingGraphPoint[]> {
  const params = new URLSearchParams({
    date_after: dateAfter,
    date_before: dateBefore,
    indicador: indicator,
    last_by: lastBy,
  })
  return apiFetch<ReadingGraphPoint[]>(
    `/headquarter/${headquarterId}/electrical_panel/${panelId}/measurement_points/${measurementPointId}/readings/graph?${params.toString()}`
  )
}
