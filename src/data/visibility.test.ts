import { afterEach, expect, it, vi } from 'vitest'
import { isVisible } from './visibility'

it('hides only the explicit stable ID, never dependent techniques, without mutating data', () => {
  const hidden = ['brick']
  expect(isVisible('brick', hidden)).toBe(false)
  expect(isVisible('technique-using-brick', hidden)).toBe(true)
  expect(isVisible('ordinary', hidden)).toBe(true)
  expect(hidden).toEqual(['brick'])
})

afterEach(() => {
  vi.doUnmock('./customCards.json')
  vi.resetModules()
})

it('excludes hidden cards from public consumer pools but keeps full decomposition lookup', async () => {
  vi.resetModules()
  vi.doMock('./customCards.json', () => ({ default: { entries: [], hiddenIds: ['ap', 'ap-chagi', 'taeguk-1', 'basic-dojang'] } }))
  const { CARDS, CARD_BY_ID } = await import('./cards')
  const { MORPHEME_BY_ID } = await import('./morphemes')
  const { AUDIO_ITEMS } = await import('./audioManifest')
  const { levelContent } = await import('./levelContent')
  const { buildKnowledge } = await import('../features/bot/knowledge')
  const { buildExercises, makeRng } = await import('../features/learn/exercises')
  const hidden = ['ap', 'ap-chagi', 'taeguk-1', 'basic-dojang']
  for (const id of hidden) {
    expect(CARD_BY_ID[id]).toBeDefined()
    expect(CARDS.some((c) => c.id === id)).toBe(false)
    expect(AUDIO_ITEMS.some((c) => c.id === id)).toBe(false)
    expect(buildKnowledge().some((c) => c.id === `card:${id}`)).toBe(false)
    expect(Array.from({ length: 11 }, (_, i) => levelContent(i).cardIds).flat()).not.toContain(id)
  }
  expect(MORPHEME_BY_ID.ap).toBeDefined()
  expect(CARDS.some((c) => c.id === 'ap-gubi')).toBe(true)
  const exercises = buildExercises({ id: 'test', unit: 'kup9', title: { en: '', de: '', es: '' }, tip: { en: '', de: '', es: '' }, cardIds: [...hidden, 'ap-gubi', 'arae-macki'] }, makeRng(1), { max: 100 })
  expect(exercises.length).toBeGreaterThan(0)
  for (const ex of exercises) {
    if ('cardId' in ex) expect(hidden).not.toContain(ex.cardId)
    if ('options' in ex) for (const id of ex.options) expect(hidden).not.toContain(id)
    if ('chips' in ex) for (const id of ex.chips) expect(hidden).not.toContain(id)
  }
  expect(exercises.some((e) => 'cardId' in e && e.cardId === 'ap-gubi')).toBe(true)
})

it('custom entries reach collections, levels, practice and reading/export pools', async () => {
  vi.resetModules()
  const meaning = { en: 'New', de: 'Neu', es: 'Nuevo' }
  vi.doMock('./customCards.json', () => ({ default: { hiddenIds: [], entries: [
    { id: 'custom-word', kind: 'morpheme', ko: 'new', hangul: '새', group: 'action', family: 'action', meaning, kup: 8 },
    { id: 'custom-term', kind: 'term', ko: 'new term', hangul: '새', group: 'basic', meaning, kup: 0 },
  ] } }))
  const { CARDS } = await import('./cards')
  const { MORPHEME_BY_ID } = await import('./morphemes')
  const { cardBeltIndex } = await import('./levels')
  const { levelContent } = await import('./levelContent')
  expect(CARDS.some((c) => c.id === 'custom-word')).toBe(true)
  expect(MORPHEME_BY_ID['custom-word'].ko).toBe('new')
  expect(cardBeltIndex('custom-word')).toBe(2)
  expect(cardBeltIndex('custom-term')).toBe(10)
  expect(levelContent(2).cardIds).toContain('custom-word')
  expect(levelContent(10).cardIds).toContain('custom-term')
  // Prior behavior remains unchanged for built-in cards.
  expect(cardBeltIndex('ap-chagi')).toBe(1)
  expect(levelContent(1).cardIds).toContain('ap-chagi')
})
