import { describe, expect, it } from 'vitest'
import { AUDIO_ITEMS, clipsOf } from './audioManifest'
import { CARDS } from './cards'

describe('audio manifest', () => {
  it('has one item per card id', () => {
    expect(AUDIO_ITEMS).toHaveLength(new Set(CARDS.map((c) => c.id)).size)
  })

  it('lists Korean and the three meanings for every item, with unique files', () => {
    const files = AUDIO_ITEMS.flatMap((i) => clipsOf(i).map((c) => c.file))
    expect(new Set(files).size).toBe(files.length)
    for (const i of AUDIO_ITEMS) {
      const tracks = clipsOf(i).map((c) => c.track)
      expect(tracks).toEqual(expect.arrayContaining(['ko', 'en', 'de', 'es']))
    }
  })

  it('gives karate terms a Japanese clip in hiragana without the "approx." marker', () => {
    const ap = AUDIO_ITEMS.find((i) => i.ja)
    expect(ap).toBeDefined()
    for (const i of AUDIO_ITEMS.filter((x) => x.ja)) expect(i.ja).toMatch(/^[぀-ゟ]+$/)
  })

  it('only adds description clips to items that have a description', () => {
    for (const i of AUDIO_ITEMS) {
      const hasInfo = clipsOf(i).some((c) => c.track.startsWith('info-'))
      expect(hasInfo).toBe(Boolean(i.info))
    }
  })
})
