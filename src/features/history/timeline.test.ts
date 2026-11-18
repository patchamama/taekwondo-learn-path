import { describe, expect, it } from 'vitest'
import { CHOI, TIMELINE } from './timeline'

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

  it('keeps every event and biography note localized', () => {
    for (const text of [...TIMELINE.map((event) => event.text), ...CHOI]) {
      expect(Object.keys(text).sort()).toEqual(['de', 'en', 'es'])
      for (const language of languages) expect(text[language].trim().length).toBeGreaterThan(10)
    }
  })
})
