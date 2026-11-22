import { describe, expect, it } from 'vitest'
import { CARD_BY_ID } from '../../data/cards'
import { CLIPS_BY_CARD } from '../../data/clips'
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

  it('never asks for karate equivalents', () => {
    for (const l of LESSONS) {
      for (const e of buildExercises(l, makeRng(9), { max: 40 })) expect(e.type).not.toBe('karate')
    }
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
  it('applies the question limit to eligible cards, retaining mastery priority and format restrictions', () => {
    const ids = ['dojang', 'ap-chagi', 'yop-chagi']
    const mastery = { dojang: 0, 'ap-chagi': 5, 'yop-chagi': 1 }
    const list = buildPractice(ids, mastery, makeRng(1), 1, false, ['build'])
    expect(list).toHaveLength(1)
    expect(list[0]).toMatchObject({ type: 'build', cardId: 'yop-chagi' })
    expect(ids).toEqual(['dojang', 'ap-chagi', 'yop-chagi'])
    expect(mastery).toEqual({ dojang: 0, 'ap-chagi': 5, 'yop-chagi': 1 })
    expect(buildPractice(ids, mastery, makeRng(1), 1, false, [])).toEqual([])
    expect(buildPractice(['dojang'], {}, makeRng(1), 1, false, ['video'])).toEqual([])
  })

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

describe('exercise formats and families', () => {
  const lesson = {
    id: 'fam',
    unit: 'kup10',
    title: { en: '', de: '', es: '' },
    tip: { en: '', de: '', es: '' },
    cardIds: ['ap-chagi', 'yop-chagi', 'dollyo-chagi', 'momtong-chirugi', 'olgul-macki'],
  }

  it('only builds the chosen formats', () => {
    const list = buildExercises(lesson, makeRng(3), { max: 30, formats: ['recall'] })
    expect(list.length).toBeGreaterThan(0)
    expect(new Set(list.map((e) => e.type))).toEqual(new Set(['recall']))
  })

  it('offers silent video, pick-the-clip and listen-to-meaning formats for techniques with clips', () => {
    const types = new Set<string>()
    for (let seed = 1; seed < 40; seed++) {
      buildExercises(lesson, makeRng(seed), { max: 30, formats: ['video', 'pickclip', 'listenmeaning'] }).forEach((e) => types.add(e.type))
    }
    expect(types).toEqual(new Set(['video', 'pickclip', 'listenmeaning']))
  })

  it('accepts the card id as the answer of the new formats', () => {
    for (const type of ['video', 'pickclip', 'listenmeaning'] as const) {
      const ex = { type, cardId: 'ap-chagi', options: ['ap-chagi', 'yop-chagi', 'dollyo-chagi', 'olgul-macki'] }
      expect(isCorrect(ex, 'ap-chagi')).toBe(true)
      expect(isCorrect(ex, 'yop-chagi')).toBe(false)
    }
  })

  it('fills the options with terms of the same family (shared word parts) instead of unrelated ones', () => {
    let related = 0
    let total = 0
    for (let seed = 1; seed < 30; seed++) {
      for (const e of buildExercises(lesson, makeRng(seed), { max: 30, formats: ['recall'] })) {
        if (e.type !== 'recall' || e.cardId !== 'ap-chagi') continue
        for (const id of e.options.filter((o) => o !== 'ap-chagi')) {
          total++
          if (id.endsWith('chagi')) related++
        }
      }
    }
    expect(total).toBeGreaterThan(0)
    expect(related / total).toBeGreaterThan(0.6)
  })

  it('pick-the-clip options are all cards that have a clip', () => {
    for (let seed = 1; seed < 20; seed++) {
      for (const e of buildExercises(lesson, makeRng(seed), { max: 30, formats: ['pickclip'] })) {
        if (e.type !== 'pickclip') continue
        for (const id of e.options) expect(CLIPS_BY_CARD[id], id).toBeDefined()
      }
    }
  })
})

describe('formats without material', () => {
  it('leaves out cards that cannot be asked in the chosen format instead of asking something else', () => {
    const lesson = { id: 'x', unit: 'kup10', title: { en: '', de: '', es: '' }, tip: { en: '', de: '', es: '' }, cardIds: ['dojang', 'ap-chagi'] }
    const list = buildExercises(lesson as never, makeRng(5), { max: 30, formats: ['video'] })
    expect(list.every((e) => e.type === 'video')).toBe(true)
    expect(list.every((e) => 'cardId' in e && e.cardId === 'ap-chagi')).toBe(true)
    const built = buildExercises(lesson as never, makeRng(5), { max: 30, formats: ['build'] })
    expect(built.every((e) => e.type === 'build' && e.cardId === 'ap-chagi')).toBe(true) // dojang has no word parts
  })
})
