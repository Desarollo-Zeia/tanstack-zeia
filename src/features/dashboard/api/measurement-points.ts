import { apiFetch } from '@/lib/api-client'
import type { MeasurementPointsResponse } from '../types'

export function fetchMeasurementPoints(headquarterId: number): Promise<MeasurementPointsResponse> {
  return apiFetch<MeasurementPointsResponse>(`/headquarter/${headquarterId}/measurement-points/`)
}
