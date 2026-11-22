import { describe, expect, it } from 'vitest'
import { bookSynonym } from './bookSpelling'

describe('bookSynonym', () => {
  it('re-spells a technique the way the German book does and adds its meaning', () => {
    expect(bookSynonym('momtong-chirugi')).toEqual({ spelling: 'Momtong-Jireugi', de: 'Fauststoß zum Körper' })
    expect(bookSynonym('arae-macki')).toEqual({ spelling: 'Arae-Makki', de: 'Tiefblock' })
    expect(bookSynonym('dwit-gubi')?.spelling).toBe('Dwit-Gubi')
    expect(bookSynonym('düt-gubi')).toEqual({ spelling: 'Dwit-Gubi', de: 'Rückwärtsstellung' })
  })

  it('keeps the plain spelling when only the meaning is known', () => {
    expect(bookSynonym('ap-chagi')).toEqual({ spelling: 'Ap-Chagi', de: 'Vorwärtstritt' })
  })

  it('returns null when the book adds nothing', () => {
    expect(bookSynonym('sambo-taeryon')).toBeNull()
    expect(bookSynonym('not-a-technique')).toBeNull()
  })
})
