import raw from './background.json'
import type { Loc } from '../shared/i18n/types'

export interface BackgroundSource {
  lang: 'ko' | 'en' | 'de' | 'es'
  title: string
  url: string
}

export interface BackgroundFact {
  id: string
  topic: string
  title: Loc
  text: Loc
  hangul?: string
  sources: BackgroundSource[]
  confidence: 'high' | 'medium' | 'low'
  appFit: string
}

/** Paraphrased encyclopedic facts (Wikipedia ko/en/de/es, CC BY-SA 4.0) with their source links. See docs/sources.md. */
export const BACKGROUND: BackgroundFact[] = raw as BackgroundFact[]

export const BACKGROUND_TOPICS = [
  'history',
  'forms',
  'belts',
  'theory',
  'competition',
  'terms',
  'other',
] as const
