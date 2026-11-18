import { describe, expect, it } from 'vitest'
import { TECHNIQUES } from './techniques'
import { CARDS } from './cards'
import { BELTS } from './belts'
import { levelContent } from './levelContent'

const baseIds = 'momtong-chirugi hansonnal-mok-chicki arae-macki olgul-macki momtong-an-macki momtong-packat-macki hansonnal-arae-macki momtong-hansonnal-packat-macki sonnal-momtong-kotoro-macki goduro-packat-palmok-packat-macki ap-chagi dollyo-chagi yop-chagi naeryo-chagi düt-chagi moa-sogi pyonhi-sogi chuchum-sogi ap-sogi ap-gubi düt-gubi saju-macki twio-chagi twio-ap-chagi an-naeryo-chagi packat-naeryo-chagi gibon-junbi-sogi narani-sogi saju-chirugi'.split(' ')
const languages = ['en', 'de', 'es'] as const

describe('EPUB technique enrichment through public study data', () => {
  it('preserves the beginner ID order and club labels', () => {
    expect(TECHNIQUES.slice(0, baseIds.length).map((t) => t.id)).toEqual(baseIds)
    expect(TECHNIQUES.find((t) => t.id === 'ap-chagi')?.names).toEqual({
      en: 'Front kick', de: 'Vorwärtsfußstoß', es: 'Patada frontal',
    })
    expect(TECHNIQUES.find((t) => t.id === 'narani-sogi')?.info?.en).toContain('club')
    for (const lang of languages) {
      expect(TECHNIQUES.find((t) => t.id === 'narani-sogi')?.info?.[lang]).toContain('Kukkiwon')
    }
  })

  it.each([
    ['ap-chagi', ['Recover', 'Zurück', 'Recoge']],
    ['otgoro-arae-macki', ['wrists', 'Handgelenke', 'muñecas']],
    ['me-jumok-naeryo-chicki', ['pad', 'Polster', 'pao']],
    ['sonnaldung-an-mok-chicki', ['thumb', 'Daumen', 'pulgar']],
  ] as const)('propagates enriched %s in all languages to cards and levels', (id, cues) => {
    const technique = TECHNIQUES.find((t) => t.id === id)!
    const card = CARDS.find((c) => c.kind === 'technique' && c.id === id)!
    const lessonCards = BELTS.flatMap((_, i) => levelContent(i).techniques)
    const lessonCard = lessonCards.find((c) => c.id === id)!
    expect(lessonCard).toBeDefined()
    languages.forEach((lang, i) => {
      expect(technique.info?.[lang]).toContain(cues[i])
      expect(card.info?.[lang]).toBe(technique.info?.[lang])
      expect(lessonCard.info?.[lang]).toBe(technique.info?.[lang])
      expect(card.meaning[lang]).toBe(technique.names[lang])
    })
  })

  it('keeps every edited description trilingual and available in the course', () => {
    const higherIds = [
      'otgoro-arae-macki', 'pyonsonkut-sewo-jirugi',
      'dung-jumok-olgul-ape-chicki', 'me-jumok-naeryo-chicki',
      'sonnaldung-an-mok-chicki', 'bom-sogi', 'an-palmok-gawi-macki', 'murup-chicki',
    ]
    const lessonCards = BELTS.flatMap((_, i) => levelContent(i).techniques)
    for (const id of [...baseIds, ...higherIds]) {
      const technique = TECHNIQUES.find((t) => t.id === id)!
      const card = CARDS.find((c) => c.kind === 'technique' && c.id === id)!
      const lessonCard = lessonCards.find((c) => c.id === id)!
      expect(lessonCard, id).toBeDefined()
      expect(card.ko).toBe(technique.ko)
      expect(card.meaning).toEqual(technique.names)
      for (const lang of languages) {
        expect(technique.info?.[lang].length, `${id}/${lang}`).toBeGreaterThan(80)
        expect(card.info?.[lang]).toBe(technique.info?.[lang])
        expect(lessonCard.info?.[lang]).toBe(technique.info?.[lang])
      }
    }
  })
})
