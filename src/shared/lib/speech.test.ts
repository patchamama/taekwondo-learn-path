import { describe, expect, it } from 'vitest'
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
