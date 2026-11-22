import { describe, expect, it } from 'vitest'
import { BELTS } from './belts'
import { levelContent } from './levelContent'

describe('levelContent', () => {
  it('covers every belt and never repeats a card across levels', () => {
    const seen = new Set<string>()
    BELTS.forEach((_, i) => {
      const c = levelContent(i)
      for (const id of c.cardIds) {
        expect(seen.has(id), `${id} repeated at ${i}`).toBe(false)
        seen.add(id)
      }
    })
  })
  it('10 Kup holds the first words; 9 Kup holds its exam techniques', () => {
    expect(levelContent(0).cardIds.length).toBeGreaterThan(0)
    expect(levelContent(1).cardIds).toContain('olgul-macki')
  })
  it('splits cards by kind and excludes self-defence cards', () => {
    const c = levelContent(1)
    expect(c.techniques.every((t) => t.kind === 'technique')).toBe(true)
    expect(c.morphemes.every((t) => t.kind === 'morpheme')).toBe(true)
    BELTS.forEach((_, i) =>
      expect(levelContent(i).cardIds.some((id) => id.startsWith('sd-'))).toBe(false),
    )
  })
  it('lists theory of the level and forms at 1 Dan', () => {
    expect(levelContent(2).theory.length).toBeGreaterThan(0)
    expect(levelContent(10).forms.length).toBeGreaterThan(0)
  })
})

describe('9 Kup Korean ordinals', () => {
  it('teaches the ordinal series 1st-10th in the 9 Kup reading view', () => {
    const ids = levelContent(1).theory.map((t) => t.id)
    expect(ids).toEqual(expect.arrayContaining(['th-ord-first', 'th-ord-series', 'th-ord-native']))
    const series = levelContent(1).theory.find((t) => t.id === 'th-ord-series')
    expect(series?.correct.es).toBe('il, i, sam, sa, oh, yuk, sil, pal, gu, sib')
  })
})
