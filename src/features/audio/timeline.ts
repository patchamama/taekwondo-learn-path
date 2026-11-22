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
    const key = s.pass === 'description' || s.role === 'info' ? 'descriptions' : sectionOf(s.id)
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

/** Audio chapters can run for hours without changing the existing editor clock format. */
export function formatAudioTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(s / 60)
  const remainder = String(s % 60).padStart(2, '0')
  return s >= 3600
    ? `${Math.floor(s / 3600)}:${String(minutes % 60).padStart(2, '0')}:${remainder}`
    : `${minutes}:${remainder}`
}

/** Include each section's repeated visits and their trailing pauses, even with shuffled items. */
export function chapterDurations(
  steps: PlaybackStep[],
  timeline: Timeline,
  sectionOf: (id: string) => string | undefined,
): Record<string, number> {
  const durations: Record<string, number> = {}
  let key: string | undefined
  steps.forEach((step, index) => {
    if ('id' in step) key = chapterKey(step, sectionOf)
    if (key)
      durations[key] =
        (durations[key] ?? 0) +
        (timeline.starts[index + 1] ?? timeline.total) -
        timeline.starts[index]
  })
  return durations
}

export function chapterKey(
  step: Exclude<PlaybackStep, { silence: number }>,
  sectionOf: (id: string) => string | undefined,
): string | undefined {
  return step.pass === 'description' || step.role === 'info' ? 'descriptions' : sectionOf(step.id)
}
