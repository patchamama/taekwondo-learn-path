import type { Loc } from '../shared/i18n/types'
import { MORPHEMES } from './morphemes'
import { TECHNIQUES } from './techniques'
import { TECHNIQUE_HANGUL } from './hangul'
import { TERMS } from './terms'
import { FORMS, HYONG, YUDANJA } from './forms'
import { SELF_DEFENSE } from './selfDefense'

export type CardKind = 'morpheme' | 'technique' | 'term' | 'form'

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
  /** what it is, how it is executed, what it is used for */
  info?: Loc
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
    hangul: x.hangul ?? TECHNIQUE_HANGUL[x.id] ?? x.ko,
    meaning: x.names,
    karate: x.karate === '—' ? undefined : x.karate,
    parts: x.parts,
    info: x.info,
  })),
  ...HYONG.map<Card>((f) => ({
    id: f.id,
    kind: 'form',
    group: 'form-hyong',
    ko: f.ko,
    hangul: f.hangul,
    meaning: f.symbol,
  })),
  ...YUDANJA.map<Card>((f) => ({
    id: f.id,
    kind: 'form',
    group: 'form-yudanja',
    ko: f.ko,
    hangul: f.hangul,
    meaning: f.symbol,
  })),
  ...FORMS.map<Card>((f) => ({
    id: f.id,
    kind: 'form',
    group: 'form',
    ko: f.ko,
    hangul: f.hangul,
    meaning: f.symbol,
  })),
  ...SELF_DEFENSE.map<Card>((d) => ({
    id: d.id,
    kind: 'term',
    group: 'selfdefense',
    ko: d.ko,
    hangul: d.hangul,
    meaning: d.title,
    info: d.desc,
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
