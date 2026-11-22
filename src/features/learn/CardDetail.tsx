import { BookSynonym } from '../../shared/components/BookSynonym'
import { useState } from 'react'
import { CARD_BY_ID } from '../../data/cards'
import { CLIPS_BY_CARD } from '../../data/clips'
import { KUKKIWON_BY_ID } from '../../data/kukkiwon'
import { MORPHEME_BY_ID } from '../../data/morphemes'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { useT } from '../../shared/i18n/useT'
import { MATCH_LABEL, MATCH_STYLE } from '../kukkiwon/content'
import { ClipViewer } from '../videos/ClipViewer'

/** One card before the exercises: meaning, how it is built, what it is for, and frames/clip when available. */
export function CardDetail({
  cardId,
  defaultOpen = false,
}: {
  cardId: string
  defaultOpen?: boolean
}) {
  const { t, loc } = useT()
  const [open, setOpen] = useState(defaultOpen)
  const c = CARD_BY_ID[cardId]
  if (!c) return null
  const kk = KUKKIWON_BY_ID[cardId]
  const hasMedia = Boolean(CLIPS_BY_CARD[cardId])
  const hasMore = Boolean(c.info || c.parts || c.karate || kk || hasMedia)
  return (
    <li className="rounded-xl border bg-white">
      <div className="flex items-center gap-2 px-3 py-2">
        <SpeakButton text={c.hangul} />
        <button
          type="button"
          className="min-w-0 flex-1 text-left"
          aria-expanded={open}
          onClick={() => hasMore && setOpen(!open)}
        >
          <p className="truncate font-bold">
            {c.ko}{' '}
            <span lang="ko" className="font-normal text-slate-500">
              {c.hangul}
            </span>
          </p>
          <p className="truncate text-sm text-slate-600">{loc(c.meaning)}</p>
        </button>
        {hasMedia && (
          <span aria-hidden title={t('watch')}>
            🎬
          </span>
        )}
        {hasMore && (
          <span aria-hidden className="text-slate-400">
            {open ? '▲' : '▼'}
          </span>
        )}
      </div>
      {open && (
        <div className="grid gap-2 border-t px-3 py-3 text-sm">
          {c.info && <p>{loc(c.info)}</p>}
          {c.kind === 'technique' && <BookSynonym cardId={cardId} />}
          {c.parts && c.parts.length > 0 && (
            <p className="text-slate-700">
              <span className="font-semibold">{t('breakdown')}: </span>
              {c.parts
                .map((p) => `${p} (${loc(MORPHEME_BY_ID[p]?.meaning ?? { en: p, de: p, es: p })})`)
                .join(' + ')}
            </p>
          )}
          {c.karate && (
            <p className="text-slate-600">
              <span className="font-semibold">{t('karate')}: </span>
              {c.karate}
            </p>
          )}
          {kk && (
            <p className="text-slate-600">
              <span className="font-semibold">{t('kukkiwonShort')}: </span>
              {kk.kukkiwon.split(' (')[0]} <span lang="ko">{kk.kukkiwonHangul}</span>{' '}
              <span className={`rounded-full px-2 py-0.5 text-xs ${MATCH_STYLE[kk.match]}`}>
                {loc(MATCH_LABEL[kk.match])}
              </span>
            </p>
          )}
          {hasMedia && <ClipViewer cardId={cardId} autoplay={false} />}
        </div>
      )}
    </li>
  )
}
