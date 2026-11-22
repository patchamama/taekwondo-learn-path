import { afterEach, describe, expect, it, vi } from 'vitest'

const loc = (v: string) => ({ en: v, de: v, es: v })

async function withOverrides(data: Record<string, unknown>) {
  vi.resetModules()
  vi.doMock('./cardOverrides.json', () => ({ default: data }))
  const terms = await import('./terms')
  const techniques = await import('./techniques')
  const cards = await import('./cards')
  const levels = await import('./levels')
  const morphemes = await import('./morphemes')
  return { terms, techniques, cards, levels, morphemes }
}

afterEach(() => {
  vi.doUnmock('./cardOverrides.json')
  vi.resetModules()
})

describe('card overrides', () => {
  it('leave the data untouched when there are none', async () => {
    const { terms } = await withOverrides({})
    expect(terms.TERMS.find((t) => t.id === 'basic-dojang')?.meaning.en).toBe('training hall')
  })

  it('replace the text of a term everywhere it is shown (terms list and cards)', async () => {
    const { terms, cards } = await withOverrides({
      'basic-dojang': { meaning: loc('martial arts hall'), hangul: '도장!', ko: 'dojang' },
    })
    expect(terms.TERMS.find((t) => t.id === 'basic-dojang')?.meaning.en).toBe('martial arts hall')
    expect(cards.CARD_BY_ID['basic-dojang'].meaning.es).toBe('martial arts hall')
    expect(cards.CARD_BY_ID['basic-dojang'].hangul).toBe('도장!')
  })

  it('replace the names and description of a technique and the meaning of a word part', async () => {
    const { techniques, morphemes, cards } = await withOverrides({
      'ap-chagi': { meaning: loc('front kick (edited)'), info: loc('Edited description') },
      ap: { meaning: loc('front (edited)') },
    })
    expect(techniques.TECHNIQUES.find((t) => t.id === 'ap-chagi')?.names.en).toBe('front kick (edited)')
    expect(techniques.TECHNIQUES.find((t) => t.id === 'ap-chagi')?.info?.en).toBe('Edited description')
    expect(morphemes.MORPHEMES.find((m) => m.id === 'ap')?.meaning.en).toBe('front (edited)')
    expect(cards.CARD_BY_ID['ap-chagi'].info?.en).toBe('Edited description')
  })

  it('move a card to another Kup', async () => {
    const before = await withOverrides({})
    const original = before.levels.cardBeltIndex('basic-dojang')
    const moved = await withOverrides({ 'basic-dojang': { kup: original === 5 ? 6 : 5 } })
    expect(moved.levels.cardBeltIndex('basic-dojang')).toBe(original === 5 ? 6 : 5)
  })

  it('exposes the images of a card', async () => {
    vi.resetModules()
    vi.doMock('./cardOverrides.json', () => ({ default: { 'ap-chagi': { images: [{ src: 'images/cards/a.jpg', source: 'Book p. 3' }] } } }))
    const { imagesFor } = await import('./cardImages')
    const list = imagesFor('ap-chagi')
    expect(list[0]).toMatchObject({ src: '/images/cards/a.jpg', source: 'Book p. 3', kind: 'custom' })
    expect(list.some((i) => i.kind === 'frame')).toBe(true)
  })
})
