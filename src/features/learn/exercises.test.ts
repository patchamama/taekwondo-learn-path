import { describe, expect, it } from 'vitest'
import { CARD_BY_ID } from '../../data/cards'
import { LESSONS } from '../../data/lessons'
import { THEORY_BY_ID } from '../../data/theory'
import { buildExercises, buildPractice, isCorrect, makeRng } from './exercises'

describe('content integrity', () => {
  it('every lesson card and theory id exists', () => {
    for (const l of LESSONS) {
      for (const id of l.cardIds) expect(CARD_BY_ID[id], `${l.id}: ${id}`).toBeDefined()
      for (const id of l.theoryIds ?? []) expect(THEORY_BY_ID[id], `${l.id}: ${id}`).toBeDefined()
    }
  })

  it('every card has hangul for speech', () => {
    for (const c of Object.values(CARD_BY_ID)) expect(c.hangul, c.id).toMatch(/[가-힣]/)
  })

  it('card ids are unique', () => {
    const ids = Object.keys(CARD_BY_ID)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('buildExercises', () => {
  const lesson = LESSONS.find((l) => l.id === 'u2-blocks')!

  it('is deterministic for a given seed', () => {
    expect(buildExercises(lesson, makeRng(7))).toEqual(buildExercises(lesson, makeRng(7)))
  })

  it('practises every card of the lesson at least once', () => {
    const ex = buildExercises(lesson, makeRng(1))
    for (const id of lesson.cardIds)
      expect(ex.some((e) => 'cardId' in e && e.cardId === id)).toBe(true)
  })

  it('options always contain the correct answer exactly once and have no duplicate meanings', () => {
    for (const l of LESSONS) {
      for (const e of buildExercises(l, makeRng(3))) {
        if (e.type === 'meaning' || e.type === 'recall' || e.type === 'listen') {
          expect(e.options.filter((o) => o === e.cardId)).toHaveLength(1)
          expect(new Set(e.options).size).toBe(e.options.length)
          expect(e.options.length).toBeGreaterThanOrEqual(2)
        }
        if (e.type === 'meaning') {
          const labels = e.options.map((o) => CARD_BY_ID[o].meaning.en)
          expect(new Set(labels).size).toBe(labels.length)
        }
        if (e.type === 'karate') expect(e.options).toContain(CARD_BY_ID[e.cardId].karate)
      }
    }
  })

  it('build exercises use the parts plus one decoy and accept the right order only', () => {
    const l = LESSONS.find((x) => x.id === 'u2-blocks')!
    const build = buildExercises(l, makeRng(5), { max: 40 }).find((e) => e.type === 'build')
    expect(build).toBeDefined()
    if (build?.type !== 'build') return
    const parts = CARD_BY_ID[build.cardId].parts!
    expect(build.chips).toHaveLength(parts.length + 1)
    expect(isCorrect(build, parts)).toBe(true)
    expect(isCorrect(build, [...parts].reverse())).toBe(parts.length === 1)
  })

  it('theory answer is index 0 of the source list', () => {
    const th = buildExercises(
      LESSONS.find((l) => l.id === 'u1-theory')!,
      makeRng(2),
    ).filter((e) => e.type === 'theory')
    expect(th.length).toBeGreaterThan(0)
    for (const e of th) {
      if (e.type !== 'theory') continue
      expect([...e.order].sort()).toEqual([0, 1, 2, 3])
      expect(isCorrect(e, 0)).toBe(true)
      expect(isCorrect(e, 1)).toBe(false)
    }
  })
})

describe('buildPractice', () => {
  it('prefers the least mastered cards', () => {
    const ex = buildPractice(
      ['macki', 'chagi', 'olgul'],
      { macki: 5, chagi: 0, olgul: 3 },
      makeRng(1),
      1,
    )
    expect(ex.every((e) => 'cardId' in e && e.cardId === 'chagi')).toBe(true)
  })
})
