import { useT } from '../../shared/i18n/useT'
import { CHOI, TIMELINE } from './timeline'

export function HistoryPage() {
  const { t, loc } = useT()
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
    </section>
  )
}
