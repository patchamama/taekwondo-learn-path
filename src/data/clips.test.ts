import { describe, expect, it } from 'vitest'
import { CARD_BY_ID } from './cards'
import {
  CLIPS,
  CLIPS_BY_CARD,
  clipKey,
  embedUrl,
  resolveVideoLanguage,
  videoIdFor,
  type Clip,
} from './clips'

const course = (over: Partial<Clip> = {}): Clip => ({
  cardId: 'x',
  source: 'course',
  start: 10,
  end: 20,
  ...over,
})

describe('clips', () => {
  it('every clip points to an existing card and has a sane range', () => {
    for (const c of CLIPS) {
      expect(CARD_BY_ID[c.cardId], c.cardId).toBeDefined()
      expect(c.end).toBeGreaterThan(c.start)
      expect(c.end - c.start).toBeLessThanOrEqual(180)
    }
  })

  it('has at most one clip per card and source (external: per video)', () => {
    const keys = CLIPS.map((c) => `${c.cardId}|${clipKey(c)}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('external clips carry a video id', () => {
    for (const c of CLIPS.filter((x) => x.source === 'external'))
      expect(c.videoId, c.cardId).toBeTruthy()
  })

  it('groups clips by card', () => {
    expect(CLIPS_BY_CARD['ap-chagi'][0].source).toBe('course')
  })

  it('resolves the video language', () => {
    expect(resolveVideoLanguage('auto', 'de')).toBe('de')
    expect(resolveVideoLanguage('auto', 'es')).toBe('es')
    expect(resolveVideoLanguage('auto', 'en')).toBe('es')
    expect(resolveVideoLanguage('de', 'es')).toBe('de')
  })

  it('picks the video id per source', () => {
    expect(videoIdFor(course(), 'es')).toBe('vQb_6i28QK8')
    expect(videoIdFor(course(), 'de')).toBe('dnYQ1Y0acrE')
    expect(videoIdFor(course({ source: 'selfdefense' }), 'de')).toBe('crp_bNCaPqE')
    expect(videoIdFor(course({ source: 'external', videoId: 'abc123' }), 'es')).toBe('abc123')
  })

  it('builds a muted, time-limited embed url', () => {
    const url = new URL(embedUrl('es', course(), { muted: true, autoplay: true, controls: false }))
    expect(url.hostname).toBe('www.youtube-nocookie.com')
    expect(url.pathname).toBe('/embed/vQb_6i28QK8')
    expect(url.searchParams.get('start')).toBe('10')
    expect(url.searchParams.get('end')).toBe('20')
    expect(url.searchParams.get('mute')).toBe('1')
    expect(url.searchParams.get('controls')).toBe('0')
  })

  it('keys frames per source', () => {
    expect(clipKey(course())).toBe('course')
    expect(clipKey(course({ source: 'external', videoId: 'abc' }))).toBe('ext-abc')
  })
})

describe('previously clipless techniques', () => {
  it('links momtong-packat-macki to the course outer-block segment as a similar technique', () => {
    const c = CLIPS_BY_CARD['momtong-packat-macki']
    expect(c).toHaveLength(1)
    expect(c[0]).toMatchObject({ source: 'course', start: 2279, end: 2295, similarity: 'similar' })
  })

  it('links pyonhi-sogi to the reviewed parallel-stance video', () => {
    const c = CLIPS_BY_CARD['pyonhi-sogi']
    expect(c).toHaveLength(1)
    expect(c[0]).toMatchObject({ source: 'external', videoId: '5KJhsjbGupg', start: 12, end: 36 })
  })
})
