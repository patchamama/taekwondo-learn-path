import { describe, expect, it } from 'vitest'
import { romajiToKana } from './romaji'

describe('romajiToKana', () => {
  it.each([
    ['chūdan-zuki', 'ちゅうだんずき'],
    ['shutō-uchi', 'しゅとううち'],
    ['gedan-barai', 'げだんばらい'],
    ['jōdan age-uke', 'じょうだんあげうけ'],
    ['mae-geri', 'まえげり'],
    ['kiai', 'きあい'],
    ['seiken', 'せいけん'],
    ['tsuki', 'つき'],
    ['hikite', 'ひきて'],
    ['kekomi', 'けこみ'],
    ['yoko-geri', 'よこげり'],
    ['zenkutsu-dachi', 'ぜんくつだち'],
    ['sanbon', 'さんぼん'],
    ['kakato', 'かかと'],
  ])('%s → %s', (romaji, kana) => {
    expect(romajiToKana(romaji)).toBe(kana)
  })

  it('returns null for text it cannot convert', () => {
    expect(romajiToKana('???')).toBeNull()
    expect(romajiToKana('')).toBeNull()
  })
})
