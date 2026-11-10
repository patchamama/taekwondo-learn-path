import type { Loc } from '../../shared/i18n/types'

export type MorphemeFamily =
  | 'height'
  | 'direction-axis'
  | 'in-out'
  | 'motion'
  | 'action'
  | 'stance'
  | 'tool'
  | 'target'
  | 'reinforce'
  | 'count'
  | 'other'

export interface RawMorpheme {
  id: string
  hangul: string
  group: 'action' | 'zone' | 'direction' | 'tool'
  family?: MorphemeFamily
  meaning: Loc
}

export interface RawTechnique {
  id: string
  parts: string[]
  /** exam section: 7..1 Kup, 0 = 1. Dan */
  kup: number
  category: 'hand' | 'foot' | 'stance' | 'combo' | 'form'
  names: Loc
  hangul: string
  karate: string
  info?: Loc
  source?: string
}

export interface RawTerm {
  group: 'basic' | 'command' | 'training' | 'body' | 'kukkiwon'
  ko: string
  hangul: string
  meaning: Loc
  kup?: number
}

export interface RawTheory {
  id: string
  kup?: number
  question: Loc
  correct: Loc
  wrong: Loc[]
  source: 'pdf' | 'general'
}

export interface RawLesson {
  id: string
  unit: string
  title: Loc
  tip: Loc
  cardIds: string[]
  theoryIds?: string[]
  checkpoint?: boolean
}

export interface RawUnit {
  id: string
  earns?: string
  title: Loc
}

export interface RawClip {
  cardId: string
  start: number
  end: number
  silentSafe?: boolean
}

export interface CurriculumFile {
  range?: string
  morphemes?: RawMorpheme[]
  techniques?: RawTechnique[]
  terms?: RawTerm[]
  theory?: RawTheory[]
  lessons?: RawLesson[]
  units?: RawUnit[]
  clips?: RawClip[]
  unverified?: string[]
}
