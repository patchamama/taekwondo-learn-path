import { CLIPS_BY_CARD, clipKey } from './clips'
import { overrideOf } from './overrides'

export interface CardImage {
  src: string
  /** custom = picked in the editor (book, captured frame…); frame = still of a clip of the card */
  kind: 'custom' | 'frame'
  source?: string
  caption?: string
}

const withBase = (src: string) => (/^(https?:)?\/\//.test(src) || src.startsWith('/') ? src : import.meta.env.BASE_URL + src)

/** Images of a card: the ones chosen in the editor first, then a still of each of its clips. */
export function imagesFor(cardId: string): CardImage[] {
  const custom: CardImage[] = (overrideOf(cardId).images ?? []).map((i) => ({
    src: withBase(i.src),
    kind: 'custom',
    source: i.source,
    caption: i.caption,
  }))
  const frames: CardImage[] = (CLIPS_BY_CARD[cardId] ?? []).map((clip) => ({
    src: `${import.meta.env.BASE_URL}frames/${clipKey(clip)}/${encodeURIComponent(clip.cardId)}/3.jpg`,
    kind: 'frame',
    source: clip.label ?? clip.source,
  }))
  return [...custom, ...frames]
}
