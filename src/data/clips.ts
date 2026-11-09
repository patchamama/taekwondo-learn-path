import type { Lang } from '../shared/i18n/types'
import courseJson from './clips.json'
import selfDefenseJson from './clips-selfdefense.json'
import externalJson from './clips-external.json'

/** Same course, two dubs. Timestamps match within ~2 s (see docs/video/README.md). */
export const COURSE_VIDEOS = { es: 'vQb_6i28QK8', de: 'dnYQ1Y0acrE' } as const
export type VideoLanguage = keyof typeof COURSE_VIDEOS

/** 91-min Kukkiwon-style technique compilation (720p) with a chapter per technique/form. */
export const SELF_DEFENSE_VIDEO = 'crp_bNCaPqE'

export type SourceKind = 'course' | 'selfdefense' | 'external'

export interface Clip {
  cardId: string
  source: SourceKind
  start: number // seconds
  end: number
  /** external clips only: YouTube id of the video */
  videoId?: string
  /** human label (channel / title) for external clips */
  label?: string
  /** how close the shown technique is to the card */
  similarity?: 'exact' | 'similar'
  /** true if nothing on screen or in the sound reveals the technique name (safe for the silent quizzes) */
  silentSafe?: boolean
}

type RawClip = Omit<Clip, 'source'> & { source?: SourceKind }

// Course ranges sit between the course's black fades (ffmpeg blackdetect) so they never include
// the French title cards. Spoken names come from the auto captions (docs/video).
export const CLIPS: Clip[] = [
  ...(courseJson as RawClip[]).map((c) => ({ silentSafe: true, ...c, source: 'course' as const })),
  ...(selfDefenseJson as RawClip[]).map((c) => ({ ...c, source: 'selfdefense' as const })),
  ...(externalJson as RawClip[]).map((c) => ({ ...c, source: 'external' as const })),
]
export const FRAMES_PER_CLIP = 6

export const CLIPS_BY_CARD: Record<string, Clip[]> = CLIPS.reduce(
  (acc, c) => {
    ;(acc[c.cardId] ??= []).push(c)
    return acc
  },
  {} as Record<string, Clip[]>,
)

/** Cards that have at least one clip, in the order of first appearance. */
export const CARDS_WITH_CLIPS: string[] = Object.keys(CLIPS_BY_CARD)

/** Directory key of a clip's frames: `course`, `selfdefense` or `ext-<videoId>`. */
export const clipKey = (c: Clip) => (c.source === 'external' ? `ext-${c.videoId}` : c.source)

/** Pick the dub: explicit choice wins; "auto" follows the app language (English has no dub → Spanish). */
export function resolveVideoLanguage(choice: 'auto' | VideoLanguage, appLang: Lang): VideoLanguage {
  if (choice !== 'auto') return choice
  return appLang === 'de' ? 'de' : 'es'
}

export function videoIdFor(clip: Clip, language: VideoLanguage): string {
  if (clip.source === 'course') return COURSE_VIDEOS[language]
  if (clip.source === 'selfdefense') return SELF_DEFENSE_VIDEO
  return clip.videoId ?? ''
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
  return `https://www.youtube-nocookie.com/embed/${videoIdFor(clip, language)}?${q.toString()}`
}
