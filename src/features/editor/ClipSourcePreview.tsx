import { useRef, useState } from 'react'
import { sourceVideoUrl } from './api'

/** Full local source for marking boundaries while it plays; no retained player cache. */
export function ClipSourcePreview({ videoId, start, end, onMark }: {
  videoId: string
  start: number
  end: number
  onMark: (edge: 'start' | 'end', time: number) => void
}) {
  const video = useRef<HTMLVideoElement>(null)
  const [time, setTime] = useState(0)
  const [unavailable, setUnavailable] = useState(false)
  return (
    <div className="grid gap-2 rounded-lg border p-2">
      <video ref={video} aria-label="Source playback" controls preload="metadata"
        className="aspect-video w-full rounded bg-black"
        src={sourceVideoUrl(videoId)}
        onLoadedMetadata={() => { if (video.current) video.current.currentTime = start }}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onError={() => setUnavailable(true)} />
      <p className="text-xs text-slate-600">Source: {time.toFixed(1)} s · Clip: {Math.max(0, end - start).toFixed(1)} s</p>
      {unavailable && <p role="status" className="text-sm">No playable local source. Enter times manually; no download is performed.</p>}
      <div className="flex flex-wrap gap-2">
        {(['start', 'end'] as const).map((edge) => (
          <button key={edge} type="button" className="min-h-9 rounded border px-3"
            disabled={unavailable} onClick={() => {
              const time = video.current?.currentTime
              if (time !== undefined && Number.isFinite(time)) onMark(edge, Math.round(time * 10) / 10)
            }}>Mark {edge}</button>
        ))}
        <button type="button" className="min-h-9 rounded border px-3" disabled={unavailable}
          onClick={() => { if (video.current) video.current.currentTime = start }}>Seek to start</button>
      </div>
    </div>
  )
}
