import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CARD_BY_ID } from '../../data/cards'
import { CLIPS } from '../../data/clips'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { useT } from '../../shared/i18n/useT'
import { ClipPlayer } from './ClipPlayer'

export function VideosPage() {
  const { t, loc } = useT()
  const [open, setOpen] = useState<string | null>(null)
  return (
    <section className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold">{t('videosTitle')}</h1>
        <Link
          to="/video-quiz"
          className="ml-auto rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-white"
        >
          🎬 {t('openVideoQuiz')}
        </Link>
      </div>
      <p className="text-sm text-slate-600">{t('videosHint')}</p>
      <p className="rounded-lg bg-amber-50 p-3 text-sm">ℹ {t('videoCaveat')}</p>
      <ul className="grid items-start gap-3 md:grid-cols-2">
        {CLIPS.map((c) => {
          const card = CARD_BY_ID[c.cardId]
          const isOpen = open === c.cardId
          return (
            <li key={c.cardId} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">
                    {card.ko}{' '}
                    <span lang="ko" className="font-normal text-slate-500">
                      {card.hangul}
                    </span>
                  </p>
                  <p className="truncate text-sm text-slate-600">{loc(card.meaning)}</p>
                </div>
                <SpeakButton text={card.hangul} />
                <button
                  className="rounded-lg border px-3 py-1 text-sm"
                  onClick={() => setOpen(isOpen ? null : c.cardId)}
                  aria-expanded={isOpen}
                >
                  {isOpen ? t('hide') : `▶ ${t('watch')}`}
                </button>
              </div>
              {isOpen && <ClipPlayer cardId={c.cardId} />}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
