import type { Lang } from '../shared/i18n/types'
import clipsJson from './clips.json'

/** Same course, two dubs. Timestamps match within ~2 s (see docs/video/README.md). */
export const COURSE_VIDEOS = { es: 'vQb_6i28QK8', de: 'dnYQ1Y0acrE' } as const
export type VideoLanguage = keyof typeof COURSE_VIDEOS

export interface Clip {
  cardId: string
  start: number // seconds
  end: number
}

// Ranges sit between the course's black fades (found with ffmpeg blackdetect) so they never include
// the French title cards. Spoken names come from the auto captions (docs/video).
export const CLIPS: Clip[] = clipsJson
export const FRAMES_PER_CLIP = 6

export const CLIP_BY_CARD: Record<string, Clip> = Object.fromEntries(
  CLIPS.map((c) => [c.cardId, c]),
)

/** Pick the dub: explicit choice wins; "auto" follows the app language (English has no dub → Spanish). */
export function resolveVideoLanguage(choice: 'auto' | VideoLanguage, appLang: Lang): VideoLanguage {
  if (choice !== 'auto') return choice
  return appLang === 'de' ? 'de' : 'es'
}

interface EmbedOptions {
  muted?: boolean
  autoplay?: boolean
  controls?: boolean
}

/** Privacy-enhanced YouTube embed limited to the clip's time range. */
export function embedUrl(
  language: VideoLanguage,
  clip: Clip,
  { muted = false, autoplay = false, controls = true }: EmbedOptions = {},
) {
  const q = new URLSearchParams({
    start: String(clip.start),
    end: String(clip.end),
    autoplay: autoplay ? '1' : '0',
    mute: muted ? '1' : '0',
    controls: controls ? '1' : '0',
    disablekb: controls ? '0' : '1',
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
    cc_load_policy: '0',
    iv_load_policy: '3',
  })
  return `https://www.youtube-nocookie.com/embed/${COURSE_VIDEOS[language]}?${q.toString()}`
}
