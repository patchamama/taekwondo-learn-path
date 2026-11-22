import { CLIPS_BY_CARD, FRAMES_PER_CLIP } from '../../data/clips'
import { frameSrc } from '../videos/FrameStrip'

/** The six stills of the first clip of a technique (course frames, no third-party book photos), or [] if it has none. */
export function framesFor(cardId: string): string[] {
  const clip = CLIPS_BY_CARD[cardId]?.[0]
  return clip ? Array.from({ length: FRAMES_PER_CLIP }, (_, i) => frameSrc(clip, i + 1)) : []
}
