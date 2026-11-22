import { useEffect, useState } from 'react'
import { CARD_BY_ID } from '../../data/cards'
import { imagesFor } from '../../data/cardImages'
import { useT } from '../i18n/useT'
import { useAppStore } from '../store/useAppStore'

/** Images of a card: a hover/focus hint icon in compact view, the pictures themselves in details view. */
export function CardImages({ cardId, display }: { cardId: string; display?: 'compact' | 'details' }) {
  const { t, loc } = useT()
  const view = useAppStore((s) => s.cardView)
  const [hover, setHover] = useState(false)
  const [broken, setBroken] = useState<Set<string>>(new Set())
  const images = imagesFor(cardId).filter((i) => !broken.has(i.src))
  const [frame, setFrame] = useState(0)
  const active = hover && view === 'compact' && (!display || display === view)
  useEffect(() => {
    if (!active || images.length < 2) return
    const timer = window.setInterval(() => setFrame((n) => n + 1), 1500)
    return () => window.clearInterval(timer)
  }, [active, images.length])
  const card = CARD_BY_ID[cardId]
  const title = card ? `${card.ko} — ${loc(card.meaning)}` : cardId
  if (images.length === 0 || (display && display !== view)) return null
  const current = images[frame % images.length]
  const img = (i: (typeof images)[number], cls: string) => (
    <img
      key={i.src}
      src={i.src}
      alt={i.caption ?? title}
      title={title}
      loading="lazy"
      onError={() => setBroken((b) => new Set(b).add(i.src))}
      className={cls}
    />
  )
  if (view === 'details') {
    return (
      <div className="flex flex-wrap gap-2">
        {images.map((i) => (
          <figure key={i.src} className="max-w-56">
            {img(i, 'h-24 rounded-lg border bg-black object-contain')}
            {(i.caption || i.source) && <figcaption className="text-xs text-slate-500">{[i.caption, i.source].filter(Boolean).join(' · ')}</figcaption>}
          </figure>
        ))}
      </div>
    )
  }
  return (
    <span className="relative inline-block" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <button
        type="button"
        aria-label={t('showImage')}
        className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-600"
        aria-expanded={hover}
        title={title}
        onClick={() => setHover(true)}
        onKeyDown={(e) => { if (e.key === 'Escape') setHover(false) }}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="h-3.5 w-3.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.3"
        >
          <rect x="1.5" y="2.5" width="13" height="11" rx="1.5" />
          <path d="m2 12 3.5-3.5L8 11l2-2 4 3.5" />
        </svg>
      </button>
      {hover && (
        <span className="absolute right-0 top-full z-20 block w-56 max-w-[80vw] rounded-lg border bg-white p-1 shadow-lg">
          {img(current, 'w-full rounded bg-black object-contain')}
          {(current.caption || current.source) && (
            <span className="block text-xs text-slate-600">{[current.caption, current.source].filter(Boolean).join(' · ')}</span>
          )}
        </span>
      )}
    </span>
  )
}
