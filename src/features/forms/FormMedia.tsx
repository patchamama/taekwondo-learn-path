import { useId, useState, type ReactNode } from 'react'
import { CLIPS_BY_CARD, clipKey } from '../../data/clips'
import { imagesFor } from '../../data/cardImages'
import { CARD_BY_ID } from '../../data/cards'
import { FormDiagram, hasDiagram } from '../../shared/components/FormDiagram'
import { ExpandableImage } from '../../shared/components/CardImages'
import { MaximizeButton, MaximizeOverlay } from '../../shared/components/Maximize'
import { useT } from '../../shared/i18n/useT'
import { ClipPlayer } from '../videos/ClipPlayer'
import { FrameStrip } from '../videos/FrameStrip'
import { useSourceLabel } from '../videos/ClipViewer'

/** One material at a time inline; every material together in the full-window view. */
export function FormMedia({ cardId, autoplay = false }: { cardId: string; autoplay?: boolean }) {
  const { t, loc } = useT()
  const label = useSourceLabel()
  const id = useId()
  const [selected, setSelected] = useState<number | null>(null)
  const [big, setBig] = useState(false)
  const card = CARD_BY_ID[cardId]
  const title = card ? `${card.ko} — ${loc(card.meaning)}` : cardId
  const materials: { key: string; label: string; body: ReactNode }[] = []
  if (hasDiagram(cardId)) materials.push({
    key: 'diagram', label: t('diagramTitle'),
    // The card-level maximize control replaces the diagram's individual control.
    body: <div className="[&_[data-maximize-trigger]]:hidden"><FormDiagram cardId={cardId} alreadyMaximized={big} /></div>,
  })
  // Video stills already appear with each clip; include only independently chosen images.
  imagesFor(cardId).filter((image) => image.kind === 'custom').forEach((image, index) => {
    materials.push({
      key: `image-${index}`, label: `${t('showImage')} ${index + 1}`,
      body: <figure className="grid gap-1">
        <ExpandableImage src={image.src} alt={image.caption ?? title} title={title} loading="lazy"
          disabled={big} caption={[image.caption, image.source].filter(Boolean).join(' · ')}
          className="max-h-[70vh] w-full rounded-lg bg-black object-contain" />
        <figcaption className="text-xs text-slate-600">{[image.caption, image.source].filter(Boolean).join(' · ')}</figcaption>
      </figure>,
    })
  })
  ;(CLIPS_BY_CARD[cardId] ?? []).forEach((clip) => {
    materials.push({
      key: clipKey(clip), label: label(clip),
      body: <div className="grid gap-2">
        {clip.note === 'applications' && <p className="text-xs text-amber-700">ℹ {t('applicationsNote')}</p>}
        {clip.similarity === 'similar' && <p className="text-xs text-amber-700">ℹ {t('similarTech')}</p>}
        <FrameStrip clip={clip} maximizable={false} />
        <ClipPlayer clip={clip} autoplay={!big && autoplay} />
      </div>,
    })
  })
  if (!materials.length) return null
  const firstClip = CLIPS_BY_CARD[cardId]?.[0]
  const firstVideo = firstClip ? materials.findIndex((material) => material.key === clipKey(firstClip)) : -1
  const index = Math.min(selected ?? (autoplay && firstVideo >= 0 ? firstVideo : 0), materials.length - 1)
  if (big) return (
    <MaximizeOverlay onClose={() => setBig(false)}>
      <h3 className="text-lg font-bold">{title}</h3>
      {materials.map((material) => <section key={material.key} className="grid min-w-0 gap-2">
        <h4 className="font-semibold">{material.label}</h4>
        {material.body}
      </section>)}
    </MaximizeOverlay>
  )
  return <div className="mt-2 grid min-w-0 gap-2">
    <MaximizeButton onClick={() => setBig(true)} />
    {materials.length > 1 && <div role="tablist" aria-label={t('sourcesLabel')} className="flex flex-wrap gap-1.5">
      {materials.map((material, i) => <button
        key={material.key} type="button" role="tab" id={`${id}-tab-${i}`}
        aria-controls={`${id}-panel`} aria-selected={i === index} tabIndex={i === index ? 0 : -1}
        onClick={() => setSelected(i)}
        onKeyDown={(event) => {
          const next = event.key === 'Home' ? 0 : event.key === 'End' ? materials.length - 1
            : event.key === 'ArrowRight' ? (i + 1) % materials.length
              : event.key === 'ArrowLeft' ? (i + materials.length - 1) % materials.length : null
          if (next === null) return
          event.preventDefault()
          setSelected(next)
          document.getElementById(`${id}-tab-${next}`)?.focus()
        }}
        className={`rounded-full border px-3 py-1 text-xs ${i === index ? 'bg-slate-900 text-white' : 'bg-white'}`}
      >{material.label}</button>)}
    </div>}
    <div key={materials[index].key} role={materials.length > 1 ? 'tabpanel' : undefined}
      id={`${id}-panel`} aria-labelledby={materials.length > 1 ? `${id}-tab-${index}` : undefined}>
      {materials[index].body}
    </div>
  </div>
}
