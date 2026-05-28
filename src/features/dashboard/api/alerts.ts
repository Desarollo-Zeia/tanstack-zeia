import { apiFetch } from '@/lib/api-client'
import type { AlertsLatestBySubtypeResponse } from '../types'

export interface FetchAlertsLatestBySubtypeParams {
  measurementPointId: number
  energySubtype?: 'overconsumption' | 'undervaluation' | 'reactive_inductive_exceeded' | 'reactive_capacitive_exceeded'
  energyCategory?: 'active' | 'reactive'
}

export interface FetchAlertsReportParams {
  measurementPointId: number
  energySubtype?: 'overconsumption' | 'undervaluation' | 'reactive_inductive_exceeded' | 'reactive_capacitive_exceeded'
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
