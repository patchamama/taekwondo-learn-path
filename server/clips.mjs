import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { URL } from 'node:url'
import { validId } from './overrides.mjs'

export function validateClips(list) {
  if (!Array.isArray(list) || list.length > 20) throw new Error('Invalid clips')
  const indices = new Set()
  return list.map((c) => {
    if (!c || !Number.isInteger(c.index) || c.index < 0 || c.index > 50) throw new Error('Invalid clip index')
    if (Object.hasOwn(c, 'removed')) {
      if (c.removed !== true || Object.keys(c).some((key) => !['index', 'removed'].includes(key))) throw new Error('Invalid clip removal')
      if (indices.has(c.index)) throw new Error('Duplicate clip index')
      indices.add(c.index)
      return { index: c.index, removed: true }
    }
    if (![c.start, c.end].every((n) => typeof n === 'number' && Number.isFinite(n) && n >= 0 && n <= 100000)) throw new Error('Invalid clip range')
    if (c.end <= c.start) throw new Error('The end must be after the start')
    if (indices.has(c.index)) throw new Error('Duplicate clip index')
    indices.add(c.index)
    const start = Math.round(c.start * 10) / 10
    const end = Math.round(c.end * 10) / 10
    if (end <= start) throw new Error('The end must be after the start')
    return { index: c.index, start, end }
  })
}

/** Merges changed indices, preserving saved ranges; an empty list explicitly resets the card. */
export function saveClips(file, cardId, clips) {
  if (!validId(cardId)) throw new Error('Invalid card id')
  const clean = validateClips(clips)
  const all = JSON.parse(readFileSync(file, 'utf8'))
  if (clean.length === 0) delete all[cardId]
  else {
    const merged = new Map((all[cardId] ?? []).map((c) => [c.index, c]))
    for (const c of clean) merged.set(c.index, c)
    all[cardId] = [...merged.values()].sort((a, b) => a.index - b.index)
  }
  const sorted = Object.fromEntries(Object.entries(all).sort(([a], [b]) => a.localeCompare(b)))
  const tmp = `${file}.tmp`
  writeFileSync(tmp, JSON.stringify(sorted, null, 2) + '\n')
  renameSync(tmp, file)
}

/** Accept only canonical YouTube URLs, never arbitrary fetch targets. No download is performed. */
export function youtubeId(value) {
  if (typeof value !== 'string') throw new Error('Invalid video URL')
  let url
  try { url = new URL(value) } catch { throw new Error('Invalid video URL') }
  if (url.protocol !== 'https:' || url.username || url.password || url.port) throw new Error('Invalid video URL')
  let id
  if (url.hostname === 'youtu.be') id = url.pathname.slice(1)
  else if (['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)) {
    if (url.pathname === '/watch') id = url.searchParams.get('v')
    else id = url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)$/)?.[1]
  }
  if (!/^[\w-]{11}$/.test(id ?? '')) throw new Error('Invalid video URL')
  return id
}

/** Adds to the existing external-clip format consumed by clips.ts; never replaces other records. */
export function saveExternalClip(file, { cardId, url, start, end }, hasVideo = false) {
  if (!validId(cardId)) throw new Error('Invalid card id')
  const videoId = youtubeId(url)
  const range = validateClips([{ index: 0, start, end }])[0]
  const all = JSON.parse(readFileSync(file, 'utf8'))
  if (hasVideo || all.some((c) => c.cardId === cardId)) throw new Error('This technique already has a video')
  const clip = { cardId, videoId, start: range.start, end: range.end }
  const tmp = `${file}.tmp`
  writeFileSync(tmp, JSON.stringify([...all, clip], null, 2) + '\n')
  renameSync(tmp, file)
  return clip
}

/** n moments spread evenly inside the clip (the middle of n equal slices). */
export const frameTimes = (start, end, n = 6) => Array.from({ length: n }, (_, i) => start + ((i + 0.5) / n) * (end - start))

/** Folder keys of the frames: course, selfdefense or ext-<videoId>. */
export const validFrameKey = (key) => /^(course|selfdefense|ext-[\w-]{6,20})$/.test(key)

export const ensureDir = (dir) => mkdirSync(dir, { recursive: true })
