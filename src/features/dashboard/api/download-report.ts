import { downloadExcelFile } from './alerts/shared/download'

const API_BASE_URL = 'https://api.energy.zeia.com.pe'

export type ReportFileFormat = 'csv' | 'xlsx'

export interface DownloadReadingsReportParams {
  headquarterId: number
  panelId: number
  panelName: string
  dateAfter: string
  dateBefore: string
  fileFormat: ReportFileFormat
}

function formatFilenameDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}-${month}-${year.slice(2)}`
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
  const safePanelName = params.panelName.replace(/\s+/g, '_')
  const dateAfterStr = formatFilenameDate(params.dateAfter)
  const dateBeforeStr = formatFilenameDate(params.dateBefore)
  const filename = `${safePanelName}_${dateAfterStr}_${dateBeforeStr}.${params.fileFormat}`

  return downloadExcelFile(url, filename)
}
