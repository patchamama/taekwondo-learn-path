import { useEffect, useRef, useState } from 'react'
import { resolveVideoLanguage, type Clip } from '../../data/clips'
import { MaximizeButton, MaximizeOverlay } from '../../shared/components/Maximize'
import { useT } from '../../shared/i18n/useT'
import { useAppStore } from '../../shared/store/useAppStore'
import { acquirePlayer } from './playerCache'

interface Props {
  clip: Clip
  muted?: boolean
  autoplay?: boolean
  controls?: boolean
  maximizable?: boolean
}
const clock = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`

/** Shared excerpt surface. The platform iframe lives in a stable, app-owned cache. */
export function ClipPlayer({ clip, muted = false, autoplay = true, controls = true, maximizable = true }: Props) {
  const { t, lang } = useT()
  const videoLang = useAppStore((s) => s.videoLang)
  const anchor = useRef<HTMLDivElement>(null)
  const session = useRef<ReturnType<typeof acquirePlayer> | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [big, setBig] = useState(false)
  const language = resolveVideoLanguage(videoLang, lang)
  const duration = Math.max(0, clip.end - clip.start)
  useEffect(() => {
    if (!anchor.current) return
    const next = acquirePlayer(language, { anchor: anchor.current, clip, muted, autoplay, progress: setElapsed })
    session.current = next
    return () => { next.release(); session.current = null }
  }, [language, clip, muted, autoplay, big])
  const body = (
    <div className="grid gap-2">
      <div ref={anchor} className="aspect-video overflow-hidden rounded-xl bg-black" aria-label={muted ? 'Silent technique clip' : `Clip: ${clip.cardId}`} />
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span aria-live="off">{clock(elapsed)} / {clock(duration)}</span>
        <button type="button" onClick={() => session.current?.replay()} className="underline">↻ {t('replay')}</button>
        {controls && <button type="button" aria-label="Play / Pause" onClick={() => session.current?.toggle()} className="rounded border px-2 py-1">▶ / ❚❚</button>}
        {!big && maximizable && <MaximizeButton onClick={() => setBig(true)} />}
      </div>
      <progress aria-label={`${t('replay')} (${clock(duration)})`} max={duration || 1} value={Math.min(elapsed, duration)} className="h-2 w-full accent-slate-900" />
    </div>
  )
  return big ? <MaximizeOverlay onClose={() => setBig(false)}>{body}</MaximizeOverlay> : body
}
