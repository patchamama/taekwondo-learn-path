import type { Lang } from '../shared/i18n/types'

/** Same course, two dubs. Timestamps match within ~2 s (see docs/video/README.md). */
export const COURSE_VIDEOS = { es: 'vQb_6i28QK8', de: 'dnYQ1Y0acrE' } as const
export type VideoLanguage = keyof typeof COURSE_VIDEOS

export interface Clip {
  cardId: string
  start: number // seconds
  end: number
}

// Source: auto captions of the course video (docs/video). Start = moment the instructor names the technique.
export const CLIPS: Clip[] = [
  { cardId: 'moa-sogi', start: 831, end: 838 },
  { cardId: 'gibon-junbi-sogi', start: 838, end: 848 },
  { cardId: 'chuchum-sogi', start: 848, end: 857 },
  { cardId: 'ap-sogi', start: 857, end: 866 },
  { cardId: 'düt-gubi', start: 874, end: 882 },
  { cardId: 'ap-gubi', start: 884, end: 891 },
  { cardId: 'arae-macki', start: 902, end: 944 },
  { cardId: 'momtong-an-macki', start: 944, end: 972 },
  { cardId: 'olgul-macki', start: 972, end: 995 },
  { cardId: 'momtong-chirugi', start: 1041, end: 1056 },
  { cardId: 'hansonnal-mok-chicki', start: 1106, end: 1118 },
  { cardId: 'ap-chagi', start: 1202, end: 1240 },
  { cardId: 'yop-chagi', start: 1240, end: 1264 },
  { cardId: 'dollyo-chagi', start: 1264, end: 1297 },
  { cardId: 'düt-chagi', start: 1297, end: 1332 },
]

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
