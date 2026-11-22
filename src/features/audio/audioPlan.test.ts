import { describe, expect, it } from 'vitest'
import { audioFile } from '../../data/audioFiles'
import type { AudioItem } from '../../data/audioManifest'
import {
  buildPlan,
  buildPlayback,
  MEANING_DELAY,
  selectItems,
  type AudioOptions,
  type PlaybackStep,
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
    expect(roles).toEqual([
      'ko:ap-chagi',
      'meaning:ap-chagi',
      'ja:ap-chagi',
      'ko:ap-chagi',
      'meaning:ap-chagi',
      'info:ap-chagi',
    ])
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

describe('bidirectional audio', () => {
  it('finishes every forward question before asking inverse-direction questions, with descriptions last', () => {
    const clips = buildPlayback(ITEMS, opts({ bidirectional: true, descriptions: true })).filter(
      (s) => 'file' in s,
    )
    expect(clips.map((s) => `${s.id}:${s.role}`)).toEqual([
      'arae:ko',
      'arae:meaning',
      'ap-chagi:ko',
      'ap-chagi:meaning',
      'dojang:ko',
      'dojang:meaning',
      'taeguk-1:ko',
      'taeguk-1:meaning',
      'arae:meaning',
      'arae:ko',
      'ap-chagi:meaning',
      'ap-chagi:ko',
      'dojang:meaning',
      'dojang:ko',
      'taeguk-1:meaning',
      'taeguk-1:ko',
      'ap-chagi:ko',
      'ap-chagi:meaning',
      'ap-chagi:info',
    ])
  })

  it('introduces every appended description with Korean mp3 and localized meaning even without bidirectionality', () => {
    for (const lang of ['es', 'de', 'en'] as const) {
      const clips = buildPlan(ITEMS, opts({ descriptions: true, lang })).filter((s) => 'file' in s)
      expect(clips.slice(-3)).toEqual([
        { file: audioFile('ko', 'ap-chagi') },
        { file: audioFile(lang, 'ap-chagi') },
        { file: audioFile(`info-${lang}`, 'ap-chagi') },
      ])
    }
  })
  it('asks the other way round too: meaning, a 2 s pause, then the Korean word', () => {
    const steps = buildPlayback([ITEMS[0]], opts({ lang: 'de', bidirectional: true }))
    expect(steps).toEqual([
      { file: audioFile('ko', 'dojang'), role: 'ko', id: 'dojang' },
      { silence: MEANING_DELAY },
      { file: audioFile('de', 'dojang'), role: 'meaning', id: 'dojang' },
      { silence: 1.5 },
      { file: audioFile('de', 'dojang'), role: 'meaning', id: 'dojang', pass: 'reverse' },
      { silence: MEANING_DELAY },
      { file: audioFile('ko', 'dojang'), role: 'ko', id: 'dojang', pass: 'reverse' },
      { silence: 1.5 },
    ])
  })

  it('is off by default and does not change the usual plan', () => {
    const plain = buildPlayback(ITEMS, opts())
    expect(buildPlayback(ITEMS, opts({ bidirectional: false }))).toEqual(plain)
    expect(plain.some((s) => 'pass' in s)).toBe(false)
  })

  it('puts the Japanese term after the forward pair only', () => {
    const roles = buildPlayback([ITEMS[1]], opts({ japanese: true, bidirectional: true }))
      .filter((s) => 'role' in s)
      .map((s) => ('role' in s ? `${s.role}${'pass' in s ? '*' : ''}` : ''))
    expect(roles).toEqual(['ko', 'meaning', 'ja', 'meaning*', 'ko*'])
  })
})

describe('random narration', () => {
  it('shuffles complete item groups stably and keeps joined audio aligned with playback', () => {
    const o = opts({ randomSeed: 12345, descriptions: true, bidirectional: true })
    const steps = buildPlayback(ITEMS, o)
    const normal = buildPlayback(ITEMS, opts({ descriptions: true, bidirectional: true }))
    expect(steps).not.toEqual(normal)
    expect(buildPlayback(ITEMS, o)).toEqual(steps)
    expect(buildPlan(ITEMS, o)).toEqual(steps.map((s) => ('file' in s ? { file: s.file } : s)))
    const forward = steps.filter(
      (s): s is Exclude<PlaybackStep, { silence: number }> => 'file' in s && !s.pass,
    )
    expect(
      forward
        .filter((s) => s.role === 'ko')
        .map((s) => s.id)
        .sort(),
    ).toEqual(ITEMS.map((i) => i.id).sort())
    for (let i = 0; i < forward.length; i += 2) {
      expect(forward[i].role).toBe('ko')
      expect(forward[i + 1]).toMatchObject({ role: 'meaning', id: forward[i].id })
    }
    expect(
      steps
        .filter(
          (s): s is Exclude<PlaybackStep, { silence: number }> =>
            'file' in s && s.pass === 'reverse',
        )
        .map((s) => s.id),
    ).toEqual(forward.map((s) => s.id))
    expect(steps.filter((s) => 'file' in s).at(-1)).toMatchObject({
      role: 'info',
      pass: 'description',
    })
  })
})
