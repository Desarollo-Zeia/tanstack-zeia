import { downloadExcelFile } from './alerts/shared/download'

const API_BASE_URL = 'https://api.energy.zeia.com.pe'

export type ReportFileFormat = 'csv' | 'xlsx'

export interface DownloadReadingsReportParams {
  headquarterId: number
  panelId: number
  dateAfter: string
  dateBefore: string
  fileFormat: ReportFileFormat
}

export async function downloadReadingsReport(
  params: DownloadReadingsReportParams
): Promise<void> {
  const searchParams = new URLSearchParams({
    date_after: params.dateAfter,
    date_before: params.dateBefore,
    file_format: params.fileFormat,
  })

  const url = `${API_BASE_URL}/api/v1/headquarter/${params.headquarterId}/electrical_panel/${params.panelId}/readings/report?${searchParams.toString()}`
  const filename = `reporte_lecturas_${params.dateAfter}_${params.dateBefore}.${params.fileFormat}`

  return downloadExcelFile(url, filename)
}
