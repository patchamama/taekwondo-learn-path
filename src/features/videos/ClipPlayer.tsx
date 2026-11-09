import { useState } from 'react'
import { CLIP_BY_CARD, embedUrl, resolveVideoLanguage } from '../../data/clips'
import { CARD_BY_ID } from '../../data/cards'
import { useT } from '../../shared/i18n/useT'
import { useAppStore } from '../../shared/store/useAppStore'

interface Props {
  cardId: string
  muted?: boolean
  autoplay?: boolean
  controls?: boolean
}

/** Embedded excerpt of the course video for one technique (no download, YouTube plays it). */
export function ClipPlayer({ cardId, muted = false, autoplay = true, controls = true }: Props) {
  const { t, lang } = useT()
  const videoLang = useAppStore((s) => s.videoLang)
  const [run, setRun] = useState(0)
  const clip = CLIP_BY_CARD[cardId]
  if (!clip) return <p className="text-sm text-slate-500">{t('noClip')}</p>
  const src = embedUrl(resolveVideoLanguage(videoLang, lang), clip, { muted, autoplay, controls })
  return (
    <div className="grid gap-2">
      <div className="aspect-video overflow-hidden rounded-xl bg-black">
        <iframe
          key={run}
          src={src}
          title={muted ? 'Silent technique clip' : `Clip: ${CARD_BY_ID[cardId].ko}`}
          className="h-full w-full"
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen={controls}
        />
      </div>
      <button
        type="button"
        onClick={() => setRun((n) => n + 1)}
        className="justify-self-start text-sm underline"
      >
        ↻ {t('replay')}
      </button>
    </div>
  )
}
