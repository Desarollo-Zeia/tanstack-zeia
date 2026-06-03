import { apiFetch } from '@/lib/api-client'
import { downloadExcelFile } from './shared/download'
import type { AlertsLatestBySubtypeResponse, AlertsHistoryResponse } from '../../types'
import type { AlertStatus, AlertSeverity } from './voltage-fluctuation'

export type PowerSubtype =
  | 'max_demand_exceeded'
  | 'contracted_power_exceeded'
  | 'installed_power_exceeded'
  | 'max_reactive_exceeded'
  | 'min_reactive_subceeded'

// JSON y Excel endpoints usan /api/v1/ (consistente, no es quirk)
const JSON_BASE_PATH = '/alerts/energy/power-demand'
const EXCEL_BASE_URL = 'https://api.energy.zeia.com.pe/api/v1/alerts/energy/power-demand'
const TODAY = () => new Date().toISOString().split('T')[0]

export interface FetchPowerDemandLatestBySubtypeParams {
  measurementPointId: number
  powerSubtype?: PowerSubtype
}

export interface FetchPowerDemandHistoryParams {
  measurementPointId: number
  deviceId?: number
  dateAfter?: string
  dateBefore?: string
  timeAfter?: string
  timeBefore?: string
  powerSubtype?: PowerSubtype[]
  status?: AlertStatus[]
  alertStatus?: AlertSeverity[]
  page?: number
}

export interface DownloadPowerDemandLatestReportParams {
  measurementPointId: number
  powerSubtype?: PowerSubtype
}

export interface DownloadPowerDemandHistoryReportParams {
  measurementPointId: number
  dateAfter?: string
  dateBefore?: string
  powerSubtype?: PowerSubtype
}

function buildLatestQuery(params: FetchPowerDemandLatestBySubtypeParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.powerSubtype) searchParams.append('power_subtype', params.powerSubtype)
  return searchParams
}

function buildHistoryQuery(params: FetchPowerDemandHistoryParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.deviceId) searchParams.append('device', String(params.deviceId))
  if (params.dateAfter) searchParams.append('date_after', params.dateAfter)
  if (params.dateBefore) searchParams.append('date_before', params.dateBefore)
  if (params.timeAfter) searchParams.append('time_after', params.timeAfter)
  if (params.timeBefore) searchParams.append('time_before', params.timeBefore)
  params.powerSubtype?.forEach((s) => searchParams.append('power_subtype', s))
  params.status?.forEach((s) => searchParams.append('status', s))
  params.alertStatus?.forEach((s) => searchParams.append('alert_status', s))
  if (params.page) searchParams.append('page', String(params.page))
  return searchParams
}

export function fetchPowerDemandLatestBySubtype(
  params: FetchPowerDemandLatestBySubtypeParams
): Promise<AlertsLatestBySubtypeResponse> {
  const query = buildLatestQuery(params)
  return apiFetch<AlertsLatestBySubtypeResponse>(
    `${JSON_BASE_PATH}/latest-by-subtype/?${query.toString()}`
  )
}

export function fetchPowerDemandHistory(
  params: FetchPowerDemandHistoryParams
): Promise<AlertsHistoryResponse> {
  const query = buildHistoryQuery(params)
  return apiFetch<AlertsHistoryResponse>(`${JSON_BASE_PATH}/?${query.toString()}`)
}

export async function downloadPowerDemandLatestReport(
  params: DownloadPowerDemandLatestReportParams
): Promise<void> {
  const query = buildLatestQuery({
    measurementPointId: params.measurementPointId,
    powerSubtype: params.powerSubtype,
  })
  const url = `${EXCEL_BASE_URL}/latest-by-subtype/report/?${query.toString()}`
  return downloadExcelFile(url, `alertas_potencia_${params.measurementPointId}_${TODAY()}.xlsx`)
}

export async function downloadPowerDemandHistoryReport(
  params: DownloadPowerDemandHistoryReportParams
): Promise<void> {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.dateAfter) searchParams.append('date_after', params.dateAfter)
  if (params.dateBefore) searchParams.append('date_before', params.dateBefore)
  if (params.powerSubtype) searchParams.append('power_subtype', params.powerSubtype)

  const url = `${EXCEL_BASE_URL}/report/?${searchParams.toString()}`
  return downloadExcelFile(url, `historial_alertas_potencia_${params.measurementPointId}_${TODAY()}.xlsx`)
}
