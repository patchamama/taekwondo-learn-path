import { useState } from 'react'
import { CLIPS_BY_CARD, clipKey, type Clip } from '../../data/clips'
import { useT } from '../../shared/i18n/useT'
import { ClipPlayer } from './ClipPlayer'
import { FrameStrip } from './FrameStrip'

export function useSourceLabel() {
  const { t } = useT()
  return (c: Clip) =>
    c.source === 'course'
      ? t('srcCourse')
      : c.source === 'selfdefense'
        ? t('srcSelfDefense')
        : (c.label ?? t('srcExternal'))
}

/** All sources of one technique: tabs when there are several, frames + player for the selected one. */
export function ClipViewer({ cardId }: { cardId: string }) {
  const { t } = useT()
  const label = useSourceLabel()
  const clips = CLIPS_BY_CARD[cardId] ?? []
  const [i, setI] = useState(0)
  if (clips.length === 0) return <p className="text-sm text-slate-500">{t('noClip')}</p>
  const clip = clips[Math.min(i, clips.length - 1)]
  return (
    <div className="grid gap-2">
      {clips.length > 1 && (
        <div role="tablist" aria-label={t('sourcesLabel')} className="flex flex-wrap gap-1.5">
          {clips.map((c, k) => (
            <button
              key={clipKey(c)}
              role="tab"
              aria-selected={k === i}
              onClick={() => setI(k)}
              className={`rounded-full border px-3 py-0.5 text-xs ${k === i ? 'bg-slate-900 text-white' : 'bg-white'}`}
            >
              {label(c)}
            </button>
          ))}
        </div>
      )}
      {clip.similarity === 'similar' && (
        <p className="text-xs text-amber-700">ℹ {t('similarTech')}</p>
      )}
      <FrameStrip key={`${clipKey(clip)}-f`} clip={clip} />
      <ClipPlayer key={`${clipKey(clip)}-p`} clip={clip} />
    </div>
  )
}
