/** Korean text-to-speech via the Web Speech API (uses the best installed ko-KR voice). */

export function scoreVoice(
  v: Pick<SpeechSynthesisVoice, 'name' | 'lang' | 'localService'>,
): number {
  if (!v.lang.toLowerCase().startsWith('ko')) return -1
  let s = 1
  if (/natural|neural/i.test(v.name)) s += 6
  if (/online/i.test(v.name)) s += 4
  if (/google/i.test(v.name)) s += 3
  if (/yuna|sora|sun-?hi|inJoon|heami|seoyeon/i.test(v.name)) s += 2
  if (v.lang.toLowerCase() === 'ko-kr') s += 1
  return s
}

export function pickKoreanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined {
  return voices
    .map((v) => ({ v, s: scoreVoice(v) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)[0]?.v
}

export const speechSupported = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function speakKorean(text: string, slow = false): boolean {
  if (!speechSupported()) return false
  const synth = window.speechSynthesis
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ko-KR'
  const voice = pickKoreanVoice(synth.getVoices())
  if (voice) u.voice = voice
  u.rate = slow ? 0.55 : 0.85
  synth.cancel()
  synth.speak(u)
  return true
}
