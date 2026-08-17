export interface AxisEntry<T> {
  key: string
  label: string
  reading: T
}

export function buildUnionAxis<T>(
  groups: ReadonlyArray<ReadonlyArray<T>>,
  keyOf: (reading: T) => string,
  labelOf: (reading: T) => string
): AxisEntry<T>[] {
  const entriesByKey = new Map<string, AxisEntry<T>>()

  for (const group of groups) {
    for (const reading of group) {
      const key = keyOf(reading)
      if (!entriesByKey.has(key)) {
        entriesByKey.set(key, { key, label: labelOf(reading), reading })
      }
    }
  }

  return Array.from(entriesByKey.values()).sort((a, b) =>
    a.key < b.key ? -1 : a.key > b.key ? 1 : 0
  )
}

export function alignToAxis<T extends { value: number }>(
  readings: ReadonlyArray<T>,
  axis: ReadonlyArray<AxisEntry<T>>,
  keyOf: (reading: T) => string
): (number | null)[] {
  const valueByKey = new Map<string, number>()

  for (const reading of readings) {
    valueByKey.set(keyOf(reading), reading.value)
  }

  return axis.map((entry) => valueByKey.get(entry.key) ?? null)
}
