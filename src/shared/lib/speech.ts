import { audioFile } from '../../data/audioFiles'
import { AUDIO_ITEMS } from '../../data/audioManifest'

/**
 * Korean speech. Words of the course play their pre-generated high-quality clip (public/audio/ko);
 * anything else falls back to the Web Speech API (the best installed ko-KR voice).
 */

const CLIPS = new Map(AUDIO_ITEMS.map((i) => [i.hangul, audioFile('ko', i.id)]))

/** Site-relative path of the recorded clip of a Korean word, if there is one. */
export const clipFor = (text: string) => CLIPS.get(text)

let playing: HTMLAudioElement | null = null

/** What the last call to speakKorean actually used, so the UI can show whether it was the recording or the browser. */
export interface SpokenInfo {
  text: string
  source: 'mp3' | 'browser' | 'blocked'
  /** site-relative path of the mp3 (source "mp3" or "blocked") */
  file?: string
}

let last: SpokenInfo | null = null
const listeners = new Set<() => void>()
const record = (info: SpokenInfo) => {
  last = info
  listeners.forEach((l) => l())
}
export const getLastSpoken = () => last
export const subscribeSpoken = (listener: () => void) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

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

/** True when the word can be spoken: it has a recorded clip, or the browser can synthesise it. */
export const canSpeak = (text: string) => CLIPS.has(text) || speechSupported()

function playClip(file: string, text: string, slow: boolean, fallback: () => void) {
  playing?.pause()
  const audio = new Audio(import.meta.env.BASE_URL + file)
  audio.playbackRate = slow ? 0.7 : 1
  record({ text, source: 'mp3', file })
  audio.onerror = fallback
  playing = audio
  // Autoplay blocked by the browser (NotAllowedError) is not a missing file: keep the recorded voice and let the
  // next click on a speaker button play it. Only a file that cannot be played falls back to the browser voice.
  void audio.play()?.catch((e: unknown) => {
    if ((e as { name?: string })?.name === 'NotAllowedError') record({ text, source: 'blocked', file })
    else fallback()
  })
}

export function speakKorean(text: string, slow = false): boolean {
  const file = CLIPS.get(text)
  if (file) {
    playClip(file, text, slow, () => speakWithBrowser(text, slow))
    return true
  }
  return speakWithBrowser(text, slow)
}

function speakWithBrowser(text: string, slow: boolean): boolean {
  if (!speechSupported()) return false
  record({ text, source: 'browser' })
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
