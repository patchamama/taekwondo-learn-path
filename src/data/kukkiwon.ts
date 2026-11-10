import raw from './kukkiwon.json'

export type KukkiwonMatch = 'same' | 'similar' | 'different' | 'none' | 'unverified'

export interface KukkiwonName {
  cardId: string
  club: string
  kukkiwon: string
  kukkiwonHangul: string
  match: KukkiwonMatch
  textbookPage: number | null
  note: string
  noteDe?: string
  noteEs?: string
}

/** Note in the app language (English is the base text). */
export const noteFor = (k: KukkiwonName, lang: 'en' | 'de' | 'es'): string =>
  (lang === 'de' ? k.noteDe : lang === 'es' ? k.noteEs : undefined) ?? k.note

// Source: docs/kukkiwon-terminology.md (Kukkiwon Textbook, club PDFs, self-defence course notes).
export const KUKKIWON: KukkiwonName[] = raw as KukkiwonName[]
export const KUKKIWON_BY_ID: Record<string, KukkiwonName> = Object.fromEntries(
  KUKKIWON.map((k) => [k.cardId, k]),
)
