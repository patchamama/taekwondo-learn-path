import type { Loc } from '../shared/i18n/types'
import { audioFile, type AudioTrack } from './audioFiles'
import { CARD_BY_ID, CARDS, type CardKind } from './cards'
import { cardBeltIndex } from './levels'
import { romajiToKana } from './romaji'

export interface AudioItem {
  id: string
  kind: CardKind
  /** belt index where the card is first needed (0 = 10 Kup … 10 = 1 Dan) */
  belt: number
  hangul: string
  meaning: Loc
  /** Japanese (karate) term as hiragana, when the card has one */
  ja?: string
  info?: Loc
}

export interface ClipSpec {
  track: AudioTrack
  file: string
  /** what the voice has to say */
  text: string
}

const firstKarate = (k: string) => k.split('/')[0].replace(/\(.*?\)/g, '').trim()

// An id can exist twice in CARDS (mikurumbal); use the card the app itself resolves.
export const AUDIO_ITEMS: AudioItem[] = CARDS.filter((c) => CARD_BY_ID[c.id] === c).map((c) => ({
  id: c.id,
  kind: c.kind,
  belt: cardBeltIndex(c.id),
  hangul: c.hangul,
  meaning: c.meaning,
  ja: c.karate ? (romajiToKana(firstKarate(c.karate)) ?? undefined) : undefined,
  info: c.info,
}))

/** Every clip one item needs; the generator script and the player both read this list. */
export function clipsOf(item: AudioItem): ClipSpec[] {
  const clip = (track: AudioTrack, text: string): ClipSpec => ({ track, text, file: audioFile(track, item.id) })
  const out: ClipSpec[] = [
    clip('ko', item.hangul),
    clip('en', item.meaning.en),
    clip('de', item.meaning.de),
    clip('es', item.meaning.es),
  ]
  if (item.ja) out.push(clip('ja', item.ja))
  if (item.info) {
    out.push(clip('info-en', item.info.en), clip('info-de', item.info.de), clip('info-es', item.info.es))
  }
  return out
}
