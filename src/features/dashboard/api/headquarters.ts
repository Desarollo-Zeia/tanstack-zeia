import { apiFetch } from '@/lib/api-client'
import type { HeadquartersResponse } from '../types'

export function fetchHeadquarters(): Promise<HeadquartersResponse> {
  return apiFetch<HeadquartersResponse>('/user/headquarters/')
}
