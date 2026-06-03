import { apiFetch } from '@/lib/api-client'
import { downloadExcelFile } from './shared/download'
import type { AlertsLatestBySubtypeResponse, AlertsHistoryResponse } from '../../types'

export type FluctuationSubtype = 'overvoltage' | 'undervoltage' | 'zero_voltage'
export type PhaseType = 'R' | 'S' | 'T' | 'RS' | 'ST' | 'RT'
export type AlertStatus = 'new' | 'acknowledged' | 'resolved'
export type AlertSeverity = 'moderate' | 'critical'

// JSON endpoints use /api/v1/... (apiFetch prepends the base URL)
const JSON_BASE_PATH = '/alerts/energy/voltage-fluctuation'
// Excel endpoints use /api/v1/... (apiFetch is not used; we use full URL with auth header in download.ts)
const EXCEL_BASE_URL = 'https://api.energy.zeia.com.pe/api/v1/alerts/energy/voltage-fluctuation'
const TODAY = () => new Date().toISOString().split('T')[0]

export interface FetchVoltageFluctuationLatestByPhaseParams {
  measurementPointId: number
  fluctuationSubtype?: FluctuationSubtype
}

export interface FetchVoltageFluctuationHistoryParams {
  measurementPointId: number
  dateAfter?: string
  dateBefore?: string
  timeAfter?: string
  timeBefore?: string
  fluctuationSubtype?: FluctuationSubtype[]
  phaseType?: PhaseType[]
  status?: AlertStatus[]
  alertStatus?: AlertSeverity[]
  page?: number
}

export interface DownloadVoltageFluctuationLatestReportParams {
  measurementPointId: number
  fluctuationSubtype?: FluctuationSubtype
}

export interface DownloadVoltageFluctuationHistoryReportParams {
  measurementPointId: number
  dateAfter?: string
  dateBefore?: string
  fluctuationSubtype?: FluctuationSubtype
}

function buildLatestQuery(params: FetchVoltageFluctuationLatestByPhaseParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.fluctuationSubtype) {
    searchParams.append('fluctuation_subtype', params.fluctuationSubtype)
  }
  return searchParams
}

function buildHistoryQuery(params: FetchVoltageFluctuationHistoryParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.dateAfter) searchParams.append('date_after', params.dateAfter)
  if (params.dateBefore) searchParams.append('date_before', params.dateBefore)
  if (params.timeAfter) searchParams.append('time_after', params.timeAfter)
  if (params.timeBefore) searchParams.append('time_before', params.timeBefore)
  params.fluctuationSubtype?.forEach((s) => searchParams.append('fluctuation_subtype', s))
  params.phaseType?.forEach((p) => searchParams.append('phase_type', p))
  params.status?.forEach((s) => searchParams.append('status', s))
  params.alertStatus?.forEach((s) => searchParams.append('alert_status', s))
  if (params.page) searchParams.append('page', String(params.page))
  return searchParams
}

export function fetchVoltageFluctuationLatestByPhase(
  params: FetchVoltageFluctuationLatestByPhaseParams
): Promise<AlertsLatestBySubtypeResponse> {
  const query = buildLatestQuery(params)
  return apiFetch<AlertsLatestBySubtypeResponse>(
    `${JSON_BASE_PATH}/latest-by-phase/?${query.toString()}`
  )
}

export function fetchVoltageFluctuationHistory(
  params: FetchVoltageFluctuationHistoryParams
): Promise<AlertsHistoryResponse> {
  const query = buildHistoryQuery(params)
  return apiFetch<AlertsHistoryResponse>(`${JSON_BASE_PATH}/?${query.toString()}`)
}

export async function downloadVoltageFluctuationLatestReport(
  params: DownloadVoltageFluctuationLatestReportParams
): Promise<void> {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.fluctuationSubtype) {
    searchParams.append('fluctuation_subtype', params.fluctuationSubtype)
  }
  const url = `${EXCEL_BASE_URL}/latest-by-phase/report/?${searchParams.toString()}`
  return downloadExcelFile(url, `alertas_fase_${params.measurementPointId}_${TODAY()}.xlsx`)
}

export async function downloadVoltageFluctuationHistoryReport(
  params: DownloadVoltageFluctuationHistoryReportParams
): Promise<void> {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.dateAfter) searchParams.append('date_after', params.dateAfter)
  if (params.dateBefore) searchParams.append('date_before', params.dateBefore)
  if (params.fluctuationSubtype) {
    searchParams.append('fluctuation_subtype', params.fluctuationSubtype)
  }
  const url = `${EXCEL_BASE_URL}/report/?${searchParams.toString()}`
  return downloadExcelFile(url, `historial_alertas_fase_${params.measurementPointId}_${TODAY()}.xlsx`)
}
