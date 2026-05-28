import { apiFetch } from '@/lib/api-client'
import type { MostThreeUnbalancedResponse } from '../types'

export function fetchMostThreeUnbalanced(
  headquarterId: number,
  dateAfter: string,
  dateBefore: string
): Promise<MostThreeUnbalancedResponse> {
  const params = new URLSearchParams({
    date_after: dateAfter,
    date_before: dateBefore,
  })
  return apiFetch<MostThreeUnbalancedResponse>(
    `/headquarter/${headquarterId}/electrical_panel/most-three-unbalanced?${params.toString()}`
  )
}
