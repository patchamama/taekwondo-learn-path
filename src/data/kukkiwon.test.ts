import { describe, expect, it } from 'vitest'
import { CARD_BY_ID } from './cards'
import { KUKKIWON } from './kukkiwon'
import { TECHNIQUES } from './techniques'

describe('kukkiwon names', () => {
  it('every entry points to an existing card', () => {
    for (const k of KUKKIWON) expect(CARD_BY_ID[k.cardId], k.cardId).toBeDefined()
  })

  it('covers every technique card', () => {
    const ids = new Set(KUKKIWON.map((k) => k.cardId))
    for (const t of TECHNIQUES) expect(ids.has(t.id), t.id).toBe(true)
  })

  it('flags the narani-sogi false friend', () => {
    expect(KUKKIWON.find((k) => k.cardId === 'narani-sogi')?.match).toBe('different')
  })
})
