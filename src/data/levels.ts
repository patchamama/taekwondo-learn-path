import { BELTS } from './belts'
import { CARD_BY_ID } from './cards'
import { FORMS, HYONG, YUDANJA, formBeltIndex } from './forms'
import { LESSONS, UNITS } from './lessons'
import { TECHNIQUES } from './techniques'

/** Belt index: 0 = 10 Kup … 9 = 1 Kup, 10 = 1 Dan. */
export const MAX_BELT_INDEX = BELTS.length - 1

/** Convert an exam section number (10..1 Kup, 0 = 1 Dan) to a belt index. */
export const kupToIndex = (kup: number): number => (kup === 0 ? MAX_BELT_INDEX : 10 - kup)

const unitIndex = (unitId: string): number => {
  const earns = UNITS.find((u) => u.id === unitId)?.earns
  const i = earns ? BELTS.findIndex((b) => b.id === earns) : -1
  return i < 0 ? 0 : i
}

let cache: Record<string, number> | null = null

function build(): Record<string, number> {
  const out: Record<string, number> = {}
  // lessons first: the first lesson that teaches a card decides its level (bonus lessons never do)
  for (const l of LESSONS) {
    if (l.unit === 'bonus') continue
    const i = unitIndex(l.unit)
    for (const id of l.cardIds) if (out[id] == null) out[id] = i
  }
  for (const t of TECHNIQUES) out[t.id] = kupToIndex(t.kup)
  for (const f of FORMS) out[f.id] = formBeltIndex(f)
  for (const y of YUDANJA) out[y.id] = formBeltIndex(y)
  for (const h of HYONG) out[h.id] = formBeltIndex(h)
  return out
}

/** Belt index at which a card is first needed. Cards not tied to a belt (bonus vocabulary) show from the start. */
export function cardBeltIndex(cardId: string): number {
  cache ??= build()
  return CARD_BY_ID[cardId] ? (cache[cardId] ?? 0) : 0
}
