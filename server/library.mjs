import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'
import { listZip, readZipEntry } from './zip.mjs'

/** Parses docs/video/chapters.md and self-defense-course-map.md tables into { t (seconds), text }. */
export function parseIndexMarkdown(text, kind) {
  const out = []
  for (const line of text.split('\n')) {
    if (!line.startsWith('|')) continue
    const cells = line.split('|').slice(1, -1).map((c) => c.trim())
    if (kind === 'chapters') {
      // | 822 | Les positions | moa, gibon-junbi … |   (the first cell may read "47 (0:47)")
      const m = cells[0]?.match(/^(\d+)\b/)
      if (m && cells.length >= 2) out.push({ t: Number(m[1]), text: cells.slice(1).join(' · ').replace(/\*\*/g, '') })
    } else {
      // | 01 | 0:00:00 | 0 | Jireugi | Oenjumeogjireugi … |
      if (/^\d+$/.test(cells[0] ?? '') && /^\d+:\d\d:\d\d$/.test(cells[1] ?? '') && /^\d+$/.test(cells[2] ?? '')) {
        out.push({ t: Number(cells[2]), text: cells.slice(3).join(' · ').replace(/\*|`/g, '') })
      }
    }
  }
  return out
}

/** Parses a "start<TAB>end<TAB>text" transcript. */
export function parseTranscript(text) {
  const out = []
  for (const line of text.split('\n')) {
    const [a, , ...rest] = line.split('\t')
    const t = Number(a)
    if (Number.isFinite(t) && rest.length) out.push({ t, text: rest.join('\t').trim() })
  }
  return out
}

const norm = (s) => s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

export function searchLines(lines, query) {
  const words = norm(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return []
  return lines.filter((l) => words.every((w) => norm(l.text).includes(w)))
}

/** Folders that may hold the original videos (the SSD archive first). Extra folders: TKD_VIDEO_DIRS. */
export function videoDirs(root) {
  const extra = (process.env.TKD_VIDEO_DIRS ?? '').split(process.platform === 'win32' ? ';' : ':').filter(Boolean)
  return [
    ...extra,
    join(root, 'video', 'epub-backup', 'originals'),
    '/Volumes/sdd_1TB/taekwondo-resources/video/epub-backup/originals',
    join(homedir(), 'Movies', 'Hapkido-Taekwondo', 'Videos'),
  ].filter((d) => existsSync(d))
}

export function findVideoFile(root, id) {
  if (!/^[\w-]{6,20}$/.test(id)) return null
  for (const dir of videoDirs(root)) {
    for (const f of readdirSync(dir)) {
      if (f.includes(`[${id}]`) || basename(f).startsWith(`${id}.`)) return join(dir, f)
    }
  }
  return null
}

const run = (cmd, args, opts = {}) =>
  new Promise((ok, fail) =>
    execFile(cmd, args, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024, ...opts }, (err, stdout, stderr) =>
      err ? fail(new Error(String(stderr).slice(0, 300) || err.message)) : ok(stdout),
    ),
  )

export const videoDuration = async (file) =>
  Number.parseFloat((await run('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file])).toString())

/** One JPEG frame of a local video at time t (seconds); width 0 keeps the original size. */
export const extractFrame = (file, t, width) =>
  run('ffmpeg', [
    '-v', 'error', '-ss', String(Math.max(0, t)), '-i', file, '-frames:v', '1',
    ...(width ? ['-vf', `scale=${width}:-2`] : []),
    '-q:v', width ? '4' : '2', '-f', 'image2pipe', '-vcodec', 'mjpeg', 'pipe:1',
  ])

// ---- EPUB image library -------------------------------------------------------------------------

const MIN_BYTES = 20_000
const MIME = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' }

let library = null

/** Reads every EPUB of docs/ once and lists its images (>= 20 KB). Kept in memory while the server runs. */
export function epubLibrary(root) {
  if (library) return library
  const books = []
  for (const dir of [join(root, 'docs', 'clint-sharp'), join(root, 'docs', 'integrar')]) {
    if (!existsSync(dir)) continue
    for (const f of readdirSync(dir).filter((x) => x.toLowerCase().endsWith('.epub'))) {
      const path = join(dir, f)
      if (!statSync(path).isFile()) continue
      const buf = readFileSync(path)
      const slug = createHash('sha1').update(f).digest('hex').slice(0, 8)
      const entries = listZip(buf).filter((e) => /\.(jpe?g|png)$/i.test(e.name) && e.size >= MIN_BYTES)
      books.push({ slug, title: f.replace(/\.epub$/i, ''), buf, entries })
    }
  }
  library = books
  return books
}

export function epubList(root, { q = '', offset = 0, limit = 60 } = {}) {
  const needle = norm(q)
  const rows = epubLibrary(root).flatMap((b) =>
    b.entries
      .filter((e) => !needle || norm(`${b.title} ${e.name}`).includes(needle))
      .map((e) => ({ book: b.slug, bookTitle: b.title, name: e.name, bytes: e.size })),
  )
  return { total: rows.length, items: rows.slice(offset, offset + limit) }
}

export function epubImage(root, slug, name) {
  const book = epubLibrary(root).find((b) => b.slug === slug)
  const entry = book?.entries.find((e) => e.name === name)
  if (!book || !entry) return null
  const ext = name.split('.').pop().toLowerCase()
  return { bytes: readZipEntry(book.buf, entry), mime: MIME[ext] ?? 'application/octet-stream', ext: ext === 'jpeg' ? 'jpg' : ext, book }
}

export const resetLibrary = () => {
  library = null
}
