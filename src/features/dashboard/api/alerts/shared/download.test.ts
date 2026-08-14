import { describe, it, expect } from 'vitest'
import { parseContentDispositionFilename } from './download'

describe('parseContentDispositionFilename', () => {
  it('extrae filename simple entre comillas', () => {
    expect(
      parseContentDispositionFilename('attachment; filename="reporte.csv"')
    ).toBe('reporte.csv')
  })

  it('extrae filename sin comillas', () => {
    expect(
      parseContentDispositionFilename('attachment; filename=reporte.xlsx')
    ).toBe('reporte.xlsx')
  })

  it('decodifica filename* RFC 5987 con caracteres especiales', () => {
    expect(
      parseContentDispositionFilename("attachment; filename*=UTF-8''Tablero%20General_2026-06-01.xlsx")
    ).toBe('Tablero General_2026-06-01.xlsx')
  })

  it('retorna null sin header', () => {
    expect(parseContentDispositionFilename(null)).toBeNull()
  })

  it('retorna null si no contiene filename', () => {
    expect(parseContentDispositionFilename('attachment')).toBeNull()
  })
})