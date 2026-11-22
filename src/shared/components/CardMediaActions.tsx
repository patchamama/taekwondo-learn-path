import { useEffect, useState } from 'react'
import { CARD_BY_ID } from '../../data/cards'
import { CLIPS_BY_CARD, FRAMES_PER_CLIP } from '../../data/clips'
import { frameSrc } from '../../features/videos/FrameStrip'
import { useT } from '../i18n/useT'
import { CardImages, ExpandableImage } from './CardImages'

/** Header-only media actions: previews never mount a video player. */
export function CardMediaActions({ cardId, expanded, onOpen }: {
  cardId: string
  expanded: boolean
  onOpen: () => void
}) {
  const { t, loc } = useT()
  const [preview, setPreview] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)
  const [frame, setFrame] = useState(0)
  const [missing, setMissing] = useState(false)
  const clip = CLIPS_BY_CARD[cardId]?.[0]
  const card = CARD_BY_ID[cardId]
  const title = card ? `${card.ko} — ${loc(card.meaning)}` : cardId
  useEffect(() => {
    if (!preview || !clip || missing || imageOpen) return
    const timer = window.setInterval(() => setFrame((n) => (n + 1) % FRAMES_PER_CLIP), 800)
    return () => window.clearInterval(timer)
  }, [preview, clip, missing, imageOpen])
  const actionClass = 'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded border bg-white text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-sky-600'
  return <>
    {clip && <>
      <span className="relative inline-flex" onMouseEnter={() => setPreview(true)} onMouseLeave={() => { if (!imageOpen) setPreview(false) }}>
        <button type="button" aria-label={t('framesTitle')} title={t('framesTitle')}
          aria-expanded={expanded} className={actionClass} onClick={() => { setPreview(false); onOpen() }}
          onFocus={() => setPreview(true)} onBlur={(event) => { if (!event.currentTarget.parentElement?.contains(event.relatedTarget)) setPreview(false) }}
          onKeyDown={(event) => { if (event.key === 'Escape') setPreview(false) }}>
          <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="5" width="14" height="11" rx="1" /><path d="M6 2h11M2 8h4m-4 5h4m8-5h4m-4 5h4M8 6v9m4-9v9" />
          </svg>
        </button>
        {preview && !missing && <span role="tooltip" className="absolute right-0 top-full z-30 block w-56 max-w-[80vw] rounded-lg border bg-white p-1 shadow-lg">
          <ExpandableImage src={frameSrc(clip, frame + 1)} alt={title} title={title} onOpenChange={setImageOpen} onError={() => setMissing(true)} className="aspect-video w-full rounded bg-black object-contain" />
          <span className="block text-xs text-slate-600">{title}</span>
        </span>}
      </span>
      <button type="button" aria-label={t('watch')} title={t('watch')} aria-expanded={expanded} className={actionClass} onClick={onOpen}>
        <svg aria-hidden viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="5" width="10" height="10" rx="2" /><path d="m12 8 6-3v10l-6-3z" />
        </svg>
      </button>
    </>}
    <CardImages cardId={cardId} display="compact" />
  </>
}
