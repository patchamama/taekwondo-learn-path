import { useState } from 'react'
import { FRAMES_PER_CLIP } from '../../data/clips'
import { useT } from '../../shared/i18n/useT'

interface Props {
  cardId: string
  /** hide the hint when frames are missing (used inside quizzes) */
  quiet?: boolean
}

export const frameSrc = (cardId: string, n: number) =>
  `${import.meta.env.BASE_URL}frames/${encodeURIComponent(cardId)}/${n}.jpg`

/** Consecutive stills of one technique (1 → 6). Frames are generated locally by `npm run frames`. */
export function FrameStrip({ cardId, quiet = false }: Props) {
  const { t } = useT()
  const [missing, setMissing] = useState(false)
  if (missing) return quiet ? null : <p className="text-xs text-slate-500">{t('framesMissing')}</p>
  return (
    <ol className="grid grid-cols-3 gap-1.5" aria-label={t('framesTitle')}>
      {Array.from({ length: FRAMES_PER_CLIP }, (_, i) => (
        <li key={i} className="relative">
          <img
            src={frameSrc(cardId, i + 1)}
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
}
