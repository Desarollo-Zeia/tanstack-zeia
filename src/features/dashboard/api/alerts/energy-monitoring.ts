import { apiFetch } from '@/lib/api-client'
import { downloadExcelFile } from './shared/download'
import type { AlertsLatestBySubtypeResponse, AlertsHistoryResponse } from '../../types'

export type EnergySubtype =
  | 'overconsumption'
  | 'undervaluation'
  | 'reactive_inductive_exceeded'
  | 'reactive_capacitive_exceeded'

export type EnergyCategory = 'active' | 'reactive'

const BASE_PATH = '/alerts/energy/energy-monitoring'
const TODAY = () => new Date().toISOString().split('T')[0]

export interface FetchAlertsLatestBySubtypeParams {
  measurementPointId: number
  energySubtype?: EnergySubtype
  energyCategory?: EnergyCategory
}

export interface FetchAlertsReportParams {
  measurementPointId: number
  energySubtype?: EnergySubtype
}

export interface FetchAlertsHistoryParams {
  measurementPointId: number
  dateAfter?: string
  dateBefore?: string
  energySubtype?: string[]
  energyCategory?: EnergyCategory
  status?: string[]
  alertStatus?: string[]
  page?: number
}

export interface DownloadAlertsHistoryReportParams {
  measurementPointId: number
  dateAfter?: string
  dateBefore?: string
  energySubtype?: string
}

function buildLatestQuery(params: FetchAlertsLatestBySubtypeParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.energySubtype) searchParams.append('energy_subtype', params.energySubtype)
  if (params.energyCategory) searchParams.append('energy_category', params.energyCategory)
  return searchParams
}

function buildHistoryQuery(params: FetchAlertsHistoryParams): URLSearchParams {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.dateAfter) searchParams.append('date_after', params.dateAfter)
  if (params.dateBefore) searchParams.append('date_before', params.dateBefore)
  params.energySubtype?.forEach((s) => searchParams.append('energy_subtype', s))
  if (params.energyCategory) searchParams.append('energy_category', params.energyCategory)
  params.status?.forEach((s) => searchParams.append('status', s))
  params.alertStatus?.forEach((s) => searchParams.append('alert_status', s))
  if (params.page) searchParams.append('page', String(params.page))
  return searchParams
}

export function fetchAlertsLatestBySubtype(
  params: FetchAlertsLatestBySubtypeParams
): Promise<AlertsLatestBySubtypeResponse> {
  const query = buildLatestQuery(params)
  return apiFetch<AlertsLatestBySubtypeResponse>(
    `${BASE_PATH}/latest-by-subtype/?${query.toString()}`
  )
}

export function fetchAlertsHistory(
  params: FetchAlertsHistoryParams
): Promise<AlertsHistoryResponse> {
  const query = buildHistoryQuery(params)
  return apiFetch<AlertsHistoryResponse>(`${BASE_PATH}/?${query.toString()}`)
}

export async function downloadAlertsReport(
  params: FetchAlertsReportParams
): Promise<void> {
  const query = buildLatestQuery({
    measurementPointId: params.measurementPointId,
    energySubtype: params.energySubtype,
  })
  const url = `https://api.energy.zeia.com.pe/api/v1${BASE_PATH}/latest-by-subtype/report/?${query.toString()}`
  return downloadExcelFile(url, `alertas_${params.measurementPointId}_${TODAY()}.xlsx`)
}

export async function downloadAlertsHistoryReport(
  params: DownloadAlertsHistoryReportParams
): Promise<void> {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })
  if (params.dateAfter) searchParams.append('date_after', params.dateAfter)
  if (params.dateBefore) searchParams.append('date_before', params.dateBefore)
  if (params.energySubtype) searchParams.append('energy_subtype', params.energySubtype)

  const url = `https://api.energy.zeia.com.pe/api/v1${BASE_PATH}/report/?${searchParams.toString()}`
  return downloadExcelFile(url, `historial_alertas_${params.measurementPointId}_${TODAY()}.xlsx`)
}
