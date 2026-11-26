import { clipKey, embedUrl, type Clip, type VideoLanguage, videoIdFor } from '../../data/clips'

type Player = {
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  playVideo: () => void
  pauseVideo: () => void
  mute: () => void
  unMute: () => void
  getCurrentTime: () => number
  destroy: () => void
}
type Platform = { Player: new (iframe: HTMLIFrameElement, options: {
  events: { onReady: () => void; onStateChange: (event: { data: number }) => void }
}) => Player }
declare global {
  interface Window { YT?: Platform; onYouTubeIframeAPIReady?: () => void }
}
type Request = {
  anchor: HTMLElement
  clip: Clip
  muted: boolean
  autoplay: boolean
  progress: (seconds: number) => void
}
type Entry = {
  id: string
  host: HTMLDivElement
  iframe: HTMLIFrameElement
  player?: Player
  ready: boolean
  request?: Request
  playing: boolean
  seekUntil?: number
  ended?: boolean
  /** first still of the clip, shown over the iframe while the video has not played */
  poster?: HTMLImageElement
}
const entries = new Set<Entry>()
let cache: HTMLDivElement | undefined
let timer: ReturnType<typeof setInterval> | undefined
let observer: MutationObserver | undefined
let priorReady: (() => void) | undefined
let readyCallback: (() => void) | undefined

function position(entry: Entry) {
  if (!entry.request) return
  const { anchor } = entry.request
  const rect = anchor.getBoundingClientRect()
  const visible = anchor.isConnected && !anchor.closest('[hidden], [inert]')
  entry.host.hidden = !visible
  Object.assign(entry.host.style, {
    left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`,
    zIndex: anchor.closest('[role="dialog"]') ? '60' : '10',
  })
}
function pauseOthers(entry: Entry) {
  entries.forEach((other) => {
    if (other === entry || !other.request) return
    other.request.autoplay = false
    other.player?.pauseVideo?.()
    other.playing = false
  })
}
function previewTime(clip: Clip) {
  return clip.start === 0 ? Math.min(1, Math.max(0, clip.end - 0.001)) : clip.start
}
/** YouTube paints nothing for a paused video that never played, so a still of the clip covers the iframe until it does. */
function setPoster(entry: Entry, show: boolean) {
  const poster = entry.poster
  if (!poster) return
  if (show && entry.request) {
    const src = `${import.meta.env.BASE_URL}frames/${clipKey(entry.request.clip)}/${encodeURIComponent(entry.request.clip.cardId)}/1.jpg`
    if (poster.getAttribute('src') !== src) poster.setAttribute('src', src)
  }
  poster.hidden = !show
}
function start(entry: Entry) {
  const request = entry.request
  setPoster(entry, Boolean(request) && !request!.autoplay)
  if (!entry.ready || !entry.player) return
  if (!request) { entry.player.pauseVideo(); return }
  if (request.muted) entry.player.mute()
  else entry.player.unMute()
  // The iframe clock can briefly report the previous position after any seek.
  entry.seekUntil = Date.now() + 1500
  entry.ended = false
  entry.player.seekTo(request.autoplay ? request.clip.start : previewTime(request.clip), true)
  entry.playing = request.autoplay
  if (request.autoplay) { pauseOthers(entry); entry.player.playVideo() }
  else entry.player.pauseVideo()
  request.progress(0)
}
function connect(entry: Entry) {
  if (entry.player || typeof window.YT?.Player !== 'function') return
  entry.player = new window.YT.Player(entry.iframe, { events: {
    onReady: () => { entry.ready = true; start(entry) },
    onStateChange: ({ data }) => {
      if (!entry.request) { entry.player?.pauseVideo?.(); return }
      if (data === 1 && !entry.request.autoplay) { entry.player?.pauseVideo?.(); entry.playing = false; return }
      entry.playing = data === 1
      if (data === 1) setPoster(entry, false)
      // Enforce boundaries immediately as well as on the progress clock.
      tick(entry)
    },
  } })
}
function tick(entry: Entry) {
  const { request, player } = entry
  if (!request || !entry.ready || !player) return
  position(entry)
  if (entry.host.hidden) { player.pauseVideo(); entry.playing = false; return }
  const time = player.getCurrentTime()
  if (!Number.isFinite(time)) return
  const { start, end } = request.clip
  // YouTube seeks asynchronously: its clock may still report the old clip's end.
  if (entry.seekUntil !== undefined) {
    if ((time < start || time >= end) && Date.now() < entry.seekUntil) return
    entry.seekUntil = undefined
  }
  if (entry.ended) return
  if (time >= end) {
    player.pauseVideo()
    entry.ended = true
    request.autoplay = false
    entry.seekUntil = Date.now() + 1500
    player.seekTo(previewTime(request.clip), true)
    entry.playing = false
  } else if (time < start) player.seekTo(start, true)
  request.progress(Math.max(0, Math.min(end - start, time - start)))
}
function updatePositions() { entries.forEach(position) }
function dispose() {
  entries.forEach((entry) => { entry.player?.destroy?.(); entry.host.remove() })
  entries.clear()
  cache?.remove()
  cache = undefined
  if (timer) clearInterval(timer)
  timer = undefined
  observer?.disconnect()
  observer = undefined
  window.removeEventListener('pagehide', dispose)
  window.removeEventListener('scroll', updatePositions, true)
  window.removeEventListener('resize', updatePositions)
  if (window.onYouTubeIframeAPIReady === readyCallback) window.onYouTubeIframeAPIReady = priorReady
}
function ensureCache() {
  if (cache) return
  cache = document.createElement('div')
  cache.dataset.videoCache = ''
  // Keep iframes at a stable parent: moving an iframe reloads its browsing context.
  document.body.append(cache)
  window.addEventListener('pagehide', dispose)
  window.addEventListener('scroll', updatePositions, true)
  window.addEventListener('resize', updatePositions)
  const root = document.getElementById('root')
  if (root) {
    observer = new MutationObserver(() => { if (!root.isConnected || !root.hasChildNodes()) dispose() })
    observer.observe(document.body, { childList: true, subtree: true })
  }
  timer = setInterval(() => entries.forEach(tick), 50)
  if (typeof window.YT?.Player !== 'function') {
    priorReady = window.onYouTubeIframeAPIReady
    readyCallback = () => { priorReady?.(); entries.forEach(connect) }
    window.onYouTubeIframeAPIReady = readyCallback
    if (!document.querySelector('script[data-youtube-api]')) {
      const script = document.createElement('script')
      script.dataset.youtubeApi = ''
      script.src = 'https://www.youtube.com/iframe_api'
      document.head.append(script)
    }
  }
}

/** Retain idle browsing contexts by source, but never share one between mounted clips. */
export function acquirePlayer(language: VideoLanguage, request: Request) {
  ensureCache()
  const id = videoIdFor(request.clip, language)
  let entry = [...entries].find((candidate) => candidate.id === id && !candidate.request)
  if (!entry) {
    const host = document.createElement('div')
    host.dataset.videoSource = id
    host.style.position = 'fixed'
    host.style.pointerEvents = 'none'
    host.style.overflow = 'hidden'
    host.style.borderRadius = '0.75rem'
    const iframe = document.createElement('iframe')
    const url = new URL(embedUrl(language, request.clip, { muted: request.muted, autoplay: false, controls: false }))
    // Boundaries belong to the active request, not the first clip's URL.
    url.searchParams.delete('start')
    url.searchParams.delete('end')
    url.searchParams.set('enablejsapi', '1')
    url.searchParams.set('origin', window.location.origin)
    iframe.src = url.toString()
    iframe.title = 'Technique video'
    iframe.tabIndex = -1
    iframe.setAttribute('aria-hidden', 'true')
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture'
    iframe.referrerPolicy = 'strict-origin-when-cross-origin'
    iframe.style.cssText = 'width:100%;height:100%;border:0'
    host.append(iframe)
    const poster = document.createElement('img')
    poster.dataset.poster = ''
    poster.alt = ''
    poster.hidden = true
    poster.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none;background:#000'
    poster.addEventListener('error', () => poster.remove())
    host.append(poster)
    cache!.append(host)
    entry = { id, host, iframe, ready: false, playing: false, poster }
    entries.add(entry)
  }
  if (request.autoplay) pauseOthers(entry)
  entry.request = request
  entry.iframe.title = request.muted ? 'Silent technique clip' : `Clip: ${request.clip.cardId}`
  entry.host.hidden = false
  connect(entry)
  position(entry)
  start(entry)
  const current = entry
  return {
    replay: () => { if (current.request === request) { request.autoplay = true; start(current) } },
    toggle: () => {
      if (current.request !== request) return
      if (!current.ready) {
        request.autoplay = !request.autoplay
        if (request.autoplay) pauseOthers(current)
        return
      }
      const shouldPlay = !current.playing
      request.autoplay = shouldPlay
      current.playing = shouldPlay
      if (!shouldPlay) current.player?.pauseVideo?.()
      else {
        pauseOthers(current)
        setPoster(current, false)
        const time = current.player?.getCurrentTime()
        if (current.ended || (time !== undefined && (time >= request.clip.end || time < request.clip.start))) {
          current.ended = false
          current.seekUntil = Date.now() + 1500
          current.player?.seekTo(request.clip.start, true)
          request.progress(0)
        }
        current.player?.playVideo()
      }
    },
    release: () => {
      if (current.request !== request) return
      current.player?.pauseVideo?.()
      current.request = undefined
      current.playing = false
      current.host.hidden = true
    },
  }
}
