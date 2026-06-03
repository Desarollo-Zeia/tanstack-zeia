import { apiFetch } from '@/lib/api-client'
import { downloadExcelFile } from './shared/download'
import type { AlertsLatestBySubtypeResponse, AlertsHistoryResponse } from '../../types'
import type { AlertStatus, AlertSeverity } from './voltage-fluctuation'

export type HarmonicSubtype = 'individual_distortion' | 'total_distortion'

export type HarmonicPhase = 'A' | 'B' | 'C'

const JSON_BASE_PATH = '/alerts/energy/harmonic-distortion'
const EXCEL_BASE_URL = 'https://api.energy.zeia.com.pe/api/v1/alerts/energy/harmonic-distortion'
const TODAY = () => new Date().toISOString().split('T')[0]

export interface FetchHarmonicDistortionLatestByPhaseParams {
  measurementPointId: number
  phaseType?: HarmonicPhase
  harmonicSubtype?: HarmonicSubtype
}

export interface FetchHarmonicDistortionHistoryParams {
  measurementPointId: number
  dateAfter?: string
  dateBefore?: string
  timeAfter?: string
  timeBefore?: string
  harmonicSubtype?: HarmonicSubtype[]
  phaseType?: HarmonicPhase[]
  status?: AlertStatus[]
  alertStatus?: AlertSeverity[]
  page?: number
}

export interface DownloadHarmonicDistortionLatestReportParams {
  measurementPointId: number
  phaseType?: HarmonicPhase
  harmonicSubtype?: HarmonicSubtype
}

export interface DownloadHarmonicDistortionHistoryReportParams {
  measurementPointId: number
  dateAfter?: string
  dateBefore?: string
  phaseType?: HarmonicPhase
  harmonicSubtype?: HarmonicSubtype
}

function buildLatestQuery(params: FetchHarmonicDistortionLatestByPhaseParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.phaseType) searchParams.append('phase_type', params.phaseType)
  if (params.harmonicSubtype) searchParams.append('harmonic_subtype', params.harmonicSubtype)
  return searchParams
}

function buildHistoryQuery(params: FetchHarmonicDistortionHistoryParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.dateAfter) searchParams.append('date_after', params.dateAfter)
  if (params.dateBefore) searchParams.append('date_before', params.dateBefore)
  if (params.timeAfter) searchParams.append('time_after', params.timeAfter)
  if (params.timeBefore) searchParams.append('time_before', params.timeBefore)
  params.harmonicSubtype?.forEach((s) => searchParams.append('harmonic_subtype', s))
  params.phaseType?.forEach((p) => searchParams.append('phase_type', p))
  params.status?.forEach((s) => searchParams.append('status', s))
  params.alertStatus?.forEach((s) => searchParams.append('alert_status', s))
  if (params.page) searchParams.append('page', String(params.page))
  return searchParams
}

export function fetchHarmonicDistortionLatestByPhase(
  params: FetchHarmonicDistortionLatestByPhaseParams
): Promise<AlertsLatestBySubtypeResponse> {
  const query = buildLatestQuery(params)
  return apiFetch<AlertsLatestBySubtypeResponse>(
    `${JSON_BASE_PATH}/latest-by-phase/?${query.toString()}`
  )
}

export function fetchHarmonicDistortionHistory(
  params: FetchHarmonicDistortionHistoryParams
): Promise<AlertsHistoryResponse> {
  const query = buildHistoryQuery(params)
  return apiFetch<AlertsHistoryResponse>(`${JSON_BASE_PATH}/?${query.toString()}`)
}

export async function downloadHarmonicDistortionLatestReport(
  params: DownloadHarmonicDistortionLatestReportParams
): Promise<void> {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.phaseType) searchParams.append('phase_type', params.phaseType)
  if (params.harmonicSubtype) searchParams.append('harmonic_subtype', params.harmonicSubtype)

  const url = `${EXCEL_BASE_URL}/latest-by-phase/report/?${searchParams.toString()}`
  return downloadExcelFile(url, `alertas_harmonica_${params.measurementPointId}_${TODAY()}.xlsx`)
}

export async function downloadHarmonicDistortionHistoryReport(
  params: DownloadHarmonicDistortionHistoryReportParams
): Promise<void> {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.dateAfter) searchParams.append('date_after', params.dateAfter)
  if (params.dateBefore) searchParams.append('date_before', params.dateBefore)
  if (params.phaseType) searchParams.append('phase_type', params.phaseType)
  if (params.harmonicSubtype) searchParams.append('harmonic_subtype', params.harmonicSubtype)

  const url = `${EXCEL_BASE_URL}/report/?${searchParams.toString()}`
  return downloadExcelFile(url, `historial_alertas_harmonica_${params.measurementPointId}_${TODAY()}.xlsx`)
}
