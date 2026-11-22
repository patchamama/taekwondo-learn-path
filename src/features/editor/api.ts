import type { CardOverride } from '../../data/overrides'
import type { CustomCard, CustomCatalogue } from '../../data/customCards'

const WRITE = { 'X-Editor': '1', 'Content-Type': 'application/json' }

async function json<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok || (body as { ok?: boolean }).ok === false)
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`)
  return body as T
}

export interface HealthInfo {
  editor: boolean
  ai: { enabled: boolean; provider?: string; model?: string }
}

let healthPromise: Promise<HealthInfo> | null = null

/** What the local backend offers (editor, language model). Cached for the session. */
export function health(): Promise<HealthInfo> {
  healthPromise ??= fetch('/api/health')
    .then((r) => (r.ok ? r.json() : null))
    .then((b) => ({ editor: Boolean(b?.ok && b?.editor), ai: b?.ai ?? { enabled: false } }))
    .catch(() => ({ editor: false, ai: { enabled: false } }))
  return healthPromise
}

/** True when the local backend runs with the editor API (start.sh / start.bat). */
export const editorAvailable = () => health().then((h) => h.editor)

export const resetEditorCache = () => {
  healthPromise = null
}

export type Lang = 'en' | 'de' | 'es'
/** Japanese is a secondary translation target, not an interface or editor source language. */
export type TranslationTarget = Lang | 'ja'

/** Asks the server-side model for translations (including Japanese); no keys or saving in the browser. */
export const translateWithAi = (p: {
  from: Lang
  targets: TranslationTarget[]
  text: string
  context?: { ko?: string; hangul?: string }
}) =>
  fetch('/api/ai/translate', { method: 'POST', headers: WRITE, body: JSON.stringify(p) }).then(
    (r) => json<{ ok: true; translations: Partial<Record<TranslationTarget, string>> }>(r),
  )

export const customCatalogue = () => fetch('/api/cards/custom').then((r) => json<CustomCatalogue>(r))

export const createCard = (entry: CustomCard) =>
  fetch('/api/cards/custom', { method: 'POST', headers: WRITE, body: JSON.stringify(entry) }).then(
    (r) => json<{ ok: true; entry: CustomCard }>(r),
  )

/** Soft hide/unhide only; no content, overrides, clips or progress are removed. */
export const setCardVisibility = (id: string, hidden: boolean) =>
  fetch(`/api/cards/${encodeURIComponent(id)}/visibility`, {
    method: 'PUT', headers: WRITE, body: JSON.stringify({ hidden }),
  }).then((r) => json<{ ok: true; id: string; hidden: boolean }>(r))

export const saveCard = (id: string, override: CardOverride) =>
  fetch(`/api/cards/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: WRITE,
    body: JSON.stringify(override),
  }).then((r) => json<{ ok: true; override: CardOverride }>(r))

export const saveClipRanges = (
  cardId: string,
  clips: { index: number; start: number; end: number }[],
) =>
  fetch(`/api/clips/${encodeURIComponent(cardId)}`, {
    method: 'PUT',
    headers: WRITE,
    body: JSON.stringify({ clips }),
  }).then((r) => json<{ ok: true }>(r))

/** Local originals only; never downloads the supplied URL. */
export const sourceVideoUrl = (id: string) => `/api/video/source?id=${encodeURIComponent(id)}`

export function videoIdFromUrl(value: string): string | null {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return null
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1)
      : ['youtube.com', 'www.youtube.com', 'm.youtube.com'].includes(url.hostname)
        ? url.pathname === '/watch' ? url.searchParams.get('v') : url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)$/)?.[1]
        : null
    return /^[\w-]{11}$/.test(id ?? '') ? id! : null
  } catch { return null }
}

export const addClip = (p: { cardId: string; url: string; start: number; end: number }) =>
  fetch('/api/clips/add', { method: 'POST', headers: WRITE, body: JSON.stringify(p) }).then(
    (r) => json<{ ok: true; clip: { cardId: string; videoId: string; start: number; end: number } }>(r),
  )

export const regenerateFrames = (p: {
  cardId: string
  key: string
  videoId: string
  start: number
  end: number
}) =>
  fetch('/api/clips/frames', { method: 'POST', headers: WRITE, body: JSON.stringify(p) }).then(
    (r) => json<{ ok: true; frames: number }>(r),
  )

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
