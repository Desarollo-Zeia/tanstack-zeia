import { apiFetch } from '@/lib/api-client'
import type { MeasurementPointsResponse, DeviceMeasurementPointsListResponse } from '../types'

export function fetchMeasurementPoints(headquarterId: number): Promise<MeasurementPointsResponse> {
  return apiFetch<MeasurementPointsResponse>(`/headquarter/${headquarterId}/measurement-points/`)
}

export function fetchDeviceMeasurementPointsList(
  headquarterId: number,
  panelId: number
): Promise<DeviceMeasurementPointsListResponse> {
  // El backend pagina de a 10 por defecto: sin page_size se perderían los
  // puntos a partir del 11.° en los selectores (y sus umbrales)
  const params = new URLSearchParams({ page: '1', page_size: '100' })
  return apiFetch<DeviceMeasurementPointsListResponse>(
    `/headquarter/${headquarterId}/electrical_panel/${panelId}/devices/measurement-points/list/?${params.toString()}`
  )
}
