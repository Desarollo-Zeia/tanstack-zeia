import { describe, it, expect } from 'vitest'
import { buildUnionAxis, alignToAxis } from './align-chart-readings'

interface Reading {
  date: string
  hour: string
  value: number
}

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

function hourKey(hours: number, minutes: number): string {
  return `${pad(hours)}:${pad(minutes)}`
}

function makeFiveMinuteGrid(
  date: string,
  startHour: number,
  startMinute: number,
  endHour: number,
  endMinute: number,
  baseValue: number
): Reading[] {
  const readings: Reading[] = []
  let h = startHour
  let m = startMinute
  const endTotal = endHour * 60 + endMinute
  let total = h * 60 + m
  while (total <= endTotal) {
    readings.push({ date, hour: hourKey(h, m), value: baseValue + total })
    total += 5
    h = Math.floor(total / 60)
    m = total % 60
  }
  return readings
}

const dateTimeKey = (r: Reading) => `${r.date}|${r.hour}`

describe('buildUnionAxis', () => {
  it('creates a sorted union axis from rooms with different hour sets', () => {
    const roomA = makeFiveMinuteGrid('2026-08-17', 0, 1, 9, 1, 500)
    const roomB = makeFiveMinuteGrid('2026-08-17', 8, 46, 11, 31, 550)

    const axis = buildUnionAxis([roomA, roomB], dateTimeKey, (r) => r.hour)

    const keys = axis.map((e) => e.key)
    expect(keys).toEqual(keys.slice().sort())

    expect(new Set(keys).size).toBe(keys.length)

    expect(keys[0]).toBe('2026-08-17|00:01')
    expect(keys[keys.length - 1]).toBe('2026-08-17|11:31')

    expect(axis.length).toBeGreaterThan(roomA.length)
    expect(axis.length).toBeGreaterThan(roomB.length)
  })

  it('returns an empty axis when there are no readings', () => {
    expect(buildUnionAxis<Reading>([], (r) => r.hour, (r) => r.hour)).toEqual([])
    expect(buildUnionAxis<Reading>([[], []], (r) => r.hour, (r) => r.hour)).toEqual([])
  })

  it('orders multi-day entries by date then hour', () => {
    const day1 = [
      { date: '2026-08-17', hour: '09:02', value: 600 },
      { date: '2026-08-17', hour: '09:12', value: 607 },
    ]
    const day2 = [
      { date: '2026-08-18', hour: '08:46', value: 590 },
      { date: '2026-08-18', hour: '11:31', value: 620 },
    ]

    const axis = buildUnionAxis([day1, day2], dateTimeKey, (r) => r.hour)

    expect(axis.map((e) => e.key)).toEqual([
      '2026-08-17|09:02',
      '2026-08-17|09:12',
      '2026-08-18|08:46',
      '2026-08-18|11:31',
    ])
  })
})

describe('alignToAxis', () => {
  it('renders every value of a room with irregular hours at its correct position', () => {
    const roomA = makeFiveMinuteGrid('2026-08-17', 0, 1, 9, 1, 500)
    const zonaRoja = makeFiveMinuteGrid('2026-08-17', 8, 46, 11, 31, 550)

    const axis = buildUnionAxis([roomA, zonaRoja], dateTimeKey, (r) => r.hour)
    const aligned = alignToAxis(zonaRoja, axis, dateTimeKey)

    expect(aligned).toHaveLength(axis.length)

    const zonaRojaKeys = zonaRoja.map(dateTimeKey)
    aligned.forEach((value, index) => {
      if (zonaRojaKeys.includes(axis[index].key)) {
        expect(value).not.toBeNull()
      } else {
        expect(value).toBeNull()
      }
    })

    const lastZonaRojaReading = zonaRoja[zonaRoja.length - 1]
    const lastAxisEntry = axis[axis.length - 1]
    expect(lastAxisEntry.key).toBe(dateTimeKey(lastZonaRojaReading))
    expect(aligned[aligned.length - 1]).toBe(lastZonaRojaReading.value)
  })

  it('keeps aligned arrays index-compatible with the union axis', () => {
    const roomA = makeFiveMinuteGrid('2026-08-17', 0, 1, 9, 1, 500)
    const zonaRoja = makeFiveMinuteGrid('2026-08-17', 8, 46, 11, 31, 550)

    const axis = buildUnionAxis([roomA, zonaRoja], dateTimeKey, (r) => r.hour)
    const alignedA = alignToAxis(roomA, axis, dateTimeKey)
    const alignedB = alignToAxis(zonaRoja, axis, dateTimeKey)

    expect(alignedA).toHaveLength(alignedB.length)

    alignedB.forEach((value, index) => {
      if (value !== null) {
        const reading = zonaRoja.find((r) => dateTimeKey(r) === axis[index].key)
        expect(reading?.value).toBe(value)
      }
    })
  })
})
