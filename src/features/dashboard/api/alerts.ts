import { apiFetch } from '@/lib/api-client'
import type { AlertsLatestBySubtypeResponse, AlertsHistoryResponse } from '../types'

export interface FetchAlertsLatestBySubtypeParams {
  measurementPointId: number
  energySubtype?: 'overconsumption' | 'undervaluation' | 'reactive_inductive_exceeded' | 'reactive_capacitive_exceeded'
  energyCategory?: 'active' | 'reactive'
}

export interface FetchAlertsReportParams {
  measurementPointId: number
  energySubtype?: 'overconsumption' | 'undervaluation' | 'reactive_inductive_exceeded' | 'reactive_capacitive_exceeded'
}

export interface FetchAlertsHistoryParams {
  measurementPointId: number
  dateAfter?: string
  dateBefore?: string
  energySubtype?: string[]
  energyCategory?: 'active' | 'reactive'
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

export async function downloadAlertsReport(
  params: FetchAlertsReportParams
): Promise<void> {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })

  if (params.energySubtype) {
    searchParams.append('energy_subtype', params.energySubtype)
  }

  const authData = localStorage.getItem('zeia-auth')
  if (!authData) {
    throw new Error('No authentication token found')
  }

  const { token } = JSON.parse(authData)

  const response = await fetch(
    `https://api.energy.zeia.com.pe/api/v1/alerts/energy/energy-monitoring/latest-by-subtype/report/?${searchParams.toString()}`,
    {
      headers: {
        'Authorization': `Token ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to download report')
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `alertas_${params.measurementPointId}_${new Date().toISOString().split('T')[0]}.xlsx`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}

export function fetchAlertsLatestBySubtype(
  params: FetchAlertsLatestBySubtypeParams
): Promise<AlertsLatestBySubtypeResponse> {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })

  if (params.energySubtype) {
    searchParams.append('energy_subtype', params.energySubtype)
  }

  if (params.energyCategory) {
    searchParams.append('energy_category', params.energyCategory)
  }

  return apiFetch<AlertsLatestBySubtypeResponse>(
    `/alerts/energy/energy-monitoring/latest-by-subtype/?${searchParams.toString()}`
  )
}

export function fetchAlertsHistory(
  params: FetchAlertsHistoryParams
): Promise<AlertsHistoryResponse> {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })

  if (params.dateAfter) {
    searchParams.append('date_after', params.dateAfter)
  }

  if (params.dateBefore) {
    searchParams.append('date_before', params.dateBefore)
  }

  if (params.energySubtype && params.energySubtype.length > 0) {
    params.energySubtype.forEach((subtype) => {
      searchParams.append('energy_subtype', subtype)
    })
  }

  if (params.energyCategory) {
    searchParams.append('energy_category', params.energyCategory)
  }

  if (params.status && params.status.length > 0) {
    params.status.forEach((status) => {
      searchParams.append('status', status)
    })
  }

  if (params.alertStatus && params.alertStatus.length > 0) {
    params.alertStatus.forEach((alertStatus) => {
      searchParams.append('alert_status', alertStatus)
    })
  }

  if (params.page) {
    searchParams.append('page', String(params.page))
  }

  return apiFetch<AlertsHistoryResponse>(
    `/alerts/energy/energy-monitoring/?${searchParams.toString()}`
  )
}

export async function downloadAlertsHistoryReport(
  params: DownloadAlertsHistoryReportParams
): Promise<void> {
  const searchParams = new URLSearchParams({
    measurement_point: String(params.measurementPointId),
  })

  if (params.dateAfter) {
    searchParams.append('date_after', params.dateAfter)
  }

  if (params.dateBefore) {
    searchParams.append('date_before', params.dateBefore)
  }

  if (params.energySubtype) {
    searchParams.append('energy_subtype', params.energySubtype)
  }

  const authData = localStorage.getItem('zeia-auth')
  if (!authData) {
    throw new Error('No authentication token found')
  }

  const { token } = JSON.parse(authData)

  const response = await fetch(
    `https://api.energy.zeia.com.pe/api/v1/alerts/energy/energy-monitoring/report/?${searchParams.toString()}`,
    {
      headers: {
        'Authorization': `Token ${token}`,
      },
    }
  )

  if (!response.ok) {
    throw new Error('Failed to download report')
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `historial_alertas_${params.measurementPointId}_${new Date().toISOString().split('T')[0]}.xlsx`
  document.body.appendChild(a)
  a.click()
  window.URL.revokeObjectURL(url)
  document.body.removeChild(a)
}
