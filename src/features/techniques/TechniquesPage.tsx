import { EditButton } from '../editor/EditButton'
import { CardViewToggle } from '../../shared/components/CardViewToggle'
import { CardMediaActions } from '../../shared/components/CardMediaActions'
import { CardImages } from '../../shared/components/CardImages'
import { partLabel } from '../../data/japanese'
import { useState } from 'react'
import { MORPHEME_BY_ID } from '../../data/morphemes'
import { TECHNIQUES, type Category } from '../../data/techniques'
import { BeltBadge } from '../../shared/components/BeltBadge'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { CARD_BY_ID } from '../../data/cards'
import { CLIPS_BY_CARD } from '../../data/clips'
import { KUKKIWON_BY_ID } from '../../data/kukkiwon'
import { MATCH_LABEL, MATCH_STYLE } from '../kukkiwon/content'
import { ClipViewer } from '../videos/ClipViewer'
import { useBeltFilter } from '../../shared/hooks/useBeltFilter'
import { MorphemeGroups } from './MorphemeGroups'
import { useT } from '../../shared/i18n/useT'
import { useAppStore } from '../../shared/store/useAppStore'
import type { StringKey } from '../../shared/i18n/strings'

const CATS: { id: Category | 'all'; key: StringKey }[] = [
  { id: 'all', key: 'all' },
  { id: 'hand', key: 'catHand' },
  { id: 'foot', key: 'catFoot' },
  { id: 'stance', key: 'catStance' },
  { id: 'combo', key: 'catCombo' },
]

export function TechniquesPage() {
  const { t, loc } = useT()
  const [cat, setCat] = useState<Category | 'all'>('all')
  const [watching, setWatching] = useState<string | null>(null)
  const [play, setPlay] = useState(0)
  const learned = useAppStore((s) => s.learned)
  const toggle = useAppStore((s) => s.toggleLearned)
  const { visibleCard } = useBeltFilter()
  const list = TECHNIQUES.filter((x) => (cat === 'all' || x.category === cat) && visibleCard(x.id))

  return (
    <section>
      <div className="mb-4">
        <CardViewToggle />
      </div>
      <details className="mb-6 rounded-xl border bg-white p-4" open>
        <summary className="cursor-pointer font-semibold">{t('morphemes')}</summary>
        <p className="my-2 text-sm text-slate-600">{t('morphemesHint')}</p>
        <MorphemeGroups />
      </details>

      <div className="mb-4 flex flex-wrap gap-2" role="group">
        {CATS.map((c) => (
          <button
            key={c.id}
            aria-pressed={cat === c.id}
            onClick={() => setCat(c.id)}
            className={`rounded-full border px-3 py-1 text-sm ${cat === c.id ? 'bg-slate-900 text-white' : 'bg-white'}`}
          >
            {t(c.key)}
          </button>
        ))}
      </div>

      <ul className="grid items-start gap-3 md:grid-cols-2">
        {list.map((x) => {
          const isLearned = learned.includes(x.id)
          return (
            <li key={x.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="flex items-center gap-2 text-lg font-bold">
                    {x.ko} <SpeakButton text={CARD_BY_ID[x.id].hangul} />
                  </h3>
                </div>
                <div className="flex flex-col items-end gap-1">
                <span data-card-media-toolbar className="flex items-center gap-1">
                  <EditButton cardId={x.id} />
                  <CardMediaActions cardId={x.id} expanded={watching === x.id} onOpen={() => { setWatching(x.id); setPlay((n) => n + 1) }} />
                  <BeltBadge cardId={x.id} />
                </span>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={isLearned}
                    onChange={() => toggle(x.id)}
                    aria-label={`${t('learnedToggle')}: ${x.ko}`}
                  />
                  {t('learnedToggle')}
                </label>
                </div>
              </div>
              <p className="mt-1 font-medium">{loc(x.names)}</p>
              <div className="mt-1">
                <CardImages cardId={x.id} display="details" expanded={watching === x.id} />
              </div>
              <p className="mt-2 text-sm text-slate-700">
                <span className="font-semibold">{t('breakdown')}: </span>
                {x.parts.map((p) => partLabel(p, loc(MORPHEME_BY_ID[p].meaning))).join(' + ')}
              </p>
              <p className="text-sm text-slate-600">
                <span className="font-semibold">{t('karate')}: </span>
                {x.karate}
              </p>
              {KUKKIWON_BY_ID[x.id] && (
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-semibold">{t('kukkiwonShort')}: </span>
                  {KUKKIWON_BY_ID[x.id].kukkiwon.split(' (')[0]}{' '}
                  <span lang="ko">{KUKKIWON_BY_ID[x.id].kukkiwonHangul}</span>{' '}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${MATCH_STYLE[KUKKIWON_BY_ID[x.id].match]}`}
                  >
                    {loc(MATCH_LABEL[KUKKIWON_BY_ID[x.id].match])}
                  </span>
                </p>
              )}
              {CLIPS_BY_CARD[x.id] && (
                <div className="mt-3">
                  {watching === x.id && (
                    <div className="mt-2">
                      <button type="button" className="text-sm underline" onClick={() => setWatching(null)}>{t('hide')}</button>
                      <ClipViewer key={play} cardId={x.id} />
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
