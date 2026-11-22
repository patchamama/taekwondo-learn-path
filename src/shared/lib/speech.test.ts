import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { pickKoreanVoice } from './speech'

const v = (name: string, lang: string) =>
  ({ name, lang, localService: true }) as SpeechSynthesisVoice

describe('pickKoreanVoice', () => {
  it('ignores non-Korean voices', () => {
    expect(pickKoreanVoice([v('Alex', 'en-US'), v('Anna', 'de-DE')])).toBeUndefined()
  })
  it('prefers neural / online voices over basic ones', () => {
    const basic = v('Yuna', 'ko-KR')
    const neural = v('Microsoft SunHi Online (Natural) - Korean', 'ko-KR')
    expect(pickKoreanVoice([basic, neural])).toBe(neural)
  })
  it('accepts ko_KR style variants', () => {
    const x = v('Google 한국의', 'ko-KR')
    expect(pickKoreanVoice([v('Alex', 'en-US'), x])).toBe(x)
  })
})

describe('speakKorean with pre-generated voices', () => {
  const instances: { src: string; playbackRate: number; played: boolean; paused: boolean }[] = []
  class FakeAudio {
    src: string
    playbackRate = 1
    played = false
    paused = false
    onerror: (() => void) | null = null
    constructor(src: string) {
      this.src = src
      instances.push(this)
    }
    play() {
      this.played = true
      return Promise.resolve()
    }
    pause() {
      this.paused = true
    }
  }

  beforeEach(() => {
    instances.length = 0
    vi.stubGlobal('Audio', FakeAudio)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('plays the recorded clip of a known word instead of the browser voice', async () => {
    const { speakKorean, clipFor } = await import('./speech')
    const { AUDIO_ITEMS } = await import('../../data/audioManifest')
    const item = AUDIO_ITEMS[0]
    expect(clipFor(item.hangul)).toMatch(/^audio\/ko\//)
    expect(speakKorean(item.hangul)).toBe(true)
    expect(instances).toHaveLength(1)
    expect(instances[0].src).toContain(clipFor(item.hangul))
    expect(instances[0].played).toBe(true)
    expect(instances[0].playbackRate).toBe(1)
  })

  it('slows the recorded clip for the turtle button and stops the previous one', async () => {
    const { speakKorean } = await import('./speech')
    const { AUDIO_ITEMS } = await import('../../data/audioManifest')
    speakKorean(AUDIO_ITEMS[0].hangul)
    speakKorean(AUDIO_ITEMS[1].hangul, true)
    expect(instances[0].paused).toBe(true)
    expect(instances[1].playbackRate).toBe(0.7)
  })

  it('reports a recorded word as speakable even without the Web Speech API', async () => {
    const { canSpeak } = await import('./speech')
    const { AUDIO_ITEMS } = await import('../../data/audioManifest')
    expect(canSpeak(AUDIO_ITEMS[0].hangul)).toBe(true)
  })
})
