import { downloadExcelFile } from './alerts/shared/download'

const API_BASE_URL = 'https://api.energy.zeia.com.pe'

export interface DownloadReadingsReportParams {
  headquarterId: number
  panelId: number
  dateAfter: string
  dateBefore: string
}

export async function downloadReadingsReport(
  params: DownloadReadingsReportParams
): Promise<void> {
  const searchParams = new URLSearchParams({
    date_after: params.dateAfter,
    date_before: params.dateBefore,
  })

  const url = `${API_BASE_URL}/api/v1/headquarter/${params.headquarterId}/electrical_panel/${params.panelId}/readings/report?${searchParams.toString()}`
  const filename = `reporte_lecturas_${params.dateAfter}_${params.dateBefore}.xlsx`

  return downloadExcelFile(url, filename)
}
