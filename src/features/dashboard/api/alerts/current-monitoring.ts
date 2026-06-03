import { apiFetch } from '@/lib/api-client'
import { downloadExcelFile } from './shared/download'
import type { AlertsLatestBySubtypeResponse, AlertsHistoryResponse } from '../../types'
import type { AlertStatus, AlertSeverity } from './voltage-fluctuation'

export type CurrentSubtype =
  | 'max_current_exceeded'
  | 'min_current_subceeded'
  | 'zero_current'
  | 'current_unbalance'

export type CurrentPhase = 'A' | 'B' | 'C'

const JSON_BASE_PATH = '/alerts/energy/current-monitoring'
const EXCEL_BASE_URL = 'https://api.energy.zeia.com.pe/api/v1/alerts/energy/current-monitoring'
const TODAY = () => new Date().toISOString().split('T')[0]

export interface FetchCurrentMonitoringLatestByPhaseParams {
  measurementPointId: number
  currentPhase?: CurrentPhase
  currentSubtype?: CurrentSubtype
}

export interface FetchCurrentMonitoringHistoryParams {
  measurementPointId: number
  dateAfter?: string
  dateBefore?: string
  timeAfter?: string
  timeBefore?: string
  currentSubtype?: CurrentSubtype[]
  currentPhase?: CurrentPhase[]
  status?: AlertStatus[]
  alertStatus?: AlertSeverity[]
  page?: number
}

export interface DownloadCurrentMonitoringLatestReportParams {
  measurementPointId: number
  currentPhase?: CurrentPhase
  currentSubtype?: CurrentSubtype
}

export interface DownloadCurrentMonitoringHistoryReportParams {
  measurementPointId: number
  dateAfter?: string
  dateBefore?: string
  currentPhase?: CurrentPhase
  currentSubtype?: CurrentSubtype
}

function buildLatestQuery(params: FetchCurrentMonitoringLatestByPhaseParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.currentPhase) searchParams.append('current_phase', params.currentPhase)
  if (params.currentSubtype) searchParams.append('current_subtype', params.currentSubtype)
  return searchParams
}

function buildHistoryQuery(params: FetchCurrentMonitoringHistoryParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.dateAfter) searchParams.append('date_after', params.dateAfter)
  if (params.dateBefore) searchParams.append('date_before', params.dateBefore)
  if (params.timeAfter) searchParams.append('time_after', params.timeAfter)
  if (params.timeBefore) searchParams.append('time_before', params.timeBefore)
  params.currentSubtype?.forEach((s) => searchParams.append('current_subtype', s))
  params.currentPhase?.forEach((p) => searchParams.append('current_phase', p))
  params.status?.forEach((s) => searchParams.append('status', s))
  params.alertStatus?.forEach((s) => searchParams.append('alert_status', s))
  if (params.page) searchParams.append('page', String(params.page))
  return searchParams
}

export function fetchCurrentMonitoringLatestByPhase(
  params: FetchCurrentMonitoringLatestByPhaseParams
): Promise<AlertsLatestBySubtypeResponse> {
  const query = buildLatestQuery(params)
  return apiFetch<AlertsLatestBySubtypeResponse>(
    `${JSON_BASE_PATH}/latest-by-phase/?${query.toString()}`
  )
}

export function fetchCurrentMonitoringHistory(
  params: FetchCurrentMonitoringHistoryParams
): Promise<AlertsHistoryResponse> {
  const query = buildHistoryQuery(params)
  return apiFetch<AlertsHistoryResponse>(`${JSON_BASE_PATH}/?${query.toString()}`)
}

export async function downloadCurrentMonitoringLatestReport(
  params: DownloadCurrentMonitoringLatestReportParams
): Promise<void> {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.currentPhase) searchParams.append('current_phase', params.currentPhase)
  if (params.currentSubtype) searchParams.append('current_subtype', params.currentSubtype)

  const url = `${EXCEL_BASE_URL}/latest-by-phase/report/?${searchParams.toString()}`
  return downloadExcelFile(url, `alertas_corriente_${params.measurementPointId}_${TODAY()}.xlsx`)
}

export async function downloadCurrentMonitoringHistoryReport(
  params: DownloadCurrentMonitoringHistoryReportParams
): Promise<void> {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.dateAfter) searchParams.append('date_after', params.dateAfter)
  if (params.dateBefore) searchParams.append('date_before', params.dateBefore)
  if (params.currentPhase) searchParams.append('current_phase', params.currentPhase)
  if (params.currentSubtype) searchParams.append('current_subtype', params.currentSubtype)

  const url = `${EXCEL_BASE_URL}/report/?${searchParams.toString()}`
  return downloadExcelFile(url, `historial_alertas_corriente_${params.measurementPointId}_${TODAY()}.xlsx`)
}
