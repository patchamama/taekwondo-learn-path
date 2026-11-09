import { CARDS, CARD_BY_ID, type Card } from '../../data/cards'
import type { Lesson } from '../../data/lessons'
import { THEORY_BY_ID } from '../../data/theory'

export type Rng = () => number

/** Small deterministic PRNG (mulberry32) so tests can pin the output. */
export function makeRng(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(items: T[], rng: Rng): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export type Exercise =
  /** show Korean (+audio), pick the meaning. answer = cardId */
  | { type: 'meaning'; cardId: string; options: string[] }
  /** show the meaning, pick the Korean term. answer = cardId */
  | { type: 'recall'; cardId: string; options: string[] }
  /** audio only, pick the romanization. answer = cardId */
  | { type: 'listen'; cardId: string; options: string[] }
  /** assemble the technique name from word blocks. answer = card.parts */
  | { type: 'build'; cardId: string; chips: string[] }
  /** theory multiple choice. option 0 of `order` is NOT special: answer index is 0 in the source list */
  | { type: 'theory'; theoryId: string; order: number[] }

export function isCorrect(ex: Exercise, answer: string | string[] | number): boolean {
  switch (ex.type) {
    case 'meaning':
    case 'recall':
    case 'listen':
      return answer === ex.cardId
    case 'build': {
      const parts = CARD_BY_ID[ex.cardId].parts ?? []
      return (
        Array.isArray(answer) &&
        answer.length === parts.length &&
        answer.every((x, i) => x === parts[i])
      )
    }
    case 'theory':
      return answer === 0
  }
}

function distractors(card: Card, n: number, rng: Rng, keyOf: (c: Card) => string): string[] {
  const own = keyOf(card)
  const seen = new Set([own])
  const pick = (pool: Card[]) =>
    shuffle(pool, rng).filter((c) => {
      const k = keyOf(c)
      if (c.id === card.id || seen.has(k)) return false
      seen.add(k)
      return true
    })
  const sameGroup = pick(CARDS.filter((c) => c.group === card.group))
  const sameKind = pick(CARDS.filter((c) => c.kind === card.kind))
  const rest = pick(CARDS)
  return [...sameGroup, ...sameKind, ...rest].slice(0, n).map((c) => c.id)
}

const withCorrect = (id: string, others: string[], rng: Rng) => shuffle([id, ...others], rng)

function candidates(card: Card, rng: Rng): Exercise[] {
  const out: Exercise[] = [
    {
      type: 'meaning',
      cardId: card.id,
      options: withCorrect(
        card.id,
        distractors(card, 3, rng, (c) => c.meaning.en),
        rng,
      ),
    },
    {
      type: 'listen',
      cardId: card.id,
      options: withCorrect(
        card.id,
        distractors(card, 3, rng, (c) => c.ko),
        rng,
      ),
    },
    {
      type: 'recall',
      cardId: card.id,
      options: withCorrect(
        card.id,
        distractors(card, 3, rng, (c) => c.ko),
        rng,
      ),
    },
  ]
  if (card.parts && card.parts.length >= 2) {
    // add a decoy word block so it is not a pure ordering task
    const extra = shuffle(
      CARDS.filter((c) => c.kind === 'morpheme' && !card.parts!.includes(c.id)),
      rng,
    )[0]
    out.push({ type: 'build', cardId: card.id, chips: shuffle([...card.parts, extra.id], rng) })
  }
  return out
}

export interface BuildOptions {
  max?: number
}

/** Build the exercise list of a lesson. Every card is practised at least once. */
export function buildExercises(
  lesson: Lesson,
  rng: Rng,
  { max = 14 }: BuildOptions = {},
): Exercise[] {
  const cards = lesson.cardIds.map((id) => CARD_BY_ID[id]).filter(Boolean)
  const perCard = cards.map((c) => candidates(c, rng))
  const target = cards.length === 0 ? 0 : Math.min(max, Math.max(cards.length * 2, 6))
  const list: Exercise[] = []
  for (let round = 0; list.length < target && round < 5; round++) {
    for (let i = 0; i < cards.length && list.length < target; i++) {
      const opts = perCard[i]
      const ex = opts[(i + round) % opts.length]
      if (!list.includes(ex)) list.push(ex)
    }
  }
  const filled = list
  const theory: Exercise[] = (lesson.theoryIds ?? []).map((theoryId) => ({
    type: 'theory',
    theoryId,
    order: shuffle(THEORY_BY_ID[theoryId].wrong.map((_, i) => i + 1).concat(0), rng),
  }))
  return [...shuffle(filled, rng), ...theory]
}

/** Review lesson from the weakest cards (lowest mastery first). */
export function buildPractice(
  learnedCardIds: string[],
  mastery: Record<string, number>,
  rng: Rng,
  count = 10,
): Exercise[] {
  const sorted = [...learnedCardIds].sort((a, b) => (mastery[a] ?? 0) - (mastery[b] ?? 0))
  const weakest = sorted.slice(0, count)
  const lesson: Lesson = {
    id: 'practice',
    unit: 'kup10',
    title: { en: '', de: '', es: '' },
    tip: { en: '', de: '', es: '' },
    cardIds: weakest,
  }
  return buildExercises(lesson, rng, { max: count })
}
