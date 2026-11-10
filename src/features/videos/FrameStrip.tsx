import { useState } from 'react'
import { FRAMES_PER_CLIP, clipKey, type Clip } from '../../data/clips'
import { MaximizeButton, MaximizeOverlay } from '../../shared/components/Maximize'
import { useT } from '../../shared/i18n/useT'

interface Props {
  clip: Clip
  /** hide the hint when frames are missing (used inside quizzes) */
  quiet?: boolean
  /** show the maximize button (the clip viewer has its own) */
  maximizable?: boolean
}

export const frameSrc = (clip: Clip, n: number) =>
  `${import.meta.env.BASE_URL}frames/${clipKey(clip)}/${encodeURIComponent(clip.cardId)}/${n}.jpg`

/** Consecutive stills of one technique clip (1 → 6). Frames are generated locally by `npm run frames`. */
export function FrameStrip({ clip, quiet = false, maximizable = true }: Props) {
  const { t } = useT()
  const [missing, setMissing] = useState(false)
  const [big, setBig] = useState(false)
  if (missing) return quiet ? null : <p className="text-xs text-slate-500">{t('framesMissing')}</p>
  const list = (large: boolean) => (
    <ol
      className={`grid gap-1.5 ${large ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-3'}`}
      aria-label={t('framesTitle')}
    >
      {Array.from({ length: FRAMES_PER_CLIP }, (_, i) => (
        <li key={i} className="relative">
          <img
            src={frameSrc(clip, i + 1)}
            alt={`${i + 1}/${FRAMES_PER_CLIP}`}
            loading="lazy"
            onError={() => setMissing(true)}
            className="aspect-video w-full rounded-md border bg-slate-100 object-cover"
          />
          <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 text-[10px] font-bold text-white">
            {i + 1}
          </span>
        </li>
      ))}
    </ol>
  )
  if (big) return <MaximizeOverlay onClose={() => setBig(false)}>{list(true)}</MaximizeOverlay>
  return (
    <div className="grid gap-1.5">
      {list(false)}
      {!quiet && maximizable && <MaximizeButton onClick={() => setBig(true)} />}
    </div>
  )
}
