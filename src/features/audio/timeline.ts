import type { PlaybackRole, PlaybackStep } from './audioPlan'

/** Seconds per clip role when the real duration is not known yet (before durations.json is generated). */
const ESTIMATE: Record<PlaybackRole, number> = { ko: 1, meaning: 2, ja: 1.5, info: 15 }

export interface Timeline {
  /** start time (s) of every step */
  starts: number[]
  total: number
}

export function buildTimeline(steps: PlaybackStep[], durations: Record<string, number>): Timeline {
  const starts: number[] = []
  let at = 0
  for (const s of steps) {
    starts.push(at)
    at += 'silence' in s ? s.silence : (durations[s.file] ?? ESTIMATE[s.role])
  }
  return { starts, total: at }
}

/** Index of the step that contains time t (clamped to the first and last step). */
export function stepAt(timeline: Timeline, t: number): number {
  const { starts } = timeline
  if (starts.length === 0) return 0
  let lo = 0
  let hi = starts.length - 1
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1
    if (starts[mid] <= t) lo = mid
    else hi = mid - 1
  }
  return lo
}

export interface Chapter {
  /** section key (words, hand, foot, stance, combo, terms, forms) or "descriptions" */
  key: string
  stepIndex: number
}

/** One chapter per section, at the first step of that section, plus the descriptions at the end. */
export function buildChapters(
  steps: PlaybackStep[],
  sectionOf: (id: string) => string | undefined,
): Chapter[] {
  const chapters: Chapter[] = []
  const seen = new Set<string>()
  steps.forEach((s, i) => {
    if ('silence' in s) return
    const key = s.role === 'info' ? 'descriptions' : sectionOf(s.id)
    if (!key || seen.has(key)) return
    seen.add(key)
    chapters.push({ key, stepIndex: i })
  })
  return chapters
}

export function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
