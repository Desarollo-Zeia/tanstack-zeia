import { describe, it, expect } from 'vitest'
import {
  NO_CONSUMPTION_LABEL,
  formatMoney,
  formatRate,
  getChargeDetailLine,
} from './billing-format'
import type { BillingCalculateDetails, BillingCalculateItem } from '../types'

// Payloads defensivos: el backend puede mandar en null los campos numéricos
// (rate, rate_unit, consumo, potencia, importe) y el render no debe romperse.
const energyWithoutRate: BillingCalculateDetails = {
  consumption: 5334.7,
  unit: 'kWh',
  rate: null,
  rate_unit: null,
}

const powerWithoutRate: BillingCalculateDetails = {
  max_power: 120.5,
  max_power_datetime: '2026-09-10T18:30:00',
  rate: null,
  rate_unit: null,
}

function buildItem(
  details: BillingCalculateDetails | null,
  value: number | null = 0
): BillingCalculateItem {
  return { code: 'cargo', name: 'Cargo', value, currency: 'PEN', details }
}

describe('formatMoney', () => {
  it('formats the amount with the currency symbol', () => {
    expect(formatMoney(1234.5, 'PEN')).toBe('S/1,234.50')
  })

  it('returns a dash when the amount is null', () => {
    expect(formatMoney(null, 'PEN')).toBe('—')
  })
})

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

  it('shows "Sin consumo registrado" when energy consumption is null', () => {
    expect(
      getChargeDetailLine(
        buildItem({ consumption: null, unit: 'kWh', rate: 0.65, rate_unit: 'PEN/kWh' }, null)
      )
    ).toBe(NO_CONSUMPTION_LABEL)
  })

  it('shows "Sin consumo registrado" when max_power is null', () => {
    expect(
      getChargeDetailLine(
        buildItem(
          { max_power: null, max_power_datetime: null, rate: 6.25, rate_unit: 'USD/kW' },
          null
        )
      )
    ).toBe(NO_CONSUMPTION_LABEL)
  })

  it('shows "Sin consumo registrado" when reactive excess is null', () => {
    expect(
      getChargeDetailLine(
        buildItem(
          {
            consumption: null,
            active_energy_consumption: null,
            threshold_percent: 30,
            excess_consumption: null,
            unit: 'kVArh',
            rate: 0.05,
            rate_unit: 'PEN/kVArh',
          },
          null
        )
      )
    ).toBe(NO_CONSUMPTION_LABEL)
  })
})
