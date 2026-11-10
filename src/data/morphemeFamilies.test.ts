import { describe, expect, it } from 'vitest'
import { FAMILIES, examplesFor } from './morphemeFamilies'
import { MORPHEMES } from './morphemes'

describe('morpheme families', () => {
  it('every morpheme belongs to a displayed family', () => {
    const ids = new Set(FAMILIES.map((f) => f.id))
    for (const m of MORPHEMES) expect(ids.has(m.family), m.id).toBe(true)
  })

  it('keeps zones together and axis words together', () => {
    const fam = (id: string) => MORPHEMES.find((m) => m.id === id)?.family
    expect(new Set(['olgul', 'momtong', 'arae'].map(fam))).toEqual(new Set(['height']))
    expect(new Set(['ap', 'yop', 'düt'].map(fam))).toEqual(new Set(['direction-axis']))
    expect(new Set(['sonnal', 'palmok', 'batangson'].map(fam))).toEqual(new Set(['tool']))
  })

  it('lists techniques that use a morpheme', () => {
    const ex = examplesFor('macki')
    expect(ex.length).toBeGreaterThan(0)
    expect(ex.length).toBeLessThanOrEqual(5)
    for (const t of ex) expect(t.parts).toContain('macki')
  })
})
