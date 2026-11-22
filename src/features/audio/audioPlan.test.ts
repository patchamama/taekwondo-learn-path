import { describe, expect, it } from 'vitest'
import { audioFile } from '../../data/audioFiles'
import type { AudioItem } from '../../data/audioManifest'
import {
  buildPlan,
  buildPlayback,
  MEANING_DELAY,
  selectItems,
  type AudioOptions,
} from './audioPlan'

const SECTION = { morpheme: 'words', technique: 'hand', term: 'terms', form: 'forms' } as const

const item = (
  id: string,
  kind: AudioItem['kind'],
  belt: number,
  extra: Partial<AudioItem> = {},
): AudioItem => ({
  id,
  kind,
  section: SECTION[kind],
  belt,
  hangul: id,
  meaning: { en: id, de: id, es: id },
  ...extra,
})

const ITEMS = [
  item('dojang', 'term', 0),
  item('ap-chagi', 'technique', 1, { ja: 'まえげり', info: { en: 'i', de: 'i', es: 'i' } }),
  item('arae', 'morpheme', 1),
  item('taeguk-1', 'form', 2),
]

const opts = (o: Partial<AudioOptions> = {}): AudioOptions => ({
  lang: 'es',
  maxBelt: 10,
  onlyBelt: null,
  vocabulary: true,
  techniques: true,
  descriptions: false,
  japanese: false,
  ...o,
})

describe('selectItems', () => {
  it('keeps only one belt when it is the only one chosen (10 Kup)', () => {
    expect(selectItems(ITEMS, opts({ onlyBelt: 0 })).map((i) => i.id)).toEqual(['dojang'])
  })

  it('covers every belt up to the chosen one when several are selected', () => {
    expect(selectItems(ITEMS, opts({ maxBelt: 1 })).map((i) => i.id)).toEqual([
      'dojang',
      'ap-chagi',
      'arae',
    ])
  })

  it('splits vocabulary from techniques', () => {
    expect(selectItems(ITEMS, opts({ techniques: false })).map((i) => i.id)).toEqual([
      'dojang',
      'arae',
    ])
    expect(selectItems(ITEMS, opts({ vocabulary: false })).map((i) => i.id)).toEqual([
      'ap-chagi',
      'taeguk-1',
    ])
  })
})

describe('buildPlan', () => {
  it('says the Korean word, waits 2 seconds, then the meaning in the chosen language', () => {
    const plan = buildPlan([ITEMS[0]], opts({ lang: 'de' }))
    expect(plan.slice(0, 3)).toEqual([
      { file: audioFile('ko', 'dojang') },
      { silence: MEANING_DELAY },
      { file: audioFile('de', 'dojang') },
    ])
    expect(MEANING_DELAY).toBe(2)
  })

  it('adds the Japanese term only when requested and available', () => {
    const files = (o: Partial<AudioOptions>) =>
      buildPlan(ITEMS, opts(o)).flatMap((s) => ('file' in s ? [s.file] : []))
    expect(files({ japanese: true })).toContain(audioFile('ja', 'ap-chagi'))
    expect(files({ japanese: false })).not.toContain(audioFile('ja', 'ap-chagi'))
    expect(files({ japanese: true }).filter((f) => f.includes('/ja/'))).toHaveLength(1)
  })

  it('puts the technique descriptions at the end, in the chosen language', () => {
    const plan = buildPlan(ITEMS, opts({ descriptions: true, lang: 'en' }))
    const last = plan.filter((s): s is { file: string } => 'file' in s).pop()!
    expect(last.file).toBe(audioFile('info-en', 'ap-chagi'))
    expect(
      buildPlan(ITEMS, opts({ descriptions: false })).some(
        (s) => 'file' in s && s.file.includes('/info-'),
      ),
    ).toBe(false)
  })
})

describe('buildPlayback', () => {
  it('tags every clip with its role and item so the player can write the word after it is said', () => {
    const steps = buildPlayback(
      [ITEMS[1]],
      opts({ japanese: true, descriptions: true, lang: 'de' }),
    )
    const roles = steps
      .filter((s) => 'role' in s)
      .map((s) => ('role' in s ? `${s.role}:${s.id}` : ''))
    expect(roles).toEqual(['ko:ap-chagi', 'meaning:ap-chagi', 'ja:ap-chagi', 'info:ap-chagi'])
  })

  it('matches buildPlan once the tags are removed', () => {
    const o = opts({ japanese: true, descriptions: true })
    expect(buildPlan(ITEMS, o)).toEqual(
      buildPlayback(ITEMS, o).map((s) => ('file' in s ? { file: s.file } : s)),
    )
  })
})

describe('buildPlayback order', () => {
  it('groups the items by chapter: words, techniques, terms, forms', () => {
    const order = buildPlayback(ITEMS, opts())
      .filter((s) => 'role' in s && s.role === 'ko')
      .map((s) => ('id' in s ? s.id : ''))
    expect(order).toEqual(['arae', 'ap-chagi', 'dojang', 'taeguk-1'])
  })
})
