import { apiOcupacionalFetch } from '@/lib/ocupacional-api-client'
import type { AccountDetail } from '@/features/ambiental/types'

export function fetchOcupacionalAccountDetail(): Promise<AccountDetail> {
  return apiOcupacionalFetch<AccountDetail>('/account/api/detail/')
}
