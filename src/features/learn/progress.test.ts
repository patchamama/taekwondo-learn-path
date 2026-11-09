import { describe, expect, it } from 'vitest'
import { LESSONS, lessonsOfUnit } from '../../data/lessons'
import {
  activeStreak,
  heldBeltIndex,
  isUnlocked,
  learnedCardIds,
  nextLesson,
  starsFor,
  updateStreak,
} from './progress'

const done = (ids: string[]) => Object.fromEntries(ids.map((i) => [i, 3]))

describe('lesson unlocking', () => {
  it('only the first lesson is open at start', () => {
    expect(isUnlocked(LESSONS[0].id, {})).toBe(true)
    expect(isUnlocked(LESSONS[1].id, {})).toBe(false)
  })
  it('opens the next lesson after completing one', () => {
    expect(isUnlocked(LESSONS[1].id, done([LESSONS[0].id]))).toBe(true)
  })
  it('nextLesson follows the order', () => {
    expect(nextLesson(done([LESSONS[0].id]))?.id).toBe(LESSONS[1].id)
  })
})

describe('belt progression', () => {
  it('starts at 10 Kup (index 0)', () => {
    expect(heldBeltIndex({})).toBe(0)
  })
  it('earns 9 Kup after unit 2 and 8 Kup after unit 3', () => {
    const u1 = lessonsOfUnit('kup10').map((l) => l.id)
    const u2 = lessonsOfUnit('kup9').map((l) => l.id)
    const u3 = lessonsOfUnit('kup8').map((l) => l.id)
    expect(heldBeltIndex(done(u1))).toBe(0)
    expect(heldBeltIndex(done([...u1, ...u2]))).toBe(1)
    expect(heldBeltIndex(done([...u1, ...u2, ...u3]))).toBe(2)
  })
  it('does not earn a belt if an earlier unit is incomplete', () => {
    expect(heldBeltIndex(done(lessonsOfUnit('kup9').map((l) => l.id)))).toBe(0)
  })
})

describe('streak and stars', () => {
  it('counts consecutive days and resets after a gap', () => {
    let s = updateStreak({ count: 0, last: null }, '2026-11-09')
    s = updateStreak(s, '2026-11-09')
    expect(s.count).toBe(1)
    s = updateStreak(s, '2026-11-10')
    expect(s.count).toBe(2)
    s = updateStreak(s, '2026-11-13')
    expect(s.count).toBe(1)
  })
  it('shows a broken streak as 0', () => {
    expect(activeStreak({ count: 5, last: '2026-11-01' }, '2026-11-09')).toBe(0)
    expect(activeStreak({ count: 5, last: '2026-11-08' }, '2026-11-09')).toBe(5)
  })
  it('awards stars by accuracy', () => {
    expect(starsFor(10, 10)).toBe(3)
    expect(starsFor(8, 10)).toBe(2)
    expect(starsFor(5, 10)).toBe(1)
  })
})

describe('learnedCardIds', () => {
  it('collects cards from completed lessons only', () => {
    expect(learnedCardIds({})).toEqual([])
    expect(learnedCardIds(done([LESSONS[0].id])).length).toBe(LESSONS[0].cardIds.length)
  })
})
