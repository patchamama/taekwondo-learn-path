import type { Loc } from '../shared/i18n/types'
import { audioFile, type AudioTrack } from './audioFiles'
import { CARD_BY_ID, CARDS, type CardKind } from './cards'
import { cardBeltIndex } from './levels'
import { japaneseOf } from './japanese'
import { romajiToKana } from './romaji'

/** Chapter of the study audio an item belongs to, in teaching order. */
export type AudioSection = 'words' | 'hand' | 'foot' | 'stance' | 'combo' | 'terms' | 'forms'
export const SECTION_ORDER: AudioSection[] = ['words', 'hand', 'foot', 'stance', 'combo', 'terms', 'forms']

const sectionOf = (c: (typeof CARDS)[number]): AudioSection => {
  if (c.kind === 'morpheme') return 'words'
  if (c.kind === 'term') return 'terms'
  if (c.kind === 'form') return 'forms'
  if (c.group.includes('hand')) return 'hand'
  if (c.group.includes('foot')) return 'foot'
  if (c.group.includes('stance')) return 'stance'
  if (c.group.includes('combo')) return 'combo'
  return 'forms'
}

export interface AudioItem {
  id: string
  kind: CardKind
  section: AudioSection
  /** belt index where the card is first needed (0 = 10 Kup … 10 = 1 Dan) */
  belt: number
  hangul: string
  meaning: Loc
  /** Japanese (karate) term as hiragana, for the voice, when the card has one */
  ja?: string
  /** the same term in romaji, for the screen */
  jaRomaji?: string
  info?: Loc
}

export interface ClipSpec {
  track: AudioTrack
  file: string
  /** what the voice has to say */
  text: string
}

/** Japanese term as [romaji, hiragana]; both are dropped when the romaji cannot be converted. */
const japanese = (c: (typeof CARDS)[number]): { ja?: string; jaRomaji?: string } => {
  const romaji = japaneseOf(c)
  const kana = romaji ? romajiToKana(romaji) : null
  return romaji && kana ? { ja: kana, jaRomaji: romaji } : {}
}

// An id can exist twice in CARDS (mikurumbal); use the card the app itself resolves.
export const AUDIO_ITEMS: AudioItem[] = CARDS.filter((c) => CARD_BY_ID[c.id] === c).map((c) => ({
  id: c.id,
  kind: c.kind,
  section: sectionOf(c),
  belt: cardBeltIndex(c.id),
  hangul: c.hangul,
  meaning: c.meaning,
  ...japanese(c),
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
