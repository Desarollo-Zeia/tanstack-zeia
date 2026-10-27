import { describe, it, expect } from 'vitest'
import { getVoltageBand } from './voltage-thresholds'
import type { DeviceMeasurementPoint, VoltageBand } from '../types'

type BandSource = Pick<DeviceMeasurementPoint, 'thresholds' | 'monitoring_topology'>

// 3F-4H, nominal 220 V, tolerancia 5% (ejemplo del backend): line = nominal × √3
const phase4w: VoltageBand = { lower_threshold: 209.0, upper_threshold: 231.0, nominal_voltage: 220.0 }
const line4w: VoltageBand = { lower_threshold: 362.0, upper_threshold: 400.1, nominal_voltage: 381.05 }
const threePhase4w: BandSource = {
  monitoring_topology: 'three_phase_4w',
  thresholds: { voltage: { ...phase4w, phase: phase4w, line: line4w } },
}

// 3F-3H del punto 40 (tolerancias 1.9% / 7.35%): phase y line = nominal directo
const band3w: VoltageBand = { lower_threshold: 215.82, upper_threshold: 236.17, nominal_voltage: 220.0 }
const threePhase3w: BandSource = {
  monitoring_topology: 'three_phase_3w',
  thresholds: { voltage: { ...band3w, phase: band3w, line: band3w } },
}

const mono: BandSource = {
  monitoring_topology: 'mono_1f',
  thresholds: { voltage: { ...phase4w, phase: phase4w, line: line4w } },
}

describe('getVoltageBand', () => {
  it('usa la banda phase para tensiones fase-neutro (Ua/Ub/Uc)', () => {
    for (const indicator of ['Ua', 'Ub', 'Uc']) {
      expect(getVoltageBand(threePhase4w, indicator), indicator).toEqual(phase4w)
    }
  })

  it('usa la banda line (nominal × √3) para tensiones entre líneas en 3F-4H', () => {
    for (const indicator of ['Uab', 'Ubc', 'Uac']) {
      expect(getVoltageBand(threePhase4w, indicator), indicator).toEqual(line4w)
    }
  })

  it('en 3F-3H usa line para Uab/Ubc/Uac', () => {
    expect(getVoltageBand(threePhase3w, 'Uab')).toEqual(band3w)
    expect(getVoltageBand(threePhase3w, 'Uac')).toEqual(band3w)
  })

  it('en monofásico usa phase para U y no aplica banda a tensiones de línea', () => {
    expect(getVoltageBand(mono, 'U')).toEqual(phase4w)
    expect(getVoltageBand(mono, 'Uab')).toBeNull()
  })

  it('retorna null si el punto no tiene umbrales', () => {
    const noThresholds: BandSource = { monitoring_topology: 'three_phase_4w', thresholds: null }
    expect(getVoltageBand(noThresholds, 'Ua')).toBeNull()
    expect(getVoltageBand(noThresholds, 'Uab')).toBeNull()
    expect(getVoltageBand({ monitoring_topology: 'three_phase_4w', thresholds: {} }, 'Ua')).toBeNull()
  })

  it('retorna null si no hay punto de medición', () => {
    expect(getVoltageBand(null, 'Ua')).toBeNull()
    expect(getVoltageBand(undefined, 'Uab')).toBeNull()
  })

  it('retorna null para indicadores que no son tensión de fase ni de línea', () => {
    for (const indicator of ['THDVr', 'VfunA', 'V3A', 'Ia', 'P', 'ua']) {
      expect(getVoltageBand(threePhase4w, indicator), indicator).toBeNull()
    }
  })
})
