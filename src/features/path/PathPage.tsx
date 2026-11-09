import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BELTS } from '../../data/belts'
import { LESSONS, UNITS, lessonsOfUnit } from '../../data/lessons'
import { useT } from '../../shared/i18n/useT'
import { useAppStore } from '../../shared/store/useAppStore'
import { activeStreak, dayString, heldBeltIndex, isUnlocked, nextLesson } from '../learn/progress'
import { Bubble } from '../mascot/Bubble'
import { GREETING } from '../mascot/lines'
import { PathMap } from './PathMap'

export function PathPage() {
  const { t, loc } = useT()
  const completed = useAppStore((s) => s.completed)
  const streak = useAppStore((s) => s.streak)
  const strict = useAppStore((s) => s.strictOrder)
  const reset = useAppStore((s) => s.reset)
  const held = heldBeltIndex(completed)
  const [selected, setSelected] = useState(held)
  const belt = BELTS[selected]
  const unit = UNITS.find((u) => u.earns === belt.id)
  const lessons = unit ? lessonsOfUnit(unit.id) : []
  const doneCount = lessons.filter((l) => completed[l.id]).length
  const next = nextLesson(completed)
  const days = activeStreak(streak, dayString())

  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
      <div className="mx-auto w-full max-w-xl">
        <h1 className="mb-1 text-2xl font-bold">{t('pathTitle')}</h1>
        <p className="mb-3 text-sm text-slate-600">{t('pathHint')}</p>
        <PathMap
          currentIndex={held}
          selectedIndex={selected}
          onSelect={setSelected}
          youAreHere={t('youAreHere')}
        />
      </div>
      <aside className="grid h-fit gap-4 lg:sticky lg:top-4" aria-live="polite">
        <Bubble mood="happy" beltColor={BELTS[held].color}>
          <p>{loc(GREETING(BELTS[held].name, days))}</p>
          {next ? (
            <Link
              to={`/lesson/${next.id}`}
              className="mt-2 inline-block rounded-lg bg-emerald-500 px-3 py-1.5 font-semibold text-white"
            >
              {t('continueLearning')}: {loc(next.title)}
            </Link>
          ) : (
            <p className="mt-1 font-semibold">{t('allDone')}</p>
          )}
        </Bubble>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow">
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

          {unit ? (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">
                {loc(unit.title)}{' '}
                <span className="font-normal text-slate-500">
                  ({doneCount}/{lessons.length})
                </span>
              </p>
              <ol className="grid gap-1.5">
                {lessons.map((l) => {
                  const open = isUnlocked(l.id, completed, strict)
                  const stars = completed[l.id]
                  const cls = 'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm'
                  const label = (
                    <>
                      <span aria-hidden>{stars ? '✅' : open ? '▶️' : '🔒'}</span>
                      <span className="flex-1">{loc(l.title)}</span>
                      {stars ? (
                        <span aria-label={`${stars} stars`}>{'⭐'.repeat(stars)}</span>
                      ) : null}
                    </>
                  )
                  return (
                    <li key={l.id}>
                      {open ? (
                        <Link
                          to={`/lesson/${l.id}`}
                          className={`${cls} bg-white hover:bg-amber-50`}
                        >
                          {label}
                        </Link>
                      ) : (
                        <div className={`${cls} bg-slate-50 text-slate-400`} aria-disabled="true">
                          {label}
                        </div>
                      )}
                    </li>
                  )
                })}
              </ol>
            </div>
          ) : (
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
              {t('comingSoon')}
            </p>
          )}
          <p className="mt-3 text-xs text-slate-500">
            {LESSONS.filter((l) => completed[l.id]).length}/{LESSONS.length}
          </p>
          <button
            className="mt-2 text-xs text-slate-500 underline"
            onClick={() => {
              reset()
              setSelected(0)
            }}
          >
            {t('resetProgress')}
          </button>
        </div>
      </aside>
    </section>
  )
}
