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

describe('autoplay blocked by the browser', () => {
  const spoken: string[] = []
  class BlockedAudio {
    onerror: (() => void) | null = null
    playbackRate = 1
    constructor(public src: string) {}
    play() {
      return Promise.reject(Object.assign(new Error('blocked'), { name: 'NotAllowedError' }))
    }
    pause() {}
  }
  class BrokenAudio extends BlockedAudio {
    play() {
      return Promise.reject(Object.assign(new Error('bad file'), { name: 'NotSupportedError' }))
    }
  }
  beforeEach(() => {
    spoken.length = 0
    vi.stubGlobal('SpeechSynthesisUtterance', class { lang = ''; rate = 1; voice = null; constructor(public text: string) {} })
    vi.stubGlobal('speechSynthesis', { getVoices: () => [], cancel: () => {}, speak: (u: { text: string }) => spoken.push(u.text) })
  })
  afterEach(() => vi.unstubAllGlobals())

  it('does not switch to the browser voice when the browser only blocks autoplay', async () => {
    vi.stubGlobal('Audio', BlockedAudio)
    const { speakKorean } = await import('./speech')
    const { AUDIO_ITEMS } = await import('../../data/audioManifest')
    speakKorean(AUDIO_ITEMS[0].hangul)
    await new Promise((r) => setTimeout(r, 0))
    expect(spoken).toEqual([])
  })

  it('does fall back to the browser voice when the recorded file cannot be played', async () => {
    vi.stubGlobal('Audio', BrokenAudio)
    const { speakKorean } = await import('./speech')
    const { AUDIO_ITEMS } = await import('../../data/audioManifest')
    speakKorean(AUDIO_ITEMS[0].hangul)
    await new Promise((r) => setTimeout(r, 0))
    expect(spoken).toEqual([AUDIO_ITEMS[0].hangul])
  })
})
