// ⚠️ Endpoint reemplazado por billing-calculate + billing-cycles
// (ver ./billing-calculate.ts y ./billing-cycles.ts)
// Se mantiene comentado como referencia. No usar en nuevos desarrollos.
//
// import { apiFetch } from '@/lib/api-client'
// import type { RateConsumptionDetailTariffResponse } from '../types'
//
// export function fetchRateConsumptionDetailTariff(
//   headquarterId: number
// ): Promise<RateConsumptionDetailTariffResponse> {
//   return apiFetch<RateConsumptionDetailTariffResponse>(
//     `/headquarter/${headquarterId}/electrical_panel/rate-consumption/detail-tariff`
//   )
// }
