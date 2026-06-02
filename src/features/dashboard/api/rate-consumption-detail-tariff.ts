import { apiFetch } from '@/lib/api-client'
import type { RateConsumptionDetailTariffResponse } from '../types'

export function fetchRateConsumptionDetailTariff(
  headquarterId: number
): Promise<RateConsumptionDetailTariffResponse> {
  return apiFetch<RateConsumptionDetailTariffResponse>(
    `/headquarter/${headquarterId}/electrical_panel/rate-consumption/detail-tariff`
  )
}
