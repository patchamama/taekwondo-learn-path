import { describe, expect, it } from 'vitest'
import { buildKnowledge } from './knowledge'
import { search, tokenize } from './search'

const docs = buildKnowledge()
const top = (q: string, lang: 'en' | 'de' | 'es' = 'en', n = 3) =>
  search(docs, q, lang, n).map((r) => r.doc.id)

describe('knowledge', () => {
  it('covers cards, concepts, history, background facts and theory', () => {
    const kinds = new Set(docs.map((d) => d.kind))
    for (const k of ['card', 'concept', 'history', 'fact', 'theory'])
      expect(kinds.has(k as never), k).toBe(true)
    expect(docs.filter((d) => d.kind === 'card').length).toBeGreaterThan(400)
  })

  it('gives every document a route inside the app and text in the three languages', () => {
    for (const d of docs) {
      expect(d.route.startsWith('/'), d.id).toBe(true)
      expect(Object.keys(d.text).sort(), d.id).toEqual(['de', 'en', 'es'])
    }
  })

  it('links techniques to their videos with the start time', () => {
    const doc = docs.find((d) => d.id === 'card:ap-chagi')!
    expect(doc.videos?.length).toBeGreaterThan(0)
    expect(doc.videos![0].url).toMatch(/^https:\/\/www\.youtube\.com\/watch\?v=[\w-]+&t=\d+s$/)
  })
})

describe('tokenize', () => {
  it('ignores case, accents and punctuation', () => {
    expect(tokenize('¿Qué es el Ap-Chagi? Größe!')).toEqual([
      'que',
      'es',
      'el',
      'ap',
      'chagi',
      'große',
    ])
  })
})

describe('search', () => {
  it('finds a technique by its English, German or Spanish name and by its romanization', () => {
    expect(top('front kick')).toContain('card:ap-chagi')
    expect(top('Vorwärtsfußstoß', 'de')).toContain('card:ap-chagi')
    expect(top('Vorwärtstritt', 'de')).toContain('card:ap-chagi') // the term of the German book
    expect(top('patada frontal', 'es')).toContain('card:ap-chagi')
    expect(top('ap-chagi')[0]).toBe('card:ap-chagi')
  })

  it('finds a term and an event', () => {
    expect(top('dojang')).toContain('card:basic-dojang')
    expect(top('Kukkiwon founded')).toEqual(
      expect.arrayContaining([expect.stringMatching(/history|fact/)]),
    )
  })

  it('returns nothing for gibberish and respects the limit', () => {
    expect(search(docs, 'zzqxqxzz', 'en', 5)).toEqual([])
    expect(search(docs, 'kick', 'en', 2)).toHaveLength(2)
  })

  it('ranks title matches above text-only matches', () => {
    const results = search(docs, 'dollyo chagi', 'en', 3)
    expect(results[0].doc.id).toMatch(/dollyo-chagi/)
  })
})
