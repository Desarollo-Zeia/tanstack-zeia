import { apiOcupacionalFetch } from '@/lib/ocupacional-api-client'
import type { HeadquartersResponse } from '../types'

export function fetchOcupacionalHeadquarters(): Promise<HeadquartersResponse> {
  return apiOcupacionalFetch<HeadquartersResponse>(
    '/enterprise/api/enterprise/basic/headquearter-list/'
  )
}
