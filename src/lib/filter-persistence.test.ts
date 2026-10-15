import { describe, it, expect } from 'vitest'
import {
  getPersistedFilterId,
  getPersistedSelection,
  persistSelection,
} from './filter-persistence'

describe('filter-persistence', () => {
  it('returns empty selection when storage is empty', () => {
    expect(getPersistedSelection('energy')).toEqual({})
  })

  it('persists and merges selections per resource', () => {
    persistSelection('energy', { sede: 67, panel: 39 })
    persistSelection('energy', { punto: 77 })
    persistSelection('water', { sede: 199, tuberia: 1 })

    expect(getPersistedSelection('energy')).toEqual({ sede: 67, panel: 39, punto: 77 })
    expect(getPersistedSelection('water')).toEqual({ sede: 199, tuberia: 1 })
  })

  it('ignores corrupted storage gracefully', () => {
    localStorage.setItem('zeia-filter-selection', 'not-valid-json{')

    expect(getPersistedSelection('energy')).toEqual({})
  })

  it('returns a persisted id only when it exists in the candidates', () => {
    persistSelection('energy', { sede: 67, panel: 39 })

    expect(getPersistedFilterId('energy', 'sede', [{ id: 67 }, { id: 68 }])).toBe(67)
    expect(getPersistedFilterId('energy', 'sede', [{ id: 68 }])).toBeNull()
    expect(getPersistedFilterId('energy', 'punto', [{ id: 77 }])).toBeNull()
    expect(getPersistedFilterId('water', 'sede', [{ id: 67 }])).toBeNull()
  })
})
