import { useState } from 'react'
import { BELTS } from '../../data/belts'
import { TECHNIQUES } from '../../data/techniques'
import { useT } from '../../shared/i18n/useT'
import { useAppStore } from '../../shared/store/useAppStore'
import { PathMap } from './PathMap'

export function PathPage() {
  const { t, loc } = useT()
  const current = useAppStore((s) => s.currentBeltIndex)
  const reach = useAppStore((s) => s.reachBelt)
  const reset = useAppStore((s) => s.reset)
  const learned = useAppStore((s) => s.learned)
  const [selected, setSelected] = useState(current)
  const belt = BELTS[selected]
  const kup = Number(belt.id.replace('kup', ''))
  const items = TECHNIQUES.filter((x) => x.kup === kup)
  const done = items.filter((x) => learned.includes(x.id)).length

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="mb-1 text-2xl font-bold">{t('pathTitle')}</h1>
        <p className="mb-3 text-sm text-slate-600">{t('pathHint')}</p>
        <PathMap
          currentIndex={current}
          selectedIndex={selected}
          onSelect={setSelected}
          youAreHere={t('youAreHere')}
        />
      </div>
      <aside
        className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow lg:sticky lg:top-4"
        aria-live="polite"
      >
        <div className="mb-3 flex items-center gap-3">
          <span
            className="inline-block h-6 w-16 rounded border-2 border-slate-900"
            style={{
              background: belt.stripe
                ? `linear-gradient(90deg, ${belt.color} 70%, ${belt.stripe} 70%)`
                : belt.color,
            }}
          />
          <h2 className="text-lg font-bold">{belt.rank}</h2>
        </div>
        <p className="font-medium">{loc(belt.name)}</p>
        {belt.koName && <p className="text-sm text-slate-500">{belt.koName}</p>}
        <div className="my-4 rounded-lg bg-slate-50 p-3 text-sm">
          {belt.filled ? (
            <p>
              {done} / {items.length} {t('learned')}
            </p>
          ) : (
            <p className="text-slate-500">{t('comingSoon')}</p>
          )}
        </div>
        {selected !== current && (
          <button
            className="w-full rounded-lg bg-amber-500 px-4 py-2 font-semibold text-white hover:bg-amber-600"
            onClick={() => reach(selected)}
          >
            {t('markReached')}
          </button>
        )}
        <button
          className="mt-3 text-xs text-slate-500 underline"
          onClick={() => {
            reset()
            setSelected(0)
          }}
        >
          {t('resetProgress')}
        </button>
      </aside>
    </section>
  )
}
