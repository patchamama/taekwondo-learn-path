import { useState } from 'react'
import { CLIPS_BY_CARD } from '../../data/clips'
import { MaximizeOverlay } from '../../shared/components/Maximize'
import { useT } from '../../shared/i18n/useT'
import { ClipViewer } from '../videos/ClipViewer'

export interface LogEntry {
  n: number
  prompt: string
  given: string
  ok: boolean
  correctText: string
  cardId?: string
}

/** What has happened so far, oldest first, so the latest evaluation is the last line. */
export function QuizLog({ entries }: { entries: LogEntry[] }) {
  const { t } = useT()
  const [media, setMedia] = useState<string | null>(null)
  if (entries.length === 0) return null
  return (
    <section aria-label={t('quizLog')} className="grid gap-1 border-t pt-3 text-sm">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{t('quizLog')}</h3>
      <ol className="grid gap-1">
        {entries.slice(-6).map((e) => (
          <li
            key={e.n}
            className={`flex flex-wrap items-baseline gap-x-2 rounded-lg px-2 py-1 ${e.ok ? 'bg-emerald-50' : 'bg-rose-50'}`}
          >
            <span className="font-semibold">
              {e.n}. {e.ok ? `✓ ${t('logCorrect')}` : `✗ ${t('logWrong')}`}
            </span>
            <span className="text-slate-600">{e.prompt}</span>
            <span>
              {t('yourAnswer')}: <b>{e.given}</b>
            </span>
            {!e.ok && (
              <span>
                {t('correctAnswer')}: <b>{e.correctText}</b>
              </span>
            )}
            {e.cardId && CLIPS_BY_CARD[e.cardId] && (
              <button
                type="button"
                className="rounded-full border bg-white px-2 text-xs"
                onClick={() => setMedia(e.cardId!)}
              >
                ▶ {t('viewMedia')}
              </button>
            )}
          </li>
        ))}
      </ol>
      {media && (
        <MaximizeOverlay onClose={() => setMedia(null)}>
          <ClipViewer cardId={media} autoplay={false} />
        </MaximizeOverlay>
      )}
    </section>
  )
}
