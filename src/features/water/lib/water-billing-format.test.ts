import { describe, it, expect } from 'vitest'
import { formatWaterRate, getWaterChargeDetailLine } from './water-billing-format'
import type { WaterBillingCalculateDetails, WaterBillingCalculateItem } from '../types'

function buildItem(
  details: WaterBillingCalculateDetails | null,
  value: number | null = 0
): WaterBillingCalculateItem {
  return { code: 'agua', name: 'Agua potable', value, currency: 'PEN', details }
}

describe('getWaterChargeDetailLine', () => {
  it('formats potable water consumption', () => {
    expect(
      getWaterChargeDetailLine(
        buildItem({ consumption: 139, unit: 'm³', rate: 8.82, rate_unit: 'PEN/m³' })
      )
    ).toBe('139.00 m³')
  })

  it('formats sewerage with discharge factor', () => {
    expect(
      getWaterChargeDetailLine(
        buildItem({
          consumption: 139,
          unit: 'm³',
          rate: 3.1,
          rate_unit: 'PEN/m³',
          factor: 0.8,
          billed_volume: 111.2,
        })
      )
    ).toBe('139.00 m³ × 0.8 = 111.20 m³')
  })

  it('returns null when there is no tariff (details = null)', () => {
    expect(getWaterChargeDetailLine(buildItem(null))).toBeNull()
  })

  it('shows "Sin consumo registrado" when consumption is null', () => {
    expect(
      getWaterChargeDetailLine(
        buildItem({ consumption: null, unit: 'm³', rate: 8.82, rate_unit: 'PEN/m³' }, null)
      )
    ).toBe('Sin consumo registrado')
  })

  it('shows only the consumption when sewerage billed_volume is null', () => {
    expect(
      getWaterChargeDetailLine(
        buildItem({
          consumption: 139,
          unit: 'm³',
          rate: 3.1,
          rate_unit: 'PEN/m³',
          factor: 0.8,
          billed_volume: null,
        })
      )
    ).toBe('139.00 m³')
  })
})

describe('formatWaterRate', () => {
  it('formats the rate', () => {
    expect(
      formatWaterRate({ consumption: null, unit: 'm³', rate: 8.82, rate_unit: 'PEN/m³' })
    ).toBe('8.82 PEN/m³')
  })

  it('returns null when details, rate or rate_unit are null', () => {
    expect(formatWaterRate(null)).toBeNull()
    expect(
      formatWaterRate({ consumption: 10, unit: 'm³', rate: null, rate_unit: 'PEN/m³' })
    ).toBeNull()
    expect(
      formatWaterRate({ consumption: 10, unit: 'm³', rate: 8.82, rate_unit: null })
    ).toBeNull()
  })
})
