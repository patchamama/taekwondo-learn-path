import type { CardOverride } from '../../data/overrides'

const WRITE = { 'X-Editor': '1', 'Content-Type': 'application/json' }

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok || (body as { ok?: boolean }).ok === false)
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  return body as T
}

let available: Promise<boolean> | null = null

/** True when the local backend runs with the editor API (start.sh / start.bat). Cached for the session. */
export function editorAvailable(): Promise<boolean> {
  available ??= fetch('/api/health')
    .then((r) => (r.ok ? r.json() : null))
    .then((b) => Boolean(b?.ok && b?.editor))
    .catch(() => false)
  return available
}

export const resetEditorCache = () => {
  available = null
}

export const saveCard = (id: string, override: CardOverride) =>
  fetch(`/api/cards/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: WRITE,
    body: JSON.stringify(override),
  }).then((r) => json<{ ok: true; override: CardOverride }>(r))

export interface PickedImage {
  src: string
  source?: string
}

export const importEpubImage = (book: string, name: string) =>
  fetch('/api/library/epub/import', {
    method: 'POST',
    headers: WRITE,
    body: JSON.stringify({ book, name }),
  }).then((r) => json<{ ok: true } & PickedImage>(r))

export const saveFrame = (id: string, t: number) =>
  fetch('/api/frame/save', {
    method: 'POST',
    headers: WRITE,
    body: JSON.stringify({ id, t }),
  }).then((r) => json<{ ok: true } & PickedImage>(r))

export interface EpubItem {
  book: string
  bookTitle: string
  name: string
  bytes: number
}

export const listEpub = (q: string, offset: number) =>
  fetch(`/api/library/epub?q=${encodeURIComponent(q)}&offset=${offset}&limit=60`).then((r) =>
    json<{ total: number; items: EpubItem[] }>(r),
  )

export const epubImageUrl = (book: string, name: string) =>
  `/api/library/epub/image?book=${encodeURIComponent(book)}&name=${encodeURIComponent(name)}`

export interface VideoInfo {
  id: string
  label: string
  cards: string[]
  local: boolean
}

export const listVideos = () => fetch('/api/videos').then((r) => json<VideoInfo[]>(r))

export interface IndexHit {
  t: number
  text: string
  videoId: string
  source: 'chapters' | 'index' | 'subtitles'
}

export const searchVideos = (q: string) =>
  fetch(`/api/videos/search?q=${encodeURIComponent(q)}`).then((r) => json<IndexHit[]>(r))

export const videoDuration = (id: string) =>
  fetch(`/api/video/info?id=${encodeURIComponent(id)}`).then((r) =>
    json<{ ok: true; duration: number }>(r),
  )

export const frameUrl = (id: string, t: number, w = 640) =>
  `/api/frame?id=${encodeURIComponent(id)}&t=${Math.max(0, t).toFixed(1)}&w=${w}`
