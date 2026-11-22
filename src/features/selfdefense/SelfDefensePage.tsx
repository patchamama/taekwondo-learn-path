import { useState } from 'react'
import { isVisible } from '../../data/visibility'
import { SELF_DEFENSE, SELF_DEFENSE_GROUPS } from '../../data/selfDefense'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { useT } from '../../shared/i18n/useT'
import { ClipViewer } from '../videos/ClipViewer'

/** Bonus: self-defence chapters of the Kukkiwon course, grouped, each with frames and the clip. */
export function SelfDefensePage() {
  const { t, loc } = useT()
  const [open, setOpen] = useState<string | null>(null)
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-bold">{t('sdTitle')}</h1>
      <p className="rounded-xl bg-rose-50 p-3 text-sm">⚠ {t('sdSafety')}</p>
      <p className="text-sm text-slate-600">{t('sdSource')}</p>
      {SELF_DEFENSE_GROUPS.map((g) => (
        <div key={g.id}>
          <h2 className="text-lg font-bold">{loc(g.title)}</h2>
          <p className="mb-2 text-sm text-slate-600">{loc(g.hint)}</p>
          <ul className="grid items-start gap-3 md:grid-cols-2">
            {SELF_DEFENSE.filter((x) => x.group === g.id && isVisible(x.id)).map((x) => {
              const isOpen = open === x.id
              return (
                <li key={x.id} className="rounded-xl border bg-white p-4 shadow-sm">
                  <div className="flex items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold">{loc(x.title)}</p>
                      <p className="text-xs text-slate-500">
                        {x.ko} · <span lang="ko">{x.hangul}</span>
                      </p>
                    </div>
                    <SpeakButton text={x.hangul} />
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{loc(x.desc)}</p>
                  <p className="mt-1 text-xs text-slate-500">{x.contents}</p>
                  <button
                    className="mt-2 rounded-lg border px-3 py-1 text-sm"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : x.id)}
                  >
                    {isOpen ? t('hide') : `▶ ${t('watch')}`}
                  </button>
                  {isOpen && (
                    <div className="mt-2">
                      <ClipViewer cardId={x.id} autoplay={false} />
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
