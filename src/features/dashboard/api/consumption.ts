import { apiFetch } from '@/lib/api-client'
import type { ConsumptionDistributionResponse } from '../types'

export function fetchConsumptionDistribution(
  headquarterId: number,
  panelId: number,
  dateAfter: string,
  dateBefore: string
): Promise<ConsumptionDistributionResponse> {
  const params = new URLSearchParams({
    date_after: dateAfter,
    date_before: dateBefore,
  })
  return apiFetch<ConsumptionDistributionResponse>(
    `/headquarter/${headquarterId}/electrical_panel/${panelId}/consumption-distribution/?${params.toString()}`
  )
}
