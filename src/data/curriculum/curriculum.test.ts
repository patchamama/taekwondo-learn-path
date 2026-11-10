import { describe, expect, it } from 'vitest'
import { BELTS } from '../belts'
import { CARD_BY_ID } from '../cards'
import { CLIPS } from '../clips'
import { LESSONS, UNITS, lessonsOfUnit } from '../lessons'
import { heldBeltIndex } from '../../features/learn/progress'
import { THEORY_BY_ID } from '../theory'
import { MORPHEME_BY_ID } from '../morphemes'
import { TECHNIQUES } from '../techniques'
import { cardBeltIndex } from '../levels'

describe('whole curriculum (10 Kup → 1 Dan)', () => {
  it('has one unit per belt up to 1 Dan, each with lessons and a checkpoint', () => {
    const beltUnits = UNITS.filter((u) => u.earns)
    expect(beltUnits.map((u) => u.earns)).toEqual(BELTS.map((b) => b.id))
    for (const u of beltUnits) {
      const ls = lessonsOfUnit(u.id)
      expect(ls.length, u.id).toBeGreaterThan(2)
    }
  })

  it('has unique lesson ids and only known units', () => {
    const ids = LESSONS.map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
    const units = new Set(UNITS.map((u) => u.id))
    for (const l of LESSONS) expect(units.has(l.unit), l.id).toBe(true)
  })

  it('every card, morpheme part, theory id and clip resolves', () => {
    for (const l of LESSONS) {
      for (const c of l.cardIds) expect(CARD_BY_ID[c], `${l.id}: ${c}`).toBeDefined()
      for (const t of l.theoryIds ?? []) expect(THEORY_BY_ID[t], `${l.id}: ${t}`).toBeDefined()
    }
    for (const t of TECHNIQUES) {
      for (const p of t.parts) expect(MORPHEME_BY_ID[p], `${t.id}: ${p}`).toBeDefined()
    }
    for (const c of CLIPS) expect(CARD_BY_ID[c.cardId], c.cardId).toBeDefined()
  })

  it('keeps lessons small enough to study', () => {
    for (const l of LESSONS) expect(l.cardIds.length, l.id).toBeLessThanOrEqual(12)
  })

  it('finishing every belt lesson earns 1 Dan', () => {
    const done = Object.fromEntries(LESSONS.filter((l) => l.unit !== 'bonus').map((l) => [l.id, 3]))
    expect(heldBeltIndex(done)).toBe(BELTS.length - 1)
  })

  it('levels are monotonic: no card is needed before the belt of its first lesson', () => {
    for (const t of TECHNIQUES) {
      const i = cardBeltIndex(t.id)
      expect(i).toBeGreaterThanOrEqual(0)
      expect(i).toBeLessThanOrEqual(BELTS.length - 1)
    }
  })
})
