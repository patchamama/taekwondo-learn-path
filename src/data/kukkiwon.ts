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
}

// Source: docs/kukkiwon-terminology.md (Kukkiwon Textbook, club PDFs, self-defence course notes).
export const KUKKIWON: KukkiwonName[] = raw as KukkiwonName[]
export const KUKKIWON_BY_ID: Record<string, KukkiwonName> = Object.fromEntries(
  KUKKIWON.map((k) => [k.cardId, k]),
)
