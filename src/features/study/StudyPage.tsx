import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useBelts } from '../../shared/store/useBelts'
import { CARD_BY_ID } from '../../data/cards'
import { CLIPS_BY_CARD } from '../../data/clips'
import { KUKKIWON_BY_ID } from '../../data/kukkiwon'
import { MORPHEME_BY_ID } from '../../data/morphemes'
import { levelContent, levelContentUpTo } from '../../data/levelContent'
import { UNITS, LESSONS } from '../../data/lessons'
import { BeltBadge } from '../../shared/components/BeltBadge'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { useBeltFilter } from '../../shared/hooks/useBeltFilter'
import { ExportBar } from '../../shared/components/ExportBar'
import { buildLevelDoc } from '../export/document'
import { FormDiagram } from '../../shared/components/FormDiagram'
import { useT } from '../../shared/i18n/useT'
import { MATCH_LABEL, MATCH_STYLE } from '../kukkiwon/content'
import { ClipViewer } from '../videos/ClipViewer'
import { FrameStrip } from '../videos/FrameStrip'
import { CLIPS } from '../../data/clips'

function ReadingCard({ cardId }: { cardId: string }) {
  const { t, loc } = useT()
  const [watch, setWatch] = useState(false)
  const c = CARD_BY_ID[cardId]
  const kk = KUKKIWON_BY_ID[cardId]
  const firstClip = CLIPS.find((x) => x.cardId === cardId && x.source !== 'selfdefense')
  return (
    <article className="rounded-xl border bg-white p-4 shadow-sm" id={`card-${cardId}`}>
      <h3 className="flex flex-wrap items-center gap-2 text-lg font-bold">
        {c.ko}
        <span lang="ko" className="font-normal text-slate-500">
          {c.hangul}
        </span>
        <SpeakButton text={c.hangul} />
        <SpeakButton text={c.hangul} slow />
        <BeltBadge cardId={cardId} />
      </h3>
      <p className="font-medium">{loc(c.meaning)}</p>
      {c.info && <p className="mt-2 text-sm">{loc(c.info)}</p>}
      {c.parts && c.parts.length > 0 && (
        <p className="mt-2 text-sm text-slate-700">
          <span className="font-semibold">{t('breakdown')}: </span>
          {c.parts
            .map((p) => `${p} (${loc(MORPHEME_BY_ID[p]?.meaning ?? { en: p, de: p, es: p })})`)
            .join(' + ')}
        </p>
      )}
      {c.karate && (
        <p className="text-sm text-slate-600">
          <span className="font-semibold">{t('karate')}: </span>
          {c.karate}
        </p>
      )}
      {kk && (
        <p className="text-sm text-slate-600">
          <span className="font-semibold">{t('kukkiwonShort')}: </span>
          {kk.kukkiwon.split(' (')[0]} <span lang="ko">{kk.kukkiwonHangul}</span>{' '}
          <span className={`rounded-full px-2 py-0.5 text-xs ${MATCH_STYLE[kk.match]}`}>
            {loc(MATCH_LABEL[kk.match])}
          </span>
        </p>
      )}
      <FormDiagram cardId={cardId} />
      {CLIPS_BY_CARD[cardId] && (
        <div className="mt-3 grid gap-2">
          {firstClip && <FrameStrip clip={firstClip} quiet />}
          <button
            type="button"
            className="w-fit rounded-lg border px-3 py-1 text-sm"
            aria-expanded={watch}
            onClick={() => setWatch(!watch)}
          >
            {watch ? t('hide') : `▶ ${t('watch')}`}
          </button>
          {watch && <ClipViewer cardId={cardId} autoplay={false} />}
        </div>
      )}
    </article>
  )
}

/** Reading view: everything to learn at one belt, in one scroll. */
export function StudyPage() {
  const { t, loc, lang } = useT()
  const { level } = useParams()
  const { max } = useBeltFilter()
  const BELTS = useBelts()
  const parsed = Number(level)
  const index = Number.isInteger(parsed) && parsed >= 0 && parsed < BELTS.length ? parsed : 0
  const belt = BELTS[index]
  const [upTo, setUpTo] = useState(false)
  const c = upTo ? levelContentUpTo(index) : levelContent(index)
  const unit = UNITS.find((u) => u.earns === belt.id)
  const firstLesson = unit ? LESSONS.find((l) => l.unit === unit.id) : undefined

  const sections = [
    { key: 'studyWords', items: c.morphemes },
    { key: 'catHand', items: c.techniques.filter((x) => CARD_BY_ID[x.id].group.includes('hand')) },
    { key: 'catFoot', items: c.techniques.filter((x) => CARD_BY_ID[x.id].group.includes('foot')) },
    {
      key: 'catStance',
      items: c.techniques.filter((x) => CARD_BY_ID[x.id].group.includes('stance')),
    },
    {
      key: 'catCombo',
      items: c.techniques.filter((x) => CARD_BY_ID[x.id].group.includes('combo')),
    },
    { key: 'studyTerms', items: c.terms },
    { key: 'navForms', items: c.forms },
  ] as const
  const shown = new Set(sections.flatMap((s) => s.items.map((x) => x.id)))
  const rest = c.techniques.filter((x) => !shown.has(x.id))

  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-bold">{t('studyTitle')}</h1>
      <p className="text-sm text-slate-600">{t('studyIntro')}</p>
      <div className="grid gap-2">
        <ExportBar label={t('exportThis')} build={() => buildLevelDoc(index, { lang, t, loc })} />
        <ExportBar label={t('exportAll')} build={() => buildLevelDoc(null, { lang, t, loc })} />
      </div>
      <nav aria-label={t('studyTitle')} className="flex flex-wrap gap-2">
        {BELTS.map((b, i) => (
          <Link
            key={b.id}
            to={`/study/${i}`}
            aria-current={i === index ? 'page' : undefined}
            className={`flex items-center gap-2 rounded-full border px-3 py-1 text-sm ${i === index ? 'bg-slate-900 text-white' : 'bg-white'} ${i > max ? 'opacity-50' : ''}`}
          >
            <span
              aria-hidden
              className="inline-block h-3 w-5 rounded-sm border"
              style={{
                background: b.stripe ? `linear-gradient(${b.color} 60%, ${b.stripe} 60%)` : b.color,
              }}
            />
            {b.rank}
          </Link>
        ))}
      </nav>

      <label className="flex w-fit items-center gap-2 rounded-full border bg-white px-3 py-1 text-sm">
        <input type="checkbox" checked={upTo} onChange={(e) => setUpTo(e.target.checked)} />
        {t('studyCumulative')}
      </label>

      <header>
        <h2 className="text-xl font-bold">
          {belt.rank} · {loc(belt.name)}
        </h2>
        {unit && <p className="text-sm text-slate-600">{loc(unit.title)}</p>}
        {firstLesson && (
          <Link to={`/lesson/${firstLesson.id}`} className="text-sm underline">
            ▶ {t('studyPractice')}
          </Link>
        )}
      </header>

      {c.cardIds.length === 0 && c.theory.length === 0 && (
        <p className="text-slate-500">{t('studyEmpty')}</p>
      )}

      {[...sections, { key: 'studyOther' as const, items: rest }]
        .filter((s) => s.items.length > 0)
        .map((s) => (
          <div key={s.key} className="grid gap-3">
            <h2 className="border-b pb-1 text-lg font-bold">{t(s.key)}</h2>
            <div className="grid items-start gap-3 md:grid-cols-2">
              {s.items.map((x) => (
                <ReadingCard key={x.id} cardId={x.id} />
              ))}
            </div>
          </div>
        ))}

      {c.theory.length > 0 && (
        <div className="grid gap-3">
          <h2 className="border-b pb-1 text-lg font-bold">{t('studyTheory')}</h2>
          <ul className="grid gap-2">
            {c.theory.map((th) => (
              <li key={th.id} className="rounded-xl border bg-white p-4">
                <p className="font-semibold">{loc(th.question)}</p>
                <p className="text-sm">{loc(th.correct)}</p>
                {th.source === 'general' && (
                  <p className="text-xs text-amber-700">ℹ {t('generalSource')}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between text-sm">
        {index > 0 ? <Link to={`/study/${index - 1}`}>← {BELTS[index - 1].rank}</Link> : <span />}
        {index < BELTS.length - 1 && (
          <Link to={`/study/${index + 1}`}>{BELTS[index + 1].rank} →</Link>
        )}
      </div>
    </section>
  )
}
