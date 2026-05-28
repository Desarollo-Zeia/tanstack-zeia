import { apiFetch } from '@/lib/api-client'
import type { ReadingsGraphEspecificResponse } from '../types'

export function fetchReadingsGraphEspecific(
  headquarterId: number,
  panelId: number,
  measurementPointId: number,
  dateAfter: string,
  dateBefore: string
): Promise<ReadingsGraphEspecificResponse> {
  const params = new URLSearchParams({
    date_after: dateAfter,
    date_before: dateBefore,
    indicador: 'EPpos',
    last_by: 'hour',
  })
  return apiFetch<ReadingsGraphEspecificResponse>(
    `/headquarter/${headquarterId}/electrical_panel/${panelId}/measurement_points/${measurementPointId}/readings/graph-especific?${params.toString()}`
  )
}
