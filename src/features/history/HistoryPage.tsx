import { KOREA_FACTS } from '../../data/koreaFacts'
import { FactSections } from '../../shared/components/FactSections'
import { ExportBar } from '../../shared/components/ExportBar'
import { buildSectionsDoc } from '../export/document'
import { useT } from '../../shared/i18n/useT'
import { CHOI, HISTORY_CONTEXT, HISTORY_READING_SOURCE, HISTORY_READING_TITLE, TIMELINE } from './timeline'

export function HistoryPage() {
  const { t, loc, lang } = useT()
  return (
    <section className="grid gap-8">
      <h1 className="text-2xl font-bold">{t('historyTitle')}</h1>
      <div>
        <h2 className="mb-3 text-lg font-semibold">{t('timeline')}</h2>
        <ol className="relative ml-3 border-l-2 border-amber-400 pl-5">
          {TIMELINE.map((e) => (
            <li key={e.year + e.text.en} className="mb-4">
              <span className="absolute -left-[7px] mt-1.5 h-3 w-3 rounded-full bg-amber-500" />
              <p className="font-bold">{e.year}</p>
              <p className="text-sm text-slate-700">{loc(e.text)}</p>
              {e.source === 'general' && (
                <p className="text-xs text-amber-700">ℹ {t('generalSource')}</p>
              )}
            </li>
          ))}
        </ol>
      </div>
      <div className="rounded-xl border bg-white p-5">
        <h2 className="mb-2 text-lg font-semibold">{t('choiTitle')}</h2>
        <ul className="list-disc space-y-1 pl-5 text-sm">
          {CHOI.map((c) => (
            <li key={c.en}>{loc(c)}</li>
          ))}
        </ul>
      </div>
      <div className="grid gap-4">
        <h2 className="text-lg font-semibold">{loc(HISTORY_READING_TITLE)}</h2>
        <p className="text-sm text-slate-600">{loc(HISTORY_READING_SOURCE)}</p>
        {HISTORY_CONTEXT.map((topic) => (
          <section key={topic.id} aria-labelledby={`history-${topic.id}`} className="rounded-xl border bg-white p-5">
            <h3 id={`history-${topic.id}`} className="mb-2 font-semibold">{loc(topic.title)}</h3>
            <div className="space-y-3 text-sm text-slate-700">
              {topic.paragraphs.map((paragraph) => <p key={paragraph.en}>{loc(paragraph)}</p>)}
            </div>
          </section>
        ))}
      </div>
      <div className="grid gap-3">
        <h2 className="text-lg font-semibold">{t('koreaTitle')}</h2>
        <ExportBar build={() => buildSectionsDoc(t('koreaTitle'), KOREA_FACTS, { lang, t, loc })} />
        <FactSections sections={KOREA_FACTS} />
      </div>
    </section>
  )
}
