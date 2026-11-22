import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { validId } from './overrides.mjs'

export function validateClips(list) {
  if (!Array.isArray(list) || list.length > 20) throw new Error('Invalid clips')
  return list.map((c) => {
    if (!c || !Number.isInteger(c.index) || c.index < 0 || c.index > 50) throw new Error('Invalid clip index')
    if (![c.start, c.end].every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100000)) throw new Error('Invalid clip range')
    if (c.end <= c.start) throw new Error('The end must be after the start')
    return { index: c.index, start: Math.round(c.start * 10) / 10, end: Math.round(c.end * 10) / 10 }
  })
}

/** Replaces the re-timed clips of a card (an empty list removes them); written atomically, sorted. */
export function saveClips(file, cardId, clips) {
  if (!validId(cardId)) throw new Error('Invalid card id')
  const all = JSON.parse(readFileSync(file, 'utf8'))
  if (clips.length === 0) delete all[cardId]
  else all[cardId] = clips
  const sorted = Object.fromEntries(Object.entries(all).sort(([a], [b]) => a.localeCompare(b)))
  const tmp = `${file}.tmp`
  writeFileSync(tmp, JSON.stringify(sorted, null, 2) + '\n')
  renameSync(tmp, file)
}

/** n moments spread evenly inside the clip (the middle of n equal slices). */
export const frameTimes = (start, end, n = 6) => Array.from({ length: n }, (_, i) => start + ((i + 0.5) / n) * (end - start))

/** Folder keys of the frames: course, selfdefense or ext-<videoId>. */
export const validFrameKey = (key) => /^(course|selfdefense|ext-[\w-]{6,20})$/.test(key)

export const ensureDir = (dir) => mkdirSync(dir, { recursive: true })
