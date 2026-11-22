import { describe, expect, it } from 'vitest'
import { AUDIO_ITEMS } from './audioManifest'
import { CARD_BY_ID } from './cards'
import { japaneseOf } from './japanese'

const jp = (id: string) => japaneseOf(CARD_BY_ID[id])

describe('japaneseOf', () => {
  it('gives word parts their karate equivalent', () => {
    expect(jp('ap')).toBe('mae')
    expect(jp('yop')).toBe('yoko')
    expect(jp('chagi')).toBe('geri')
    expect(jp('macki')).toBe('uke')
    expect(jp('chirugi')).toBe('tsuki')
    expect(jp('momtong')).toBe('chūdan')
    expect(jp('olgul')).toBe('jōdan')
    expect(jp('arae')).toBe('gedan')
  })

  it('keeps the curated karate term of a technique', () => {
    expect(jp('ap-chagi')).toBe('mae-geri')
  })

  it('composes a hand or foot technique from its parts when there is no curated term', () => {
    const composed = AUDIO_ITEMS.find(
      (i) => i.kind === 'technique' && i.jaRomaji && !CARD_BY_ID[i.id].karate,
    )
    expect(composed).toBeDefined()
    expect(composed!.jaRomaji).toMatch(/^[a-zāīūēō]+(-[a-zāīūēō]+)+$/)
    expect(jp('momtong-an-macki')).toBe('chūdan uchi-uke')
  })

  it('does not invent a Japanese stance name by gluing parts together', () => {
    expect(jp('ap-gubi')).not.toBe('mae-kutsu')
  })

  it('gives numbers, commands and everyday words a Japanese term', () => {
    expect(jp('native-hana')).toBe('ichi')
    expect(jp('native-yol')).toBe('jū')
    expect(jp('command-sijak')).toBe('hajime')
    expect(jp('command-guman')).toBe('yame')
    expect(jp('basic-dojang')).toBe('dōjō')
  })

  it('covers literal body vocabulary and established training categories', () => {
    const expected = {
      'body-ipsul': 'kuchibiru',
      'body-dunbu': 'koshi',
      'body-eongdeongi': 'shiri',
      'training-ilon': 'riron',
      'training-tae-sogi': 'tachi-kata',
      'kukkiwon-jireugi': 'tsuki',
      'kukkiwon-chigi': 'uchi',
      'kukkiwon-chagi': 'geri',
      'kukkiwon-makgi': 'uke',
      'kukkiwon-seogi': 'dachi',
      'kukkiwon-kkeokgi': 'kansetsu-waza',
      'kukkiwon-neomgigi': 'nage-waza',
      'kukkiwon-joleugi': 'shime-waza',
      'kukkiwon-poomsae': 'kata',
    }
    for (const [id, term] of Object.entries(expected)) expect(jp(id), id).toBe(term)
  })

  it('leaves Korean-specific grades and form identifiers untranslated', () => {
    expect(jp('basic-poom')).toBeUndefined()
    expect(jp('basic-taekwondoin')).toBeUndefined()
    expect(jp('kukkiwon-jang')).toBeUndefined()
  })

  it('returns nothing when there is no reliable equivalent', () => {
    expect(jp('pyonhi')).toBeUndefined()
  })
})

describe('Japanese coverage in the audio items', () => {
  it('has Japanese terms from the very first belt, not only for techniques', () => {
    expect(AUDIO_ITEMS.filter((i) => i.belt === 0 && i.ja).length).toBeGreaterThan(5)
    expect(AUDIO_ITEMS.filter((i) => i.kind === 'morpheme' && i.ja).length).toBeGreaterThan(20)
  })

  it('stores hiragana for the voice and romaji for the screen', () => {
    for (const i of AUDIO_ITEMS.filter((x) => x.ja)) {
      expect(i.ja).toMatch(/^[぀-ゟ]+$/)
      expect(i.jaRomaji).toBeTruthy()
    }
  })
})

describe('Japanese in the real plan', () => {
  it('speaks Japanese terms already at 10 Kup when the option is on, and none when it is off', async () => {
    const { buildPlayback } = await import('../features/audio/audioPlan')
    const base = {
      lang: 'es',
      maxBelt: 0,
      onlyBelt: 0,
      vocabulary: true,
      techniques: true,
      descriptions: false,
    } as const
    const roles = (japanese: boolean) =>
      buildPlayback(AUDIO_ITEMS, { ...base, japanese }).flatMap((s) =>
        'role' in s ? [s.role] : [],
      )
    expect(roles(true).filter((r) => r === 'ja').length).toBeGreaterThan(5)
    expect(roles(false)).not.toContain('ja')
  })
})
