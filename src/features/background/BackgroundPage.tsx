import { BACKGROUND, BACKGROUND_TOPICS } from '../../data/background'
import { ExportBar } from '../../shared/components/ExportBar'
import { useT } from '../../shared/i18n/useT'
import type { Doc } from '../export/document'

const TOPIC_KEY = {
  history: 'bgHistory',
  forms: 'navForms',
  belts: 'bgBelts',
  theory: 'studyTheory',
  competition: 'bgCompetition',
  terms: 'studyTerms',
  other: 'bgOther',
} as const

export function BackgroundPage() {
  const { t, loc } = useT()
  const groups = BACKGROUND_TOPICS.map((g) => ({
    g,
    items: BACKGROUND.filter((f) =>
      (BACKGROUND_TOPICS as readonly string[]).includes(f.appFit) ? f.appFit === g : g === 'other',
    ),
  })).filter((x) => x.items.length > 0)

  const build = (): Doc => ({
    title: t('bgTitle'),
    blocks: groups.flatMap(({ g, items }) => [
      { t: 'h2' as const, text: t(TOPIC_KEY[g]) },
      ...items.flatMap((f) => [
        { t: 'h3' as const, text: `${loc(f.title)}${f.hangul ? ` ${f.hangul}` : ''}` },
        { t: 'p' as const, text: loc(f.text) },
        ...f.sources.map((s) => ({ t: 'li' as const, text: `${s.lang}: ${s.title} ${s.url}` })),
      ]),
    ]),
  })

  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-bold">{t('bgTitle')}</h1>
      <p className="text-sm text-slate-600">{t('bgIntro')}</p>
      <ExportBar build={build} />
      {groups.map(({ g, items }) => (
        <div key={g} className="grid gap-3">
          <h2 className="border-b pb-1 text-lg font-bold">{t(TOPIC_KEY[g])}</h2>
          {items.map((f) => (
            <article key={f.id} className="rounded-xl border bg-white p-4" id={f.id}>
              <h3 className="font-bold">
                {loc(f.title)}{' '}
                {f.hangul && (
                  <span lang="ko" className="font-normal text-slate-500">
                    {f.hangul}
                  </span>
                )}
              </h3>
              <p className="mt-1 text-sm">{loc(f.text)}</p>
              {f.confidence !== 'high' && (
                <p className="mt-1 text-xs text-amber-700">ℹ {t('bgUnsure')}</p>
              )}
              <p className="mt-2 text-xs text-slate-600">
                {t('bgSources')}:{' '}
                {f.sources.map((s, i) => (
                  <span key={s.url}>
                    {i > 0 && ' · '}
                    <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                      {s.lang.toUpperCase()} – {s.title}
                    </a>
                  </span>
                ))}
              </p>
            </article>
          ))}
        </div>
      ))}
    </section>
  )
}
