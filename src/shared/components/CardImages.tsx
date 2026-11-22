import { useState } from 'react'
import { imagesFor } from '../../data/cardImages'
import { useT } from '../i18n/useT'
import { useAppStore } from '../store/useAppStore'

/** Images of a card: a hover/focus hint icon in compact view, the pictures themselves in details view. */
export function CardImages({ cardId }: { cardId: string }) {
  const { t } = useT()
  const view = useAppStore((s) => s.cardView)
  const [hover, setHover] = useState(false)
  const [broken, setBroken] = useState<Set<string>>(new Set())
  const images = imagesFor(cardId).filter((i) => !broken.has(i.src))
  if (images.length === 0) return null
  const img = (i: (typeof images)[number], cls: string) => (
    <img
      key={i.src}
      src={i.src}
      alt={i.caption ?? i.source ?? cardId}
      loading="lazy"
      onError={() => setBroken((b) => new Set(b).add(i.src))}
      className={cls}
    />
  )
  if (view === 'details') {
    return (
      <div className="flex flex-wrap gap-2">
        {images.map((i) => img(i, 'h-24 rounded-lg border bg-black object-contain'))}
      </div>
    )
  }
  return (
    <span className="relative inline-block">
      <button
        type="button"
        aria-label={t('showImage')}
        className="rounded-full border bg-white px-1.5 text-sm"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onFocus={() => setHover(true)}
        onBlur={() => setHover(false)}
      >
        🖼
      </button>
      {hover && (
        <span className="absolute right-0 top-full z-20 mt-1 block w-56 rounded-lg border bg-white p-1 shadow-lg">
          {img(images[0], 'w-full rounded bg-black object-contain')}
        </span>
      )}
    </span>
  )
}
