import { describe, it, expect } from 'vitest'
import { formatRate, getChargeDetailLine } from './billing-format'
import type { BillingCalculateDetails, BillingCalculateItem } from '../types'

// Payloads defensivos: si un cargo llega con rate/rate_unit en null, el render no
// debe romperse. Los tipos declaran ambos campos como obligatorios, por eso el cast.
const energyWithoutRate = {
  consumption: 5334.7,
  unit: 'kWh',
  rate: null,
  rate_unit: null,
} as unknown as BillingCalculateDetails

const powerWithoutRate = {
  max_power: 120.5,
  max_power_datetime: '2026-09-10T18:30:00',
  rate: null,
  rate_unit: null,
} as unknown as BillingCalculateDetails

function buildItem(details: BillingCalculateDetails | null): BillingCalculateItem {
  return { code: 'cargo', name: 'Cargo', value: 0, currency: 'PEN', details }
}

describe('formatRate', () => {
  it('formats rate and rate_unit', () => {
    expect(
      formatRate({ consumption: 1, unit: 'MWh', rate: 38.18, rate_unit: 'USD/MWh' })
    ).toBe('38.18 $ / MWh')
  })

  it('returns null when details is null', () => {
    expect(formatRate(null)).toBeNull()
  })

  it('returns null instead of throwing when rate/rate_unit are null', () => {
    expect(formatRate(energyWithoutRate)).toBeNull()
  })
})

describe('getChargeDetailLine', () => {
  it('uses the unit of rate_unit for power charges', () => {
    expect(
      getChargeDetailLine(
        buildItem({
          max_power: 434.01,
          max_power_datetime: '2026-09-10T18:30:00',
          rate: 6.25,
          rate_unit: 'USD/kW',
        })
      )
    ).toBe('434.01 kW')
  })

  it('falls back to kW instead of throwing when rate_unit is null', () => {
    expect(getChargeDetailLine(buildItem(powerWithoutRate))).toBe('120.50 kW')
  })
})
