import { CARD_BY_ID } from '../../data/cards'
import { cardBeltIndex } from '../../data/levels'
import { EditButton } from '../editor/EditButton'
import { CLIPS_BY_CARD } from '../../data/clips'
import { hasDiagram } from '../../shared/components/FormDiagram'
import { useState } from 'react'
import { CardMediaActions } from '../../shared/components/CardMediaActions'
import { useAppStore } from '../../shared/store/useAppStore'
import { FORMS, HYONG as HYONG_FORMS, YUDANJA, formBeltIndex } from '../../data/forms'
import { BELTS } from '../../data/belts'
import { isVisible } from '../../data/visibility'
import { useBeltFilter } from '../../shared/hooks/useBeltFilter'
import { BeltBadge } from '../../shared/components/BeltBadge'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { FormMedia } from './FormMedia'
import { useT } from '../../shared/i18n/useT'
import type { Lang } from '../../shared/i18n/types'

const DRILL_TITLE: Record<Lang, string> = { en: 'Preparatory drills', de: 'Vorübungen', es: 'Ejercicios preparatorios' }
const DRILL_IDS = ['saju-macki', 'saju-chirugi'] as const

const POOMSE: Record<Lang, string[]> = {
  en: [
    'South Korea; KTA committee founded 1965, taught from 30 Nov 1967 (Palgwae, Yudanja); Taeguk completed 30 Jan 1969.',
    '8 Taeguk + 8 Palgwae + 9 master forms (Koryo–Ilyo).',
    'Style known as WT / Kukkiwon.',
  ],
  de: [
    'Südkorea; KTA-Komitee 1965 gegründet, ab 30.11.1967 gelehrt (Palgwae, Yudanja); Taeguk am 30.01.1969 fertig.',
    '8 Taeguk + 8 Palgwae + 9 Meisterformen (Koryo–Ilyo).',
    'Stil bekannt als WT / Kukkiwon.',
  ],
  es: [
    'Corea del Sur; comité KTA fundado en 1965, enseñadas desde el 30-11-1967 (Palgwae, Yudanja); Taeguk terminadas el 30-01-1969.',
    '8 Taeguk + 8 Palgwae + 9 formas de maestro (Koryo–Ilyo).',
    'Estilo conocido como WT / Kukkiwon.',
  ],
}
const HYONG: Record<Lang, string[]> = {
  en: [
    'Created by General Choi Hong Hi (ITF); first called Chang-Hon forms, later renamed Tul.',
    '24 patterns ("24-hour theory"); influenced by Tang Soo Do / karate forms.',
    '"Sine wave" movement and renamed terms (e.g. Chongul → Gunnun).',
  ],
  de: [
    'Von General Choi Hong Hi (ITF) geschaffen; zuerst Chang-Hon-Formen, später Tul genannt.',
    '24 Formen („24-Stunden-Theorie“); beeinflusst von Tang Soo Do / Karate-Formen.',
    '„Sinuswelle“ und umbenannte Begriffe (z. B. Chongul = Gunnun).',
  ],
  es: [
    'Creadas por el general Choi Hong Hi (ITF); primero formas Chang-Hon, luego llamadas Tul.',
    '24 patrones (teoría de las 24 horas); influidas por formas de Tang Soo Do / karate.',
    '"Onda sinusoidal" y términos renombrados (p. ej. Chongul → Gunnun).',
  ],
}
const NOTE: Record<Lang, string> = {
  en: 'Your club teaches both: the choice of system does not change the technique repertoire. From 2nd Kup you also run the forms of the other system. Saju-macki and saju-chirugi are preparatory drills, not real forms. (Source: Formen §4.1.1, §4.2)',
  de: 'Dein Verein lehrt beide: Die Wahl ändert das Technik-Repertoire nicht. Ab dem 2. Kup werden auch die Formen des anderen Systems gelaufen. Saju-macki und saju-chirugi sind Vorübungen, keine echten Formen. (Quelle: Formen §4.1.1, §4.2)',
  es: 'Tu club enseña ambos: elegir uno no cambia el repertorio técnico. Desde el 2.º Kup también se corren las formas del otro sistema. Saju-macki y saju-chirugi son ejercicios preparatorios, no formas. (Fuente: Formen §4.1.1, §4.2)',
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-lg font-bold">{title}</h2>
      <ul className="list-disc space-y-1 pl-5 text-sm">
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  )
}

export function FormsPage() {
  const { t, lang, loc } = useT()
  const { visibleIndex } = useBeltFilter()
  const compact = useAppStore((s) => s.cardView === 'compact')
  const [playing, setPlaying] = useState<{ id: string; revision: number } | null>(null)
  const openMedia = (id: string) => setPlaying((old) => ({ id, revision: (old?.revision ?? 0) + 1 }))
  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-bold">{t('formsTitle')}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Poomse (품새)" items={POOMSE[lang]} />
        <Card title="Hyong / Tul (형 / 틀)" items={HYONG[lang]} />
      </div>
      <p className="rounded-lg bg-amber-50 p-3 text-sm">{NOTE[lang]}</p>
      <h2 className="mt-4 text-xl font-bold">{DRILL_TITLE[lang]}</h2>
      <ul className="grid items-start gap-3 md:grid-cols-2">
        {DRILL_IDS.filter((id) => CARD_BY_ID[id] && isVisible(id) && visibleIndex(cardBeltIndex(id))).map((id) => {
          const drill = CARD_BY_ID[id]
          return <li key={id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-bold">{drill.ko} <span lang="ko" className="font-normal text-slate-500">{drill.hangul}</span></p>
                <p className="mt-1 font-medium">{loc(drill.meaning)}</p>
              </div>
              <SpeakButton text={drill.hangul} />
              <span data-card-media-toolbar className="flex items-center gap-1">
                <CardMediaActions cardId={id} expanded={!compact || playing?.id === id} onOpen={() => openMedia(id)} />
                <EditButton cardId={id} />
                <BeltBadge cardId={id} />
              </span>
            </div>
            {(!compact || playing?.id === id) && <FormMedia key={playing?.id === id ? playing.revision : 0} cardId={id} autoplay={playing?.id === id} />}
          </li>
        })}
      </ul>
      <h2 className="mt-4 text-xl font-bold">{t('taegeukForms')}</h2>
      <ul className="grid items-start gap-3 md:grid-cols-2">
        {FORMS.filter((f) => isVisible(f.id) && visibleIndex(formBeltIndex(f))).map((f) => {
          return (
            <li key={f.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {f.ko}{' '}
                    <span lang="ko" className="font-normal text-slate-500">
                      {f.hangul}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {t('kukkiwonName')}: {f.kukkiwon} · {f.moves} {t('moves')}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-amber-800">
                    {t('examLevel')}: {BELTS[formBeltIndex(f)].rank}
                    {f.courseKeup ? ` · ${t('courseLevel')}: ${f.courseKeup} Keup` : ''}
                  </p>
                </div>
                <SpeakButton text={f.hangul} />
                <span data-card-media-toolbar className="flex items-center gap-1">
                  {compact && !CLIPS_BY_CARD[f.id]?.length && hasDiagram(f.id) && <button type="button" className="rounded border p-1" aria-label={t('diagramTitle')} onClick={() => openMedia(f.id)}>▧</button>}
                  <CardMediaActions cardId={f.id} expanded={!compact || playing?.id === f.id} onOpen={() => openMedia(f.id)} />
                  <EditButton cardId={f.id} />
                  <BeltBadge index={formBeltIndex(f)} />
                </span>
              </div>
              <p className="mt-1 font-medium">{loc(f.symbol)}</p>
              <p className="text-sm text-slate-600">{loc(f.meaning)}</p>
              {(!compact || playing?.id === f.id) && <FormMedia key={playing?.id === f.id ? playing.revision : 0} cardId={f.id} autoplay={playing?.id === f.id} />}
            </li>
          )
        })}
      </ul>
      <h2 className="mt-4 text-xl font-bold">{t('yudanjaForms')}</h2>
      <ul className="grid items-start gap-3 md:grid-cols-2">
        {YUDANJA.filter((y) => isVisible(y.id) && visibleIndex(formBeltIndex(y))).map((y) => {
          return (
            <li key={y.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-bold">
                    {y.ko}{' '}
                    <span lang="ko" className="font-normal text-slate-500">
                      {y.hangul}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {y.moves} {t('moves')}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-amber-800">
                    {t('examLevel')}: {y.examDan} Dan
                  </p>
                </div>
                <SpeakButton text={y.hangul} />
                <span data-card-media-toolbar className="flex items-center gap-1">
                  {compact && !CLIPS_BY_CARD[y.id]?.length && hasDiagram(y.id) && <button type="button" className="rounded border p-1" aria-label={t('diagramTitle')} onClick={() => openMedia(y.id)}>▧</button>}
                  <CardMediaActions cardId={y.id} expanded={!compact || playing?.id === y.id} onOpen={() => openMedia(y.id)} />
                  <EditButton cardId={y.id} />
                  <BeltBadge index={formBeltIndex(y)} />
                </span>
              </div>
              <p className="mt-1 font-medium">{loc(y.symbol)}</p>
              <p className="text-sm text-slate-600">{loc(y.meaning)}</p>
              {(!compact || playing?.id === y.id) && <FormMedia key={playing?.id === y.id ? playing.revision : 0} cardId={y.id} autoplay={playing?.id === y.id} />}
            </li>
          )
        })}
      </ul>
      <h2 className="mt-4 text-xl font-bold">{t('hyongForms')}</h2>
      <p className="text-xs text-slate-500">{t('hyongNote')}</p>
      <ul className="grid items-start gap-3 md:grid-cols-2">
        {HYONG_FORMS.filter((h) => isVisible(h.id) && visibleIndex(formBeltIndex(h))).map((h) => (
          <li key={h.id} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="font-bold">
                  {h.ko}{' '}
                  <span lang="ko" className="font-normal text-slate-500">
                    {h.hangul}
                  </span>
                </p>
                <p className="text-xs text-slate-500">
                  {h.moves} {t('moves')}
                </p>
                <p className="mt-1 text-xs font-semibold text-amber-800">
                  {t('examLevel')}:{' '}
                  {h.examDan ? `${h.examDan} Dan` : h.examKup ? `${h.examKup} Kup` : '—'}
                </p>
              </div>
              <SpeakButton text={h.hangul} />
              <span data-card-media-toolbar className="flex items-center gap-1">
                {compact && !CLIPS_BY_CARD[h.id]?.length && hasDiagram(h.id) && <button type="button" className="rounded border p-1" aria-label={t('diagramTitle')} onClick={() => openMedia(h.id)}>▧</button>}
                <CardMediaActions cardId={h.id} expanded={!compact || playing?.id === h.id} onOpen={() => openMedia(h.id)} />
                  <EditButton cardId={h.id} />
                <BeltBadge index={formBeltIndex(h)} />
              </span>
            </div>
            <p className="mt-1 font-medium">{loc(h.symbol)}</p>
            <p className="text-sm text-slate-600">{loc(h.meaning)}</p>
            {(!compact || playing?.id === h.id) && <FormMedia key={playing?.id === h.id ? playing.revision : 0} cardId={h.id} autoplay={playing?.id === h.id} />}
          </li>
        ))}
      </ul>
    </section>
  )
}
