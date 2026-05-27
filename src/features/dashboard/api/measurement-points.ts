import { apiFetch } from '@/lib/api-client'
import type { MeasurementPointsResponse, DeviceMeasurementPointsListResponse } from '../types'

export function fetchMeasurementPoints(headquarterId: number): Promise<MeasurementPointsResponse> {
  return apiFetch<MeasurementPointsResponse>(`/headquarter/${headquarterId}/measurement-points/`)
}

export function fetchDeviceMeasurementPointsList(
  headquarterId: number,
  panelId: number
): Promise<DeviceMeasurementPointsListResponse> {
  return apiFetch<DeviceMeasurementPointsListResponse>(
    `/headquarter/${headquarterId}/electrical_panel/${panelId}/devices/measurement-points/list/`
  )
}
