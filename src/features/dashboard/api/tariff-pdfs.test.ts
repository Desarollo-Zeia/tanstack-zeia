import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchTariffPdfs } from './tariff-pdfs'
import * as apiClient from '@/lib/api-client'

describe('fetchTariffPdfs', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('calls apiFetch with correct path', async () => {
    const apiFetchSpy = vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      data: [],
    })

    await fetchTariffPdfs(67)

    expect(apiFetchSpy).toHaveBeenCalledWith('/headquarter/67/tariff-pdfs/')
  })

  it('returns TariffPdfsResponse shape', async () => {
    vi.spyOn(apiClient, 'apiFetch').mockResolvedValue({
      data: [
        {
          id: 3,
          title: 'Factura Mayo 2026',
          pdf_url: 'https://drive.google.com/file/d/1rcumLSYpEIKl9rvG30giRm77x-2gv5k6/view?usp=sharing',
        },
        {
          id: 1,
          title: 'Factura Abril 2026',
          pdf_url: 'https://drive.google.com/file/d/1-OVQH5E1DBpo9RDUhlzoV0K-EtAQQZ5T/view?usp=sharing',
        },
      ],
    })

    const result = await fetchTariffPdfs(67)

    expect(result.data).toHaveLength(2)
    expect(result.data[0].id).toBe(3)
    expect(result.data[0].title).toBe('Factura Mayo 2026')
    expect(result.data[0].pdf_url).toContain('drive.google.com')
  })
})
