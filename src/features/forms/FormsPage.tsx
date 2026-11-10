import { useState } from 'react'
import { FORMS, HYONG as HYONG_FORMS, YUDANJA, formBeltIndex } from '../../data/forms'
import { BELTS } from '../../data/belts'
import { useBeltFilter } from '../../shared/hooks/useBeltFilter'
import { CLIPS_BY_CARD } from '../../data/clips'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { FormDiagram } from '../../shared/components/FormDiagram'
import { useT } from '../../shared/i18n/useT'
import { ClipViewer } from '../videos/ClipViewer'
import type { Lang } from '../../shared/i18n/types'

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
  const [open, setOpen] = useState<string | null>(null)
  const { visibleIndex } = useBeltFilter()
  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-bold">{t('formsTitle')}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Poomse (품새)" items={POOMSE[lang]} />
        <Card title="Hyong / Tul (형 / 틀)" items={HYONG[lang]} />
      </div>
      <p className="rounded-lg bg-amber-50 p-3 text-sm">{NOTE[lang]}</p>
      <h2 className="mt-4 text-xl font-bold">{t('taegeukForms')}</h2>
      <ul className="grid items-start gap-3 md:grid-cols-2">
        {FORMS.filter((f) => visibleIndex(formBeltIndex(f))).map((f) => {
          const isOpen = open === f.id
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
              </div>
              <p className="mt-1 font-medium">{loc(f.symbol)}</p>
              <p className="text-sm text-slate-600">{loc(f.meaning)}</p>
              <FormDiagram cardId={f.id} />
              {CLIPS_BY_CARD[f.id] && (
                <div className="mt-2">
                  <button
                    className="rounded-lg border px-3 py-1 text-sm"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : f.id)}
                  >
                    {isOpen ? t('hide') : `▶ ${t('watch')}`}
                  </button>
                  {isOpen && (
                    <div className="mt-2">
                      <ClipViewer cardId={f.id} />
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <h2 className="mt-4 text-xl font-bold">{t('yudanjaForms')}</h2>
      <ul className="grid items-start gap-3 md:grid-cols-2">
        {YUDANJA.filter((y) => visibleIndex(formBeltIndex(y))).map((y) => {
          const isOpen = open === y.id
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
              </div>
              <p className="mt-1 font-medium">{loc(y.symbol)}</p>
              <p className="text-sm text-slate-600">{loc(y.meaning)}</p>
              {CLIPS_BY_CARD[y.id] && (
                <div className="mt-2">
                  <button
                    className="rounded-lg border px-3 py-1 text-sm"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : y.id)}
                  >
                    {isOpen ? t('hide') : `▶ ${t('watch')}`}
                  </button>
                  {isOpen && (
                    <div className="mt-2">
                      <ClipViewer cardId={y.id} />
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ul>
      <h2 className="mt-4 text-xl font-bold">{t('hyongForms')}</h2>
      <p className="text-xs text-slate-500">{t('hyongNote')}</p>
      <ul className="grid items-start gap-3 md:grid-cols-2">
        {HYONG_FORMS.filter((h) => visibleIndex(formBeltIndex(h))).map((h) => (
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
            </div>
            <p className="mt-1 font-medium">{loc(h.symbol)}</p>
            <p className="text-sm text-slate-600">{loc(h.meaning)}</p>
            {CLIPS_BY_CARD[h.id] && (
              <div className="mt-2">
                <button
                  className="rounded-lg border px-3 py-1 text-sm"
                  aria-expanded={open === h.id}
                  onClick={() => setOpen(open === h.id ? null : h.id)}
                >
                  {open === h.id ? t('hide') : `▶ ${t('watch')}`}
                </button>
                {open === h.id && (
                  <div className="mt-2">
                    <ClipViewer cardId={h.id} />
                  </div>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
