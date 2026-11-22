import { audioFile } from '../../data/audioFiles'
import { SECTION_ORDER, type AudioItem } from '../../data/audioManifest'
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

export type PlaybackRole = 'ko' | 'meaning' | 'ja' | 'info'

/** A plan step that also says which word and part it is, so the player can write it after it is said. */
export type PlaybackStep = { file: string; role: PlaybackRole; id: string } | { silence: number }

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
export function buildPlayback(items: AudioItem[], o: AudioOptions): PlaybackStep[] {
  // grouped by section so the chapters are contiguous; the order inside a section is the course order
  const chosen = selectItems(items, o).sort(
    (a, b) => SECTION_ORDER.indexOf(a.section) - SECTION_ORDER.indexOf(b.section),
  )
  const steps: PlaybackStep[] = []
  for (const i of chosen) {
    steps.push(
      { file: audioFile('ko', i.id), role: 'ko', id: i.id },
      { silence: MEANING_DELAY },
      { file: audioFile(o.lang, i.id), role: 'meaning', id: i.id },
    )
    if (o.japanese && i.ja)
      steps.push(
        { silence: BEFORE_JAPANESE },
        { file: audioFile('ja', i.id), role: 'ja', id: i.id },
      )
    steps.push({ silence: AFTER_ITEM })
  }
  if (o.descriptions) {
    for (const i of chosen) {
      if (i.kind === 'technique' && i.info) {
        steps.push(
          { file: audioFile(`info-${o.lang}`, i.id), role: 'info', id: i.id },
          { silence: 2 },
        )
      }
    }
  }
  return steps
}

/** The same plan without the display tags, as the backend and the browser builder expect it. */
export function buildPlan(items: AudioItem[], o: AudioOptions): PlanStep[] {
  return buildPlayback(items, o).map((s) => ('file' in s ? { file: s.file } : s))
}
