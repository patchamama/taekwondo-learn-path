import { CARDS, CARD_BY_ID, type Card } from '../../data/cards'
import type { Lesson } from '../../data/lessons'
import { CLIPS, CLIPS_BY_CARD } from '../../data/clips'
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
  /** a sequence of stills of the technique (no names), pick which technique it is. answer = cardId */
  | { type: 'frames'; cardId: string; options: string[] }
  /** audio only, pick the romanization. answer = cardId */
  | { type: 'listen'; cardId: string; options: string[] }
  /** a silent clip of the technique, pick which technique it is. answer = cardId */
  | { type: 'video'; cardId: string; options: string[] }
  /** show the term, pick the right clip among several of the same family. answer = cardId */
  | { type: 'pickclip'; cardId: string; options: string[] }
  /** audio only, pick the meaning in the app language. answer = cardId */
  | { type: 'listenmeaning'; cardId: string; options: string[] }
  /** assemble the technique name from word blocks. answer = card.parts */
  | { type: 'build'; cardId: string; chips: string[] }
  /** theory multiple choice. option 0 of `order` is NOT special: answer index is 0 in the source list */
  | { type: 'theory'; theoryId: string; order: number[] }

export type ExerciseType = Exercise['type']

export function isCorrect(ex: Exercise, answer: string | string[] | number): boolean {
  switch (ex.type) {
    case 'meaning':
    case 'recall':
    case 'listen':
    case 'frames':
    case 'video':
    case 'pickclip':
    case 'listenmeaning':
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

const partsOf = (c: Card) => new Set(c.parts ?? [])

/** How close another card is to this one: shared word parts first, then the same group, then the same kind. */
function relatedness(card: Card, c: Card): number {
  const mine = partsOf(card)
  const shared = [...partsOf(c)].filter((p) => mine.has(p)).length
  return shared * 4 + (c.group === card.group ? 2 : 0) + (c.kind === card.kind ? 1 : 0)
}

/** Wrong options from the same family as the card (never unrelated terms while family members exist). */
function distractors(card: Card, n: number, rng: Rng, keyOf: (c: Card) => string, only?: Set<string>): string[] {
  const seen = new Set([keyOf(card)])
  // shuffled first, then a stable sort: random among equally related cards
  const pool = shuffle(
    CARDS.filter((c) => c.id !== card.id && (!only || only.has(c.id))),
    rng,
  ).sort((a, b) => relatedness(card, b) - relatedness(card, a))
  const out: string[] = []
  for (const c of pool) {
    const k = keyOf(c)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(c.id)
    if (out.length === n) break
  }
  return out
}

const withCorrect = (id: string, others: string[], rng: Rng) => shuffle([id, ...others], rng)

/** Cards that have a clip whose frames show no name (course video). */
const FRAME_CARDS = new Set(
  CLIPS.filter((c) => c.silentSafe && c.source === 'course').map((c) => c.cardId),
)

/** Cards with any clip (to show it as a still sequence or as a video). */
const CLIP_CARDS = new Set(Object.keys(CLIPS_BY_CARD))

function candidates(card: Card, rng: Rng, listening: boolean): Exercise[] {
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
    ...(listening
      ? [
          {
            type: 'listen' as const,
            cardId: card.id,
            options: withCorrect(
              card.id,
              distractors(card, 3, rng, (c) => c.ko),
              rng,
            ),
          },
        ]
      : []),
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
  if (FRAME_CARDS.has(card.id)) {
    out.push({
      type: 'frames',
      cardId: card.id,
      options: withCorrect(
        card.id,
        distractors(card, 3, rng, (c) => c.ko),
        rng,
      ),
    })
  }
  if (listening) {
    out.push({
      type: 'listenmeaning',
      cardId: card.id,
      options: withCorrect(
        card.id,
        distractors(card, 3, rng, (c) => c.meaning.en),
        rng,
      ),
    })
  }
  if (FRAME_CARDS.has(card.id)) {
    out.push({
      type: 'video',
      cardId: card.id,
      options: withCorrect(
        card.id,
        distractors(card, 3, rng, (c) => c.ko),
        rng,
      ),
    })
  }
  if (CLIP_CARDS.has(card.id)) {
    out.push({
      type: 'pickclip',
      cardId: card.id,
      options: withCorrect(
        card.id,
        distractors(card, 3, rng, (c) => c.ko, CLIP_CARDS),
        rng,
      ),
    })
  }
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
  /** include listening exercises (false when the learner has no sound) */
  listening?: boolean
  /** only these exercise formats (default: all that apply) */
  formats?: ExerciseType[]
}

/** Build the exercise list of a lesson. Every card is practised at least once. */
export function buildExercises(
  lesson: Lesson,
  rng: Rng,
  { max = 14, listening = true, formats }: BuildOptions = {},
): Exercise[] {
  // a card that has none of the chosen formats (e.g. no clip for "video") is simply left out
  const entries = lesson.cardIds
    .map((id) => CARD_BY_ID[id])
    .filter(Boolean)
    .map((c) => {
      const all = candidates(c, rng, listening)
      return { card: c, options: formats ? all.filter((e) => formats.includes(e.type)) : all }
    })
    .filter((e) => e.options.length > 0)
  const cards = entries.map((e) => e.card)
  const perCard = entries.map((e) => e.options)
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
  listening = true,
  formats?: ExerciseType[],
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
  return buildExercises(lesson, rng, { max: count, listening, formats })
}
