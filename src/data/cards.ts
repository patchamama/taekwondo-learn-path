import type { Loc } from '../shared/i18n/types'
import { MORPHEMES } from './morphemes'
import { TECHNIQUES } from './techniques'
import { TECHNIQUE_HANGUL } from './hangul'
import { TERMS } from './terms'

export type CardKind = 'morpheme' | 'technique' | 'term'

/** Anything that can be studied: one Korean item with its meaning. */
export interface Card {
  id: string
  kind: CardKind
  group: string // pool for distractors
  ko: string // romanization
  hangul: string
  meaning: Loc
  karate?: string
  parts?: string[]
}

export const CARDS: Card[] = [
  ...MORPHEMES.map<Card>((m) => ({
    id: m.id,
    kind: 'morpheme',
    group: `morpheme-${m.group}`,
    ko: m.ko,
    hangul: m.hangul,
    meaning: m.meaning,
  })),
  ...TECHNIQUES.map<Card>((x) => ({
    id: x.id,
    kind: 'technique',
    group: `technique-${x.category}`,
    ko: x.ko,
    hangul: TECHNIQUE_HANGUL[x.id] ?? x.ko,
    meaning: x.names,
    karate: x.karate === '—' ? undefined : x.karate,
    parts: x.parts,
  })),
  ...TERMS.map<Card>((x) => ({
    id: x.id,
    kind: 'term',
    group: `term-${x.group}`,
    ko: x.ko,
    hangul: x.hangul,
    meaning: x.meaning,
  })),
]

export const CARD_BY_ID: Record<string, Card> = Object.fromEntries(CARDS.map((c) => [c.id, c]))
