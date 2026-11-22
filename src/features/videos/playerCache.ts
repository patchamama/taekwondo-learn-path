import { embedUrl, type Clip, type VideoLanguage, videoIdFor } from '../../data/clips'

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
  host: HTMLDivElement
  iframe: HTMLIFrameElement
  player?: Player
  ready: boolean
  request?: Request
  playing: boolean
}
const entries = new Map<string, Entry>()
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
function start(entry: Entry) {
  const request = entry.request
  if (!entry.ready || !entry.player) return
  if (!request) { entry.player.pauseVideo(); return }
  if (request.muted) entry.player.mute()
  else entry.player.unMute()
  entry.player.seekTo(request.clip.start, true)
  entry.playing = request.autoplay
  if (request.autoplay) entry.player.playVideo()
  else entry.player.pauseVideo()
  request.progress(0)
}
function connect(entry: Entry) {
  if (entry.player || !window.YT) return
  entry.player = new window.YT.Player(entry.iframe, { events: {
    onReady: () => { entry.ready = true; start(entry) },
    onStateChange: ({ data }) => {
      if (!entry.request) { entry.player?.pauseVideo(); return }
      entry.playing = data === 1
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
  if (time >= end) {
    player.pauseVideo()
    if (time > end) player.seekTo(end, true)
    entry.playing = false
  } else if (time < start) player.seekTo(start, true)
  request.progress(Math.max(0, Math.min(end - start, time - start)))
}
function updatePositions() { entries.forEach(position) }
function dispose() {
  entries.forEach((entry) => { entry.player?.destroy(); entry.host.remove() })
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
  if (!window.YT) {
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

/** One retained browsing context per video ID, never per clip or language preference. */
export function acquirePlayer(language: VideoLanguage, request: Request) {
  ensureCache()
  const id = videoIdFor(request.clip, language)
  let entry = entries.get(id)
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
    cache!.append(host)
    entry = { host, iframe, ready: false, playing: false }
    entries.set(id, entry)
  }
  // A new owner is the only audible/playing owner, including late API callbacks.
  entries.forEach((other) => {
    other.player?.pauseVideo()
    other.request = undefined
    other.playing = false
    other.host.hidden = true
  })
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
      if (current.request !== request || !current.ready) return
      if (current.playing) current.player?.pauseVideo()
      else current.player?.playVideo()
      current.playing = !current.playing
    },
    release: () => {
      if (current.request !== request) return
      current.player?.pauseVideo()
      current.request = undefined
      current.playing = false
      current.host.hidden = true
    },
  }
}
