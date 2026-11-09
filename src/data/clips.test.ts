import { describe, expect, it } from 'vitest'
import { CARD_BY_ID } from './cards'
import { CLIPS, embedUrl, resolveVideoLanguage } from './clips'

describe('clips', () => {
  it('every clip points to an existing card and has a sane range', () => {
    for (const c of CLIPS) {
      expect(CARD_BY_ID[c.cardId], c.cardId).toBeDefined()
      expect(c.end).toBeGreaterThan(c.start)
      expect(c.end - c.start).toBeLessThanOrEqual(60)
    }
  })

  it('has one clip per technique', () => {
    expect(new Set(CLIPS.map((c) => c.cardId)).size).toBe(CLIPS.length)
  })

  it('resolves the video language', () => {
    expect(resolveVideoLanguage('auto', 'de')).toBe('de')
    expect(resolveVideoLanguage('auto', 'es')).toBe('es')
    expect(resolveVideoLanguage('auto', 'en')).toBe('es')
    expect(resolveVideoLanguage('de', 'es')).toBe('de')
  })

  it('builds a muted, time-limited embed url', () => {
    const url = new URL(
      embedUrl(
        'es',
        { cardId: 'x', start: 10, end: 20 },
        { muted: true, autoplay: true, controls: false },
      ),
    )
    expect(url.hostname).toBe('www.youtube-nocookie.com')
    expect(url.pathname).toBe('/embed/vQb_6i28QK8')
    expect(url.searchParams.get('start')).toBe('10')
    expect(url.searchParams.get('end')).toBe('20')
    expect(url.searchParams.get('mute')).toBe('1')
    expect(url.searchParams.get('controls')).toBe('0')
  })
})
