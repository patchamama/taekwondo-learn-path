import { BELTS } from './belts'
import { CARD_BY_ID, type Card } from './cards'
import { CUSTOM_CARDS } from './customCards'
import { isVisible } from './visibility'
import { cardBeltIndex } from './levels'
import { LESSONS, UNITS } from './lessons'
import { TECHNIQUES } from './techniques'
import { FORMS, HYONG } from './forms'
import { THEORY_BY_ID, type TheoryItem } from './theory'

export interface LevelContent {
  cardIds: string[]
  morphemes: Card[]
  techniques: Card[]
  terms: Card[]
  forms: Card[]
  theory: TheoryItem[]
}

/** Everything a student must learn at one belt, in teaching order (reading view). */
export function levelContent(index: number): LevelContent {
  const belt = BELTS[index]
  const unitIds = new Set(UNITS.filter((u) => u.earns === belt.id).map((u) => u.id))
  const ordered: string[] = []
  const theoryIds: string[] = []
  const add = (id: string) => {
    const c = CARD_BY_ID[id]
    if (c && isVisible(id) && c.group !== 'selfdefense' && cardBeltIndex(id) === index && !ordered.includes(id))
      ordered.push(id)
  }
  for (const l of LESSONS) {
    if (!unitIds.has(l.unit)) continue
    l.cardIds.forEach(add)
    for (const t of l.theoryIds ?? []) if (!theoryIds.includes(t)) theoryIds.push(t)
  }
  CUSTOM_CARDS.forEach((c) => add(c.id))
  TECHNIQUES.forEach((t) => add(t.id))
  ;[...FORMS, ...HYONG].forEach((f) => add(f.id))
  const cards = ordered.map((id) => CARD_BY_ID[id])
  const of = (k: Card['kind']) => cards.filter((c) => c.kind === k)
  return {
    cardIds: ordered,
    morphemes: of('morpheme'),
    techniques: of('technique'),
    terms: of('term'),
    forms: of('form'),
    theory: theoryIds.map((id) => THEORY_BY_ID[id]).filter(Boolean),
  }
}

/** Everything from 10 Kup up to and including `index`, each card once, in belt order. */
export function levelContentUpTo(index: number): LevelContent {
  const parts = Array.from({ length: index + 1 }, (_, i) => levelContent(i))
  return {
    cardIds: parts.flatMap((p) => p.cardIds),
    morphemes: parts.flatMap((p) => p.morphemes),
    techniques: parts.flatMap((p) => p.techniques),
    terms: parts.flatMap((p) => p.terms),
    forms: parts.flatMap((p) => p.forms),
    theory: parts.flatMap((p) => p.theory),
  }
}
