import { CARD_BY_ID } from '../../data/cards'
import { CLIPS } from '../../data/clips'
import { shuffle, type Rng } from '../learn/exercises'

export interface VideoRound {
  cardId: string
  options: string[] // card ids, includes cardId once
}

/** Pick `count` clips and 3 distractor names for each. Distractors prefer the same kind of technique. */
export function buildVideoRounds(rng: Rng, count = 8): VideoRound[] {
  const pool = CLIPS.map((c) => c.cardId)
  return shuffle(pool, rng)
    .slice(0, count)
    .map((cardId) => {
      const own = CARD_BY_ID[cardId]
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
      return { cardId, options: shuffle([cardId, ...picks], rng) }
    })
}
