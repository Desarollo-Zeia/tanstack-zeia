import { apiFetch } from '@/lib/api-client'
import type { FavoritePointsResponse } from '../types'

export function fetchFavoritePoints(): Promise<FavoritePointsResponse> {
  return apiFetch<FavoritePointsResponse>('/favorite-points/')
}
