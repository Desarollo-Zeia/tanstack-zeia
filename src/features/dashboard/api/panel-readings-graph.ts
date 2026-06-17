import { apiFetch } from '@/lib/api-client'
import type { ReadingsGraphResponse } from '../types'

export function fetchPanelReadingsGraph(
  headquarterId: number,
  panelId: number,
  measurementPointId: number,
  dateAfter: string,
  dateBefore: string,
  indicador: string,
  weekdayCsv: string
): Promise<ReadingsGraphResponse> {
  const params = new URLSearchParams({
    date_after: dateAfter,
    date_before: dateBefore,
    indicador,
    last_by: 'day',
    weekday: weekdayCsv,
  })
  return apiFetch<ReadingsGraphResponse>(
    `/headquarter/${headquarterId}/electrical_panel/${panelId}/measurement_points/${measurementPointId}/readings/graph?${params.toString()}`
  )
}
