import { describe, it, expect } from 'vitest'
import { findFirstIndicatorWithData, filterIndicatorsByCategory, resolveCategoryIndicators } from './indicators'
import type { Reading } from '../types'

function buildReading(values: Record<string, number>): Reading {
  return {
    created_at: '2026-07-27T08:00:00-05:00',
    device: { id: 1, name: 'Analizador', model: 'T2000', dev_eui: 'abc123' },
    indicators: { id: 1, values, measurement_point_name: 'Punto 1' },
  }
}

describe('findFirstIndicatorWithData', () => {
  it('returns the first key when it has numeric data', () => {
    const results = [buildReading({ Ua: 220.5, Ub: 221.0 })]
    expect(findFirstIndicatorWithData(['Ua', 'Ub'], results)).toBe('Ua')
  })

  it('skips indicators with only null values and picks the first with data', () => {
    const results = [
      buildReading({ Ua: null as unknown as number, Ub: null as unknown as number, Uab: 388.2 }),
      buildReading({ Ua: null as unknown as number, Ub: null as unknown as number, Uab: 387.9 }),
    ]
    expect(findFirstIndicatorWithData(['Ua', 'Ub', 'Uab'], results)).toBe('Uab')
  })

  it('considers 0 as valid data', () => {
    const results = [buildReading({ P: 0 })]
    expect(findFirstIndicatorWithData(['P'], results)).toBe('P')
  })

  it('finds data even if only a later reading has a value', () => {
    const results = [
      buildReading({ Ua: null as unknown as number, Uab: null as unknown as number }),
      buildReading({ Ua: null as unknown as number, Uab: 388.2 }),
    ]
    expect(findFirstIndicatorWithData(['Ua', 'Uab'], results)).toBe('Uab')
  })

  it('returns null when no indicator has data', () => {
    const results = [buildReading({ Ua: null as unknown as number })]
    expect(findFirstIndicatorWithData(['Ua', 'Ub'], results)).toBeNull()
  })

  it('returns null for empty inputs', () => {
    expect(findFirstIndicatorWithData([], [])).toBeNull()
    expect(findFirstIndicatorWithData(['Ua'], [])).toBeNull()
  })
})

describe('filterIndicatorsByCategory', () => {
  it('keeps only energy indicators for the energy category', () => {
    const keys = ['EPpos', 'EQpos', 'P', 'Q', 'S']
    expect(filterIndicatorsByCategory(keys, 'energy')).toEqual(['EPpos', 'EQpos'])
  })

  it('keeps only power indicators for the power category', () => {
    const keys = ['P', 'Q', 'S', 'PF', 'F', 'EPpos', 'Ua']
    expect(filterIndicatorsByCategory(keys, 'power')).toEqual(['P', 'Q', 'S', 'PF', 'F'])
  })

  it('keeps only voltage indicators for the voltage category', () => {
    const keys = ['Ua', 'Ub', 'Uc', 'Uab', 'Ubc', 'Uac', 'Ia', 'P']
    expect(filterIndicatorsByCategory(keys, 'voltage')).toEqual([
      'Ua', 'Ub', 'Uc', 'Uab', 'Ubc', 'Uac',
    ])
  })

  it('keeps only current indicators for the current category', () => {
    const keys = ['Ia', 'Ib', 'Ic', 'In', 'Ua', 'P']
    expect(filterIndicatorsByCategory(keys, 'current')).toEqual(['Ia', 'Ib', 'Ic', 'In'])
  })

  it('preserves unknown keys so new backend indicators are not hidden', () => {
    const keys = ['P', 'NEW_INDICATOR']
    expect(filterIndicatorsByCategory(keys, 'power')).toEqual(['P', 'NEW_INDICATOR'])
  })

  it('is a no-op when keys already belong to the category', () => {
    const keys = ['EPpos', 'EQpos', 'Et']
    expect(filterIndicatorsByCategory(keys, 'energy')).toEqual(keys)
  })
})

describe('resolveCategoryIndicators', () => {
  it('prefers backend keys when the date range has data', () => {
    const keys = ['EPpos', 'EPposA', 'P', 'Q']
    expect(resolveCategoryIndicators(keys, 'energy')).toEqual(['EPpos', 'EPposA'])
    expect(resolveCategoryIndicators(keys, 'power')).toEqual(['P', 'Q'])
  })

  it('falls back to the static energy catalog when the range has no data', () => {
    const resolved = resolveCategoryIndicators([], 'energy')
    expect(resolved.length).toBeGreaterThan(0)
    expect(resolved).toContain('EPpos')
    expect(resolved).toContain('EPposA')
    expect(resolved).toContain('Et')
    expect(resolved).not.toContain('P')
    expect(resolved).not.toContain('Ua')
  })

  it('falls back to the static power catalog when the range has no data', () => {
    const resolved = resolveCategoryIndicators([], 'power')
    expect(resolved).toContain('P')
    expect(resolved).toContain('Q')
    expect(resolved).not.toContain('EPpos')
    expect(resolved).not.toContain('Ia')
  })

  it('falls back to the static voltage catalog when the range has no data', () => {
    const resolved = resolveCategoryIndicators([], 'voltage')
    expect(resolved).toContain('Ua')
    expect(resolved).toContain('Ub')
    expect(resolved).toContain('Uc')
    expect(resolved).not.toContain('P')
  })

  it('falls back to the static current catalog when the range has no data', () => {
    const resolved = resolveCategoryIndicators([], 'current')
    expect(resolved).toContain('Ia')
    expect(resolved).toContain('Ib')
    expect(resolved).toContain('Ic')
    expect(resolved).not.toContain('P')
  })

  it('every fallback key belongs to the requested category', () => {
    for (const category of ['power', 'energy', 'current', 'voltage'] as const) {
      const resolved = resolveCategoryIndicators([], category)
      expect(resolved.length).toBeGreaterThan(0)
      expect(resolved).toEqual(filterIndicatorsByCategory(resolved, category))
    }
  })
})
