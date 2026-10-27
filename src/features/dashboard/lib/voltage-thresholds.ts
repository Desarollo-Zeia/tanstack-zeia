import type { DeviceMeasurementPoint, VoltageBand } from '../types'

// Tensiones fase-neutro → banda `phase`
const PHASE_VOLTAGE_INDICATORS = new Set(['Ua', 'Ub', 'Uc', 'U'])
// Tensiones entre líneas → banda `line`
const LINE_VOLTAGE_INDICATORS = new Set(['Uab', 'Ubc', 'Uac'])

/**
 * Devuelve la banda de voltaje (voltios absolutos) que corresponde al
 * indicador graficado: `phase` para Ua/Ub/Uc/U y `line` para Uab/Ubc/Uac.
 *
 * Retorna null (no dibujar límites) cuando:
 * - el punto no tiene umbrales (`thresholds: null`, sin nominal resoluble),
 * - el indicador no es una tensión de fase ni de línea (THDV, armónicos, etc.),
 * - es una tensión de línea en un punto monofásico (`mono_1f`: no aplica).
 */
export function getVoltageBand(
  measurementPoint: Pick<DeviceMeasurementPoint, 'thresholds' | 'monitoring_topology'> | null | undefined,
  indicator: string
): VoltageBand | null {
  const voltage = measurementPoint?.thresholds?.voltage
  if (!voltage) return null

  if (PHASE_VOLTAGE_INDICATORS.has(indicator)) {
    return voltage.phase ?? null
  }

  if (LINE_VOLTAGE_INDICATORS.has(indicator)) {
    if (measurementPoint?.monitoring_topology === 'mono_1f') return null
    return voltage.line ?? null
  }

  return null
}
