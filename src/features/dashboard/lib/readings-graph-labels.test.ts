import { describe, it, expect } from 'vitest'
import { formatReadingsAxisLabel, formatReadingsTooltipTitle } from './readings-graph-labels'
import type { ReadingGraphPoint } from '../types'

function makePoint(overrides: Partial<ReadingGraphPoint>): ReadingGraphPoint {
  return {
    period: '2026-09-08',
    first_reading: '2026-09-08T00:00:00-05:00',
    last_reading: '2026-09-14T23:59:00-05:00',
    indicator: 'P',
    unit: 'KW',
    first_value: 6.12,
    last_value: 6.16,
    difference: null,
    device: 'dev',
    measurement_point: 'Punto 1',
    ...overrides,
  }
}

describe('formatReadingsTooltipTitle / formatReadingsAxisLabel semana y mes', () => {
  it('semana muestra el rango first → last solo en tooltip, eje en fecha simple', () => {
    const point = makePoint({
      period: '2026-09-08',
      first_reading: '2026-09-08T00:00:00-05:00',
      last_reading: '2026-09-14T23:59:00-05:00',
    })
    const tooltip = formatReadingsTooltipTitle(point, 'week')
    const axis = formatReadingsAxisLabel(point, 'week')
    expect(tooltip).toContain('8 de septiembre')
    expect(tooltip).toContain('14 de septiembre')
    expect(tooltip).toContain('→')
    expect(axis).toBe('8 de septiembre')
    expect(axis).not.toContain('→')
  })

  it('semana con timestamps UTC no corre el día: tooltip con rango, eje simple', () => {
    const point = makePoint({
      period: '2026-09-08',
      first_reading: '2026-09-08T00:00:00Z',
      last_reading: '2026-09-14T23:59:00Z',
    })
    const tooltip = formatReadingsTooltipTitle(point, 'week')
    expect(tooltip).toContain('8 de septiembre')
    expect(tooltip).toContain('14 de septiembre')
    expect(formatReadingsAxisLabel(point, 'week')).toBe('8 de septiembre')
  })

  it('mes muestra el rango first → last solo en tooltip, eje en fecha simple', () => {
    const point = makePoint({
      period: '2026-09-01',
      first_reading: '2026-09-01T00:00:00-05:00',
      last_reading: '2026-09-30T23:59:00-05:00',
    })
    const tooltip = formatReadingsTooltipTitle(point, 'month')
    const axis = formatReadingsAxisLabel(point, 'month')
    expect(tooltip).toContain('1 de septiembre')
    expect(tooltip).toContain('30 de septiembre')
    expect(tooltip).toContain('→')
    expect(axis).toBe('1 de septiembre')
    expect(axis).not.toContain('→')
  })

  it('semana con first == last cae al rango calendario period + 6 días', () => {
    const point = makePoint({
      period: '2026-08-31',
      first_reading: '2026-09-01T00:00:00-05:00',
      last_reading: '2026-09-01T00:00:00-05:00',
    })
    const tooltip = formatReadingsTooltipTitle(point, 'week')
    expect(tooltip).toContain('31 de agosto')
    expect(tooltip).toContain('6 de septiembre')
    expect(tooltip).toContain('→')
    expect(formatReadingsAxisLabel(point, 'week')).toBe('31 de agosto')
  })

  it('mes con first == last cae al rango 1 → fin de mes', () => {
    const point = makePoint({
      period: '2026-09-01',
      first_reading: '2026-09-01T00:00:00-05:00',
      last_reading: '2026-09-01T00:00:00-05:00',
    })
    const tooltip = formatReadingsTooltipTitle(point, 'month')
    expect(tooltip).toContain('1 de septiembre')
    expect(tooltip).toContain('30 de septiembre')
    expect(formatReadingsAxisLabel(point, 'month')).toBe('1 de septiembre')
  })

  it('día sigue mostrando una sola fecha desde period (sin rango)', () => {
    const point = makePoint({
      period: '2026-09-09',
      first_reading: '2026-09-09T00:00:00Z',
      last_reading: '2026-09-09T23:59:00Z',
    })
    expect(formatReadingsTooltipTitle(point, 'day')).toBe('9 de septiembre')
    expect(formatReadingsAxisLabel(point, 'day')).toBe('9 de septiembre')
  })
})
