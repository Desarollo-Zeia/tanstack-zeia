import { apiFetch } from '@/lib/api-client'
import type { TariffPdfsResponse } from '../types'

export function fetchTariffPdfs(headquarterId: number): Promise<TariffPdfsResponse> {
  return apiFetch<TariffPdfsResponse>(`/headquarter/${headquarterId}/tariff-pdfs/`)
}
