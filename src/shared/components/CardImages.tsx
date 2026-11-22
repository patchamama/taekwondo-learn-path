import { useEffect, useState, type ImgHTMLAttributes, type ReactNode } from 'react'
import { CARD_BY_ID } from '../../data/cards'
import { imagesFor } from '../../data/cardImages'
import { useT } from '../i18n/useT'
import { useAppStore } from '../store/useAppStore'
import { MaximizeOverlay } from './Maximize'

/** Open the selected image, not the entire card, using the shared accessible dialog. */
export function ExpandableImage({ caption, disabled = false, onOpenChange, ...props }: ImgHTMLAttributes<HTMLImageElement> & { caption?: ReactNode; disabled?: boolean; onOpenChange?: (open: boolean) => void }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  if (disabled) return <img {...props} />
  return <>
    <button type="button" aria-label={`${t('maximize')}: ${props.alt ?? ''}`} className="block max-w-full text-left" onClick={(event) => {
      // Existing full-window dialogs already maximize their content; do not nest focus traps.
      if (event.currentTarget.closest('[role="dialog"]')) return
      setOpen(true); onOpenChange?.(true)
    }}>
      <img {...props} />
    </button>
    {open && <MaximizeOverlay onClose={() => { setOpen(false); onOpenChange?.(false) }}>
      <figure className="grid gap-2">
        <img {...props} className="max-h-[85vh] w-full object-contain" />
        {caption && <figcaption className="text-sm text-slate-600">{caption}</figcaption>}
      </figure>
    </MaximizeOverlay>}
  </>
}

/** Images of a card: a hover/focus hint icon in compact view, the pictures themselves in details view. */
export function CardImages({ cardId, display, expanded = false }: { cardId: string; display?: 'compact' | 'details'; expanded?: boolean }) {
  const { t, loc } = useT()
  const preference = useAppStore((s) => s.cardView)
  const view = expanded ? 'details' : preference
  const [hover, setHover] = useState(false)
  const [imageOpen, setImageOpen] = useState(false)
  const [broken, setBroken] = useState<Set<string>>(new Set())
  const images = imagesFor(cardId).filter((i) => !broken.has(i.src))
  const [frame, setFrame] = useState(0)
  const active = hover && view === 'compact' && (!display || display === view)
  useEffect(() => {
    if (!active || imageOpen || images.length < 2) return
    const timer = window.setInterval(() => setFrame((n) => n + 1), 1500)
    return () => window.clearInterval(timer)
  }, [active, imageOpen, images.length])
  const card = CARD_BY_ID[cardId]
  const title = card ? `${card.ko} — ${loc(card.meaning)}` : cardId
  if (images.length === 0 || (display && display !== view)) return null
  const current = images[frame % images.length]
  const img = (i: (typeof images)[number], cls: string) => (
    <ExpandableImage
      key={i.src}
      src={i.src}
      alt={i.caption ?? title}
      title={title}
      loading="lazy"
      onError={() => setBroken((b) => new Set(b).add(i.src))}
      className={cls}
      caption={[i.caption, i.source].filter(Boolean).join(' · ')}
      onOpenChange={setImageOpen}
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
    <span className="relative inline-block" onMouseEnter={() => setHover(true)} onMouseLeave={() => { if (!imageOpen) setHover(false) }}>
      <button
        type="button"
        aria-label={t('showImage')}
        className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-sky-600"
        aria-expanded={hover}
        title={title}
        onClick={() => setHover(true)}
        onKeyDown={(e) => { if (e.key === 'Escape') setHover(false) }}
        onFocus={() => setHover(true)}
        onBlur={(e) => { if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setHover(false) }}
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
