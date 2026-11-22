import { describe, expect, it } from 'vitest'
import { TERMS } from './terms'

const term = (id: string) => TERMS.find((t) => t.id === id)

describe('terms from the photographed German glossary', () => {
  it.each([
    ['basic-juchum-sogi', '주춤서기', 'Sitzstellung'],
    ['basic-wen-sogi', '왼서기', 'Linksstellung'],
    ['basic-oreun-sogi', '오른서기', 'Rechtsstellung'],
    ['basic-gawi-makki', '가위막기', 'Scherenblock'],
    ['basic-kyok-pa', '격파', 'Bruchtest'],
    ['basic-keup', '급', 'Schülergrad'],
    ['basic-dan', '단', 'Meistergrad'],
    ['basic-poom', '품', 'Kinder-Dan (1.-3.)'],
    ['basic-mureup-chigi', '무릎치기', 'Tritt mit dem Knie, Knieschlag'],
    ['basic-deung-jumok', '등주먹', 'Faustrücken'],
  ])('has %s with hangul %s and German meaning %s', (id, hangul, de) => {
    expect(term(id)?.hangul).toBe(hangul)
    expect(term(id)?.meaning.de).toBe(de)
  })

  it('does not duplicate any term id', () => {
    const ids = TERMS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
