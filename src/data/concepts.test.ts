import { describe, expect, it } from 'vitest'
import { CONCEPTS } from './concepts'
import { LANGS } from '../shared/i18n/types'

describe('concept reading contract', () => {
  it('provides stable unique anchor IDs and traceable substantive localized paragraphs', () => {
    expect(CONCEPTS.map((c) => c.id)).toEqual([
      'movement', 'technique-purpose', 'blocks', 'patterns', 'principles',
      'meditation', 'warmup-mobility', 'stretching', 'conditioning', 'practice',
    ])
    expect(new Set(CONCEPTS.map((c) => c.id)).size).toBe(CONCEPTS.length)
    for (const concept of CONCEPTS) {
      expect(concept.sources.length).toBeGreaterThan(0)
      for (const source of concept.sources) {
        expect(source.member).toMatch(/^OEBPS\/.+\.xhtml$/)
        expect(source.heading.length).toBeGreaterThan(5)
        expect(['sharp', 'pottle', 'mcwhorter']).toContain(source.book)
      }
      expect(concept.paragraphs.length).toBeGreaterThanOrEqual(3)
      for (const lang of LANGS) {
        expect(concept.title[lang].length).toBeGreaterThan(4)
        for (const paragraph of concept.paragraphs) expect(paragraph[lang].length).toBeGreaterThan(90)
      }
    }
  })
  it('marks meditation as optional and distinguishes exercise categories', () => {
    expect(CONCEPTS.find((c) => c.id === 'meditation')?.optional).toBe(true)
    for (const id of ['warmup-mobility', 'stretching', 'conditioning']) {
      expect(CONCEPTS.find((c) => c.id === id)?.paragraphs.length).toBeGreaterThanOrEqual(3)
    }
  })
})
