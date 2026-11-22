import { describe, expect, it } from 'vitest'
import { CHOI, HISTORY_CONTEXT, HISTORY_READING_SOURCE, HISTORY_READING_TITLE, TIMELINE } from './timeline'

const languages = ['en', 'de', 'es'] as const

describe('historical distinctions', () => {
  it('separates the Toronto move, Kukkiwon and WTF foundation', () => {
    for (const language of languages) {
      expect(TIMELINE.find((event) => event.year === '1972')?.text[language]).toContain('Toronto')
      expect(TIMELINE.find((event) => event.year === '30 Nov 1972')?.text[language]).toContain('Kukkiwon')
      expect(TIMELINE.find((event) => event.year === '28 May 1973')?.text[language]).toContain('WTF')
    }
  })

  it('labels the Tangun date as tradition rather than a documented event', () => {
    const tradition = TIMELINE.find((event) => event.year === '2333 BC')!
    expect(tradition.text.en).toContain('myth')
    expect(tradition.text.de.toLowerCase()).toContain('mythos')
    expect(tradition.text.es.toLowerCase()).toContain('mito')
  })

  it('retains institutional roles and book-account qualifications in every reading language', () => {
    for (const language of languages) {
      const military = HISTORY_CONTEXT.find((topic) => topic.id === 'military-and-associations')!.paragraphs[1][language]
      for (const institution of ['KTA', 'ITF', 'Kukkiwon', 'WT']) expect(military).toContain(institution)
      expect(HISTORY_READING_SOURCE[language]).toContain('Clint Sharp')
      expect(HISTORY_READING_SOURCE[language]).toContain('OEBPS/c2A.xhtml')
      expect(HISTORY_CONTEXT.find((topic) => topic.id === 'cultural-memory')!.paragraphs[1][language]).toContain('Taekkyeon')
    }
    expect(HISTORY_CONTEXT.find((topic) => topic.id === 'olympic-development')!.paragraphs[0].en).toContain('book-reported')
    expect(HISTORY_CONTEXT.find((topic) => topic.id === 'american-pioneers')!.paragraphs[1].en).toContain('not adopted')
    expect(new Set(HISTORY_CONTEXT.map((topic) => topic.id)).size).toBe(HISTORY_CONTEXT.length)
    expect(TIMELINE.every((event) => event.source === 'general' || event.source === 'pdf')).toBe(true)
  })

  it('keeps every event, biography note and reading localized', () => {
    const reading = HISTORY_CONTEXT.flatMap((topic) => [topic.title, ...topic.paragraphs])
    for (const text of [...TIMELINE.map((event) => event.text), ...CHOI, ...reading, HISTORY_READING_SOURCE, HISTORY_READING_TITLE]) {
      expect(Object.keys(text).sort()).toEqual(['de', 'en', 'es'])
      for (const language of languages) expect(text[language].trim().length).toBeGreaterThan(10)
    }
  })
})

describe('Poomse reading from the German book', () => {
  it('summarises the forms and contrasts Poomse with Hyong in every language', () => {
    for (const language of languages) {
      const forms = HISTORY_CONTEXT.find((topic) => topic.id === 'poomse-forms')
      const diff = HISTORY_CONTEXT.find((topic) => topic.id === 'poomse-vs-hyong')
      expect(forms, 'poomse-forms').toBeDefined()
      expect(diff, 'poomse-vs-hyong').toBeDefined()
      expect(forms!.paragraphs.map((p) => p[language]).join(' ')).toMatch(/Taegeuk|Taegŭk|Taegük/)
      expect(diff!.paragraphs.map((p) => p[language]).join(' ')).toMatch(/Hyong/)
      expect(diff!.paragraphs.map((p) => p[language]).join(' ')).toMatch(/24/)
    }
  })
})
