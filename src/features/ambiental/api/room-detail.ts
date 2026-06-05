import { apiOcupacionalFetch } from '@/lib/ocupacional-api-client'
import type { RoomDetail } from '../types'

export function fetchRoomDetail(roomId: number): Promise<RoomDetail> {
  return apiOcupacionalFetch<RoomDetail>(`/enterprise/api/room/${roomId}/`)
}
