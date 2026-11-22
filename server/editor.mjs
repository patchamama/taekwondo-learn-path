import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  epubImage,
  epubList,
  extractFrame,
  findVideoFile,
  parseIndexMarkdown,
  parseTranscript,
  searchLines,
  videoDuration,
} from './library.mjs'
import { ensureDir, frameTimes, saveClips, validFrameKey, validateClips } from './clips.mjs'
import { readOverrides, saveOverride, validId, validateOverride } from './overrides.mjs'

const OVERRIDES_FILE = (root) => join(root, 'src', 'data', 'cardOverrides.json')
const CLIPS_FILE = (root) => join(root, 'src', 'data', 'clipOverrides.json')
const IMAGES_DIR = (root) => join(root, 'public', 'images', 'cards')

// Videos whose ids are fixed in src/data/clips.ts (course dubs and the self-defense compilation).
const COURSE = { es: 'vQb_6i28QK8', de: 'dnYQ1Y0acrE' }
const SELF_DEFENSE = 'crp_bNCaPqE'

/** Writes bytes under public/images/cards with a content hash name, so re-importing never duplicates. */
function storeImage(root, bytes, ext) {
  const dir = IMAGES_DIR(root)
  mkdirSync(dir, { recursive: true })
  const name = `${createHash('sha1').update(bytes).digest('hex').slice(0, 12)}.${ext}`
  const file = join(dir, name)
  if (!existsSync(file)) writeFileSync(file, bytes)
  return `images/cards/${name}`
}

function loadIndex(root) {
  const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '')
  const docs = join(root, 'docs', 'video')
  const tagged = (list, videoId, source) => list.map((l) => ({ ...l, videoId, source }))
  return [
    ...tagged(parseIndexMarkdown(read(join(docs, 'chapters.md')), 'chapters'), COURSE.de, 'chapters'),
    ...tagged(parseIndexMarkdown(read(join(docs, 'self-defense-course-map.md')), 'selfdefense'), SELF_DEFENSE, 'index'),
    ...tagged(parseTranscript(read(join(docs, 'transcript-de-dnYQ1Y0acrE.tsv'))), COURSE.de, 'subtitles'),
  ]
}

/** The videos the app uses (course, self-defense, external clips) and whether a local original exists. */
function listVideos(root) {
  const ext = JSON.parse(readFileSync(join(root, 'src', 'data', 'clips-external.json'), 'utf8'))
  const byId = new Map()
  const add = (id, label, cardId) => {
    const v = byId.get(id) ?? { id, label, cards: new Set() }
    if (cardId) v.cards.add(cardId)
    byId.set(id, v)
  }
  add(COURSE.de, 'Course (German dub)')
  add(COURSE.es, 'Course (Spanish dub)')
  add(SELF_DEFENSE, 'Self-defence compilation')
  for (const c of ext) add(c.videoId, c.label ?? c.videoId, c.cardId)
  return [...byId.values()].map((v) => ({
    id: v.id,
    label: v.label,
    cards: [...v.cards],
    local: findVideoFile(root, v.id) !== null,
  }))
}

const sameOrigin = (req) => {
  const host = req.headers.host ?? ''
  return /^(127\.0\.0\.1|localhost)(:\d+)?$/.test(host)
}

/**
 * Local editor API. Reads are open on localhost; every write also needs the custom header X-Editor, which
 * a web page on another origin cannot send without a CORS preflight (this server never answers one).
 * Returns true when the request was handled.
 */
export async function handleEditor(req, res, url, { root, send, readBody }) {
  const p = url.pathname
  const write = req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE'
  if (!p.startsWith('/api/cards') && !p.startsWith('/api/images') && !p.startsWith('/api/library') && !p.startsWith('/api/video') && !p.startsWith('/api/frame') && !p.startsWith('/api/clips')) {
    return false
  }
  if (!sameOrigin(req)) return send(res, 403, { ok: false, error: 'Forbidden host' }), true
  if (write && req.headers['x-editor'] !== '1') return send(res, 403, { ok: false, error: 'Missing X-Editor header' }), true

  try {
    // ---- cards -----------------------------------------------------------------------------
    if (req.method === 'GET' && p === '/api/cards/overrides') {
      return send(res, 200, readOverrides(OVERRIDES_FILE(root))), true
    }
    const card = p.match(/^\/api\/cards\/(.+)$/)
    if (req.method === 'PUT' && card) {
      const id = decodeURIComponent(card[1])
      if (!validId(id)) throw new Error('Invalid card id')
      const clean = validateOverride(JSON.parse(await readBody(req)))
      saveOverride(OVERRIDES_FILE(root), id, clean)
      return send(res, 200, { ok: true, override: clean }), true
    }

    // ---- images ----------------------------------------------------------------------------
    if (req.method === 'POST' && p === '/api/images') {
      const { data, ext } = JSON.parse(await readBody(req))
      if (!['jpg', 'png', 'webp'].includes(ext) || typeof data !== 'string') throw new Error('Invalid image')
      const bytes = Buffer.from(data, 'base64')
      if (bytes.length === 0 || bytes.length > 8 * 1024 * 1024) throw new Error('Image too large')
      return send(res, 200, { ok: true, src: storeImage(root, bytes, ext) }), true
    }

    // ---- EPUB library ----------------------------------------------------------------------
    if (req.method === 'GET' && p === '/api/library/epub') {
      const q = url.searchParams.get('q') ?? ''
      const offset = Number(url.searchParams.get('offset') ?? 0)
      const limit = Math.min(200, Number(url.searchParams.get('limit') ?? 60))
      return send(res, 200, epubList(root, { q, offset, limit })), true
    }
    if (req.method === 'GET' && p === '/api/library/epub/image') {
      const img = epubImage(root, url.searchParams.get('book') ?? '', url.searchParams.get('name') ?? '')
      if (!img) return send(res, 404, { ok: false }), true
      res.writeHead(200, { 'Content-Type': img.mime, 'Cache-Control': 'max-age=3600' })
      return res.end(img.bytes), true
    }
    if (req.method === 'POST' && p === '/api/library/epub/import') {
      const { book, name } = JSON.parse(await readBody(req))
      const img = epubImage(root, book, name)
      if (!img) throw new Error('Image not found')
      return send(res, 200, { ok: true, src: storeImage(root, img.bytes, img.ext), source: `${img.book.title} — ${name}` }), true
    }

    // ---- videos ----------------------------------------------------------------------------
    if (req.method === 'GET' && p === '/api/videos') return send(res, 200, listVideos(root)), true
    if (req.method === 'GET' && p === '/api/videos/search') {
      const hits = searchLines(loadIndex(root), url.searchParams.get('q') ?? '').slice(0, 80)
      return send(res, 200, hits), true
    }
    if (req.method === 'GET' && p === '/api/video/info') {
      const file = findVideoFile(root, url.searchParams.get('id') ?? '')
      if (!file) return send(res, 404, { ok: false, error: 'No local copy of this video' }), true
      return send(res, 200, { ok: true, duration: await videoDuration(file) }), true
    }
    if (req.method === 'GET' && p === '/api/frame') {
      const file = findVideoFile(root, url.searchParams.get('id') ?? '')
      if (!file) return send(res, 404, { ok: false, error: 'No local copy of this video' }), true
      const t = Number(url.searchParams.get('t') ?? 0)
      const width = Math.min(1280, Number(url.searchParams.get('w') ?? 640))
      const jpg = await extractFrame(file, Number.isFinite(t) ? t : 0, width)
      res.writeHead(200, { 'Content-Type': 'image/jpeg', 'Cache-Control': 'max-age=600' })
      return res.end(jpg), true
    }
    if (req.method === 'POST' && p === '/api/frame/save') {
      const { id, t } = JSON.parse(await readBody(req))
      const file = findVideoFile(root, id)
      if (!file || !Number.isFinite(t)) throw new Error('No local copy of this video')
      const jpg = await extractFrame(file, t, 0)
      return send(res, 200, { ok: true, src: storeImage(root, jpg, 'jpg'), source: `Video ${id} @ ${Math.round(t * 10) / 10}s` }), true
    }
    // ---- clips (re-timing and their frames) -------------------------------------------------
    if (req.method === 'PUT' && p.startsWith('/api/clips/') && p !== '/api/clips/frames') {
      const cardId = decodeURIComponent(p.slice('/api/clips/'.length))
      const { clips } = JSON.parse(await readBody(req))
      saveClips(CLIPS_FILE(root), cardId, validateClips(clips))
      return send(res, 200, { ok: true }), true
    }
    if (req.method === 'POST' && p === '/api/clips/frames') {
      const { cardId, key, videoId, start, end } = JSON.parse(await readBody(req))
      if (!validId(cardId) || !validFrameKey(key)) throw new Error('Invalid clip')
      validateClips([{ index: 0, start, end }])
      const file = findVideoFile(root, videoId) ?? (key === 'course' ? findVideoFile(root, COURSE.es) : null)
      if (!file) throw new Error('No local copy of this video')
      const dir = join(root, 'public', 'frames', key, cardId)
      ensureDir(dir)
      const times = frameTimes(start, end)
      for (let i = 0; i < times.length; i++) writeFileSync(join(dir, `${i + 1}.jpg`), await extractFrame(file, times[i], 480))
      return send(res, 200, { ok: true, frames: times.length }), true
    }
  } catch (e) {
    return send(res, 400, { ok: false, error: String(e.message ?? e) }), true
  }
  return false
}


