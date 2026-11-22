import raw from './customCards.json'
import type { Technique } from './techniques'
import type { Morpheme } from './morphemes'
import type { Term } from './terms'
import type { Form, Hyong } from './forms'

/** kup always means exam number: 10..1 Kup, 0 = 1 Dan (NOT a belt index). */
type Common = { kup: number }
export type CustomCard =
  | (Technique & Common & { kind: 'technique'; category: 'hand' | 'foot' | 'stance' | 'combo'; hangul: string })
  | (Morpheme & Common & { kind: 'morpheme' })
  | (Term & Common & { kind: 'term' })
  | (Omit<Form, 'examKup' | 'courseKeup'> & Common & { kind: 'form'; system: 'taegeuk'; courseKeup?: number })
  | (Omit<Hyong, 'examKup' | 'examDan'> & Common & { kind: 'form'; system: 'hyong' | 'yudanja'; examDan?: number })

export interface CustomCatalogue { entries: CustomCard[]; hiddenIds: string[] }
export const CUSTOM_CATALOGUE = raw as CustomCatalogue
export const CUSTOM_CARDS = CUSTOM_CATALOGUE.entries

/** Type-specific adapters run before the existing collection indexes are built. */
export function adaptCustomCards(entries: CustomCard[]) {
  const techniques: Technique[] = []
  const morphemes: Morpheme[] = []
  const terms: Term[] = []
  const forms: Form[] = []
  const hyong: Hyong[] = []
  const yudanja: Hyong[] = []
  for (const entry of entries) {
    if (entry.kind === 'technique') techniques.push(entry)
    else if (entry.kind === 'morpheme') morphemes.push(entry)
    else if (entry.kind === 'term') terms.push(entry)
    else if (entry.system === 'taegeuk') forms.push({ ...entry, examKup: entry.kup })
    else {
      const form: Hyong = { ...entry, ...(entry.examDan != null ? { examDan: entry.examDan } : { examKup: entry.kup }) }
      ;(entry.system === 'hyong' ? hyong : yudanja).push(form)
    }
  }
  return { techniques, morphemes, terms, forms, hyong, yudanja }
}
export const CUSTOM = adaptCustomCards(CUSTOM_CARDS)
export const customKupOf = (id: string) => CUSTOM_CARDS.find((c) => c.id === id)?.kup
