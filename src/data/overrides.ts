import type { Loc } from '../shared/i18n/types'
import raw from './cardOverrides.json'

export interface CardImageOverride {
  /** path relative to the site base (public/…), or an absolute URL */
  src: string
  /** where the picture comes from (book and page, video and time…) */
  source?: string
  caption?: string
}

/**
 * Edits made in the local editor (backend running): texts, Kup and images of any card, saved in
 * cardOverrides.json so the deployed site uses the improved data. Only the fields present are overridden.
 */
export interface CardOverride {
  ko?: string
  hangul?: string
  meaning?: Loc
  info?: Loc
  /** belt index: 0 = 10 Kup … 10 = 1 Dan */
  kup?: number
  images?: CardImageOverride[]
}

export const OVERRIDES: Record<string, CardOverride> = raw as Record<string, CardOverride>

export const overrideOf = (id: string): CardOverride => OVERRIDES[id] ?? {}
