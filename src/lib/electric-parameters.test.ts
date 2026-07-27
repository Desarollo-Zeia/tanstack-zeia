import { describe, it, expect } from 'vitest'
import { getIndicatorCategory, ELECTRIC_PARAMETERS } from './electric-parameters'

describe('getIndicatorCategory', () => {
  it('maps voltage indicators', () => {
    expect(getIndicatorCategory('Ua')).toBe('voltage')
    expect(getIndicatorCategory('Uab')).toBe('voltage')
    expect(getIndicatorCategory('VfunA')).toBe('voltage')
    expect(getIndicatorCategory('THDVr')).toBe('voltage')
    expect(getIndicatorCategory('V3A')).toBe('voltage')
  })

  it('maps current indicators', () => {
    expect(getIndicatorCategory('Ia')).toBe('current')
    expect(getIndicatorCategory('In')).toBe('current')
    expect(getIndicatorCategory('IfunA')).toBe('current')
    expect(getIndicatorCategory('THDIr')).toBe('current')
  })

  it('maps power indicators', () => {
    expect(getIndicatorCategory('P')).toBe('power')
    expect(getIndicatorCategory('Pa')).toBe('power')
    expect(getIndicatorCategory('Q')).toBe('power')
    expect(getIndicatorCategory('S')).toBe('power')
    expect(getIndicatorCategory('PF')).toBe('power')
    expect(getIndicatorCategory('PFa')).toBe('power')
    expect(getIndicatorCategory('F')).toBe('power')
  })

  it('maps energy indicators', () => {
    expect(getIndicatorCategory('Et')).toBe('energy')
    expect(getIndicatorCategory('EPpos')).toBe('energy')
    expect(getIndicatorCategory('EQnegC')).toBe('energy')
  })

  it('returns null for unknown keys', () => {
    expect(getIndicatorCategory('XYZ')).toBeNull()
    expect(getIndicatorCategory('')).toBeNull()
  })

  it('every documented parameter key maps to a category', () => {
    for (const key of Object.keys(ELECTRIC_PARAMETERS)) {
      expect(getIndicatorCategory(key), `key ${key} should map to a category`).not.toBeNull()
    }
  })
})
