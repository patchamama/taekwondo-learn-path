import { CARD_BY_ID } from '../../data/cards'
import { CLIPS, type Clip } from '../../data/clips'
import { shuffle, type Rng } from '../learn/exercises'

export interface VideoRound {
  cardId: string
  /** the clip shown in this round (always silent-safe) */
  clip: Clip
  options: string[] // card ids, includes cardId once
}

/** Pick `count` techniques and 3 distractor names for each. Only clips whose sound/screen do not reveal the name. */
export function buildVideoRounds(
  rng: Rng,
  count = 8,
  allowed: (cardId: string) => boolean = () => true,
): VideoRound[] {
  const safe = CLIPS.filter((c) => c.silentSafe && allowed(c.cardId))
  const pool = [...new Set(safe.map((c) => c.cardId))]
  return shuffle(pool, rng)
    .slice(0, count)
    .map((cardId) => {
      const own = CARD_BY_ID[cardId]
      const clip = shuffle(
        safe.filter((c) => c.cardId === cardId),
        rng,
      )[0]
      const others = shuffle(
        pool.filter((id) => id !== cardId),
        rng,
      )
      const sameGroup = others.filter((id) => CARD_BY_ID[id].group === own.group)
      const rest = others.filter((id) => CARD_BY_ID[id].group !== own.group)
      const seen = new Set([own.meaning.en])
      const picks: string[] = []
      for (const id of [...sameGroup, ...rest]) {
        const key = CARD_BY_ID[id].meaning.en
        if (seen.has(key)) continue
        seen.add(key)
        picks.push(id)
        if (picks.length === 3) break
      }
      return { cardId, clip, options: shuffle([cardId, ...picks], rng) }
    })
}
