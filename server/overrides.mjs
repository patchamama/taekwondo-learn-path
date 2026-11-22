import { readFileSync, renameSync, writeFileSync } from 'node:fs'

/** Card ids: letters, digits, space, dash, underscore, dot inside; never path-like. */
export const validId = (id) =>
  typeof id === 'string' &&
  id.length > 0 &&
  id.length <= 80 &&
  /^[\p{L}\p{N}][\p{L}\p{N} _.-]*$/u.test(id) &&
  !id.includes('..') &&
  id !== '__proto__' &&
  id !== 'constructor'

const isLoc = (v) =>
  v && typeof v === 'object' && ['en', 'de', 'es'].every((k) => typeof v[k] === 'string' && v[k].length <= 4000)

/** Image sources the site can serve: files under public/ (images, frames, diagrams) or absolute http(s) URLs. */
const IMAGE_SRC = /^(images\/cards\/[\w.-]+|frames\/[\w./%-]+|diagrams\/[\w./-]+|https?:\/\/[^\s]+)$/

export function validateOverride(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('Invalid body')
  const out = {}
  for (const key of ['ko', 'hangul']) {
    if (body[key] === undefined) continue
    if (typeof body[key] !== 'string' || body[key].length > 200) throw new Error(`Invalid ${key}`)
    if (body[key].trim()) out[key] = body[key].trim()
  }
  for (const key of ['meaning', 'info']) {
    if (body[key] === undefined) continue
    if (!isLoc(body[key])) throw new Error(`Invalid ${key}`)
    out[key] = { en: body[key].en, de: body[key].de, es: body[key].es }
  }
  if (body.kup !== undefined) {
    if (!Number.isInteger(body.kup) || body.kup < 0 || body.kup > 10) throw new Error('Invalid kup')
    out.kup = body.kup
  }
  if (body.images !== undefined) {
    if (!Array.isArray(body.images) || body.images.length > 30) throw new Error('Invalid images')
    out.images = body.images.map((i) => {
      if (!i || typeof i.src !== 'string' || !IMAGE_SRC.test(i.src) || i.src.includes('..')) throw new Error('Invalid image source')
      const img = { src: i.src }
      if (typeof i.source === 'string' && i.source) img.source = i.source.slice(0, 300)
      if (typeof i.caption === 'string' && i.caption) img.caption = i.caption.slice(0, 300)
      return img
    })
  }
  return out
}

export const readOverrides = (file) => JSON.parse(readFileSync(file, 'utf8'))

/** Replaces the override of one card (an empty override removes it) and writes the file atomically, sorted. */
export function saveOverride(file, id, override) {
  const all = readOverrides(file)
  if (Object.keys(override).length === 0) delete all[id]
  else all[id] = override
  const sorted = Object.fromEntries(Object.entries(all).sort(([a], [b]) => a.localeCompare(b)))
  const tmp = `${file}.tmp`
  writeFileSync(tmp, JSON.stringify(sorted, null, 2) + '\n')
  renameSync(tmp, file)
  return sorted
}
