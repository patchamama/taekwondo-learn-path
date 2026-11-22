import { existsSync, readFileSync, writeFileSync, renameSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { validId } from './overrides.mjs'

export const readCustomCatalogue = (file) => existsSync(file)
  ? JSON.parse(readFileSync(file, 'utf8')) : { entries: [], hiddenIds: [] }

const fail = (field) => { throw new Error(`Invalid ${field}`) }
const text = (value, field, max = 200) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail(field)
  return value.trim()
}
const loc = (value, field) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(field)
  return Object.fromEntries(['en', 'de', 'es'].map((lang) => [lang, text(value[lang], field, 4000)]))
}
const choice = (value, options, field) => options.includes(value) ? value : fail(field)
const integer = (value, min, max, field) => Number.isInteger(value) && value >= min && value <= max ? value : fail(field)

/** One schema per existing catalogue kind. Unknown fields are rejected, never silently persisted. */
export function validateCustomCard(body, catalogue) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) fail('body')
  if (!validId(body.id)) fail('card id')
  if (catalogue.some((c) => c.id === body.id)) throw new Error('Card id already exists')
  const kind = choice(body.kind, ['technique', 'morpheme', 'term', 'form'], 'kind')
  const out = { id: body.id, kind, ko: text(body.ko, 'ko'), hangul: text(body.hangul, 'hangul'), kup: integer(body.kup, 0, 10, 'kup') }
  if (kind === 'technique') {
    out.category = choice(body.category, ['hand', 'foot', 'stance', 'combo'], 'category')
    if (!Array.isArray(body.parts) || body.parts.length > 30 || !body.parts.every((id) => catalogue.some((c) => c.id === id && c.kind === 'morpheme'))) fail('parts')
    out.parts = [...body.parts]
    out.names = loc(body.names, 'names')
    out.karate = text(body.karate, 'karate')
    if (body.info !== undefined) out.info = loc(body.info, 'info')
  } else if (kind === 'morpheme') {
    out.group = choice(body.group, ['action', 'zone', 'direction', 'tool'], 'group')
    out.family = choice(body.family, ['height', 'direction-axis', 'in-out', 'motion', 'action', 'stance', 'tool', 'target', 'reinforce', 'count', 'other'], 'family')
    out.meaning = loc(body.meaning, 'meaning')
  } else if (kind === 'term') {
    out.group = choice(body.group, ['sino', 'native', 'command', 'basic', 'training', 'body', 'kukkiwon'], 'group')
    out.meaning = loc(body.meaning, 'meaning')
  } else {
    out.system = choice(body.system, ['taegeuk', 'hyong', 'yudanja'], 'system')
    out.moves = integer(body.moves, 1, 1000, 'moves')
    out.symbol = loc(body.symbol, 'symbol')
    out.meaning = loc(body.meaning, 'meaning')
    if (out.system === 'taegeuk') {
      out.kukkiwon = text(body.kukkiwon, 'kukkiwon')
      if (body.courseKeup !== undefined) out.courseKeup = integer(body.courseKeup, 1, 10, 'courseKeup')
    } else {
      if (body.examDan !== undefined) {
        if (out.kup !== 0) fail('examDan')
        out.examDan = integer(body.examDan, 1, 9, 'examDan')
      }
      if (body.source !== undefined) out.source = text(body.source, 'source', 1000)
    }
  }
  for (const key of Object.keys(body)) if (!Object.hasOwn(out, key)) fail(key)
  return out
}

/** All catalogue writes use this one atomic writer; hiding never touches overrides or progress. */
function saveCatalogue(file, data) {
  const sorted = { entries: [...data.entries].sort((a, b) => a.id.localeCompare(b.id)), hiddenIds: [...new Set(data.hiddenIds)].sort((a, b) => a.localeCompare(b)) }
  const tmp = `${file}.tmp`
  writeFileSync(tmp, JSON.stringify(sorted, null, 2) + '\n')
  renameSync(tmp, file)
}
export function createCustomCard(file, body, catalogue) {
  const data = readCustomCatalogue(file)
  const entry = validateCustomCard(body, [...catalogue, ...data.entries])
  saveCatalogue(file, { ...data, entries: [...data.entries, entry] })
  return entry
}
export function setCardHidden(file, id, hidden, catalogue) {
  const data = readCustomCatalogue(file)
  if (!validId(id) || ![...catalogue, ...data.entries].some((c) => c.id === id)) throw new Error('Unknown card id')
  if (typeof hidden !== 'boolean') fail('hidden')
  saveCatalogue(file, { ...data, hiddenIds: hidden ? [...data.hiddenIds, id] : data.hiddenIds.filter((x) => x !== id) })
  return { id, hidden }
}

/** Reuse Vite's actual TS/JSON/glob catalogue loader (also used by the NotebookLM exporter).
 * No source parsing, client-supplied ID registry, network, or persistent Vite cache.
 * Only the built-in IDs are cached; current custom IDs are read from disk on every write.
 */
const catalogues = new Map()
export async function existingCatalogue(root) {
  if (!catalogues.has(root)) catalogues.set(root, (async () => {
    const { createServer } = await import('vite')
    const server = await createServer({ root, configFile: false, envFile: false, cacheDir: join(tmpdir(), 'taekwondo-catalogue-vite'), logLevel: 'silent', server: { middlewareMode: true, watch: null }, appType: 'custom' })
    try {
      const { ALL_CARDS } = await server.ssrLoadModule('/src/data/cards.ts')
      const { CUSTOM_CARDS } = await server.ssrLoadModule('/src/data/customCards.ts')
      const customIds = new Set(CUSTOM_CARDS.map((c) => c.id))
      return ALL_CARDS.filter((c) => !customIds.has(c.id)).map(({ id, kind }) => ({ id, kind }))
    } finally { await server.close() }
  })())
  return catalogues.get(root)
}
