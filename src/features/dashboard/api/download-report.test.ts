import { describe, it, expect, vi, beforeEach } from 'vitest'
import { downloadReadingsReport } from './download-report'
import { downloadExcelFile } from './alerts/shared/download'

vi.mock('./alerts/shared/download', () => ({
  downloadExcelFile: vi.fn(),
}))

const downloadExcelFileMock = vi.mocked(downloadExcelFile)

describe('downloadReadingsReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    downloadExcelFileMock.mockResolvedValue(undefined)
  })

  it('incluye file_format=xlsx en la URL y filename con nombre del panel', async () => {
    await downloadReadingsReport({
      headquarterId: 67,
      panelId: 39,
      panelName: 'Tablero General',
      dateAfter: '2026-06-01',
      dateBefore: '2026-06-30',
      fileFormat: 'xlsx',
    })

    expect(downloadExcelFileMock).toHaveBeenCalledTimes(1)
    const [url, filename] = downloadExcelFileMock.mock.calls[0]
    expect(url).toContain('file_format=xlsx')
    expect(filename).toBe('Tablero_General_01-06-26_30-06-26.xlsx')
  })

  it('incluye file_format=csv en la URL y filename con nombre del panel', async () => {
    await downloadReadingsReport({
      headquarterId: 67,
      panelId: 39,
      panelName: 'TG-TR2',
      dateAfter: '2026-06-01',
      dateBefore: '2026-06-30',
      fileFormat: 'csv',
    })

    expect(downloadExcelFileMock).toHaveBeenCalledTimes(1)
    const [url, filename] = downloadExcelFileMock.mock.calls[0]
    expect(url).toContain('file_format=csv')
    expect(filename).toBe('TG-TR2_01-06-26_30-06-26.csv')
  })

  it('incluye date_after y date_before en la URL', async () => {
    await downloadReadingsReport({
      headquarterId: 67,
      panelId: 39,
      panelName: 'TG-TR2',
      dateAfter: '2026-06-01',
      dateBefore: '2026-06-30',
      fileFormat: 'xlsx',
    })

    const [url] = downloadExcelFileMock.mock.calls[0]
    expect(url).toContain('date_after=2026-06-01')
    expect(url).toContain('date_before=2026-06-30')
    expect(url).toContain('/headquarter/67/electrical_panel/39/readings/report?')
  })
})
