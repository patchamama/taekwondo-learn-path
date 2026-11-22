import { useState } from 'react'
import { CLIPS_BY_CARD } from '../../data/clips'
import { MaximizeOverlay } from '../../shared/components/Maximize'
import { useT } from '../../shared/i18n/useT'
import { ClipViewer } from '../videos/ClipViewer'
import type { LogEntry } from './QuizLog'

/** Shows an already answered question again: what was asked, what was answered and what was right. */
export function QuizReview({ entry, onClose }: { entry: LogEntry; onClose: () => void }) {
  const { t } = useT()
  const [media, setMedia] = useState(false)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('reviewTitle')}
        className="grid max-h-[90vh] w-full max-w-md gap-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">
              {entry.n}. {entry.ok ? `✓ ${t('logCorrect')}` : `✗ ${t('logWrong')}`}
            </p>
            <h2 className="text-lg font-bold">{entry.prompt}</h2>
            {entry.subject && <p className="text-xl">{entry.subject}</p>}
          </div>
          <button
            type="button"
            aria-label={t('close')}
            onClick={onClose}
            className="rounded-full border px-2"
          >
            ✕
          </button>
        </div>

        {entry.options && (
          <ul className="grid gap-1.5 text-sm">
            {entry.options.map((o, i) => (
              <li
                key={i}
                className={`rounded-lg border-2 px-3 py-1.5 ${o.correct ? 'border-emerald-500 bg-emerald-50' : o.given ? 'border-rose-500 bg-rose-50' : 'border-slate-200'}`}
              >
                {o.correct ? '✓ ' : o.given ? '✗ ' : ''}
                {o.label}
              </li>
            ))}
          </ul>
        )}

        <p className="text-sm">
          {t('yourAnswer')}: <b>{entry.given}</b>
        </p>
        {!entry.ok && (
          <p className="text-sm">
            {t('correctAnswer')}: <b>{entry.correctText}</b>
          </p>
        )}

        {entry.cardId && CLIPS_BY_CARD[entry.cardId] && (
          <button
            type="button"
            className="w-fit rounded-full border bg-white px-3 py-0.5 text-sm"
            onClick={() => setMedia(true)}
          >
            ▶ {t('viewMedia')}
          </button>
        )}
        {media && entry.cardId && (
          <MaximizeOverlay onClose={() => setMedia(false)}>
            <ClipViewer cardId={entry.cardId} autoplay={false} />
          </MaximizeOverlay>
        )}
      </div>
    </div>
  )
}
