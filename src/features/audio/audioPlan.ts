import { audioFile } from '../../data/audioFiles'
import type { AudioItem } from '../../data/audioManifest'
import type { Lang } from '../../shared/i18n/types'

export interface AudioOptions {
  lang: Lang
  /** same filter as the rest of the app: up to a belt, or one belt only */
  maxBelt: number
  onlyBelt: number | null
  /** morphemes and terms */
  vocabulary: boolean
  /** techniques and forms */
  techniques: boolean
  /** spoken description of each selected technique, after all the vocabulary */
  descriptions: boolean
  japanese: boolean
}

export type PlanStep = { file: string } | { silence: number }

/** Seconds between the Korean word and its meaning. */
export const MEANING_DELAY = 2
const AFTER_ITEM = 1.5
const BEFORE_JAPANESE = 1

export function selectItems(items: AudioItem[], o: AudioOptions): AudioItem[] {
  return items.filter((i) => {
    if (o.onlyBelt !== null ? i.belt !== o.onlyBelt : i.belt > o.maxBelt) return false
    const technique = i.kind === 'technique' || i.kind === 'form'
    return technique ? o.techniques : o.vocabulary
  })
}

/** Korean word, 2 s, meaning in the chosen language (optionally the Japanese term), then the descriptions. */
export function buildPlan(items: AudioItem[], o: AudioOptions): PlanStep[] {
  const chosen = selectItems(items, o)
  const steps: PlanStep[] = []
  for (const i of chosen) {
    steps.push({ file: audioFile('ko', i.id) }, { silence: MEANING_DELAY }, { file: audioFile(o.lang, i.id) })
    if (o.japanese && i.ja) steps.push({ silence: BEFORE_JAPANESE }, { file: audioFile('ja', i.id) })
    steps.push({ silence: AFTER_ITEM })
  }
  if (o.descriptions) {
    for (const i of chosen) {
      if (i.kind === 'technique' && i.info) steps.push({ file: audioFile(`info-${o.lang}`, i.id) }, { silence: 2 })
    }
  }
  return steps
}
