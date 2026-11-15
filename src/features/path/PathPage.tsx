import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BELTS, type Belt } from '../../data/belts'
import { LESSONS, UNITS, lessonsOfUnit, type Lesson } from '../../data/lessons'
import { useT } from '../../shared/i18n/useT'
import { useAppStore } from '../../shared/store/useAppStore'
import {
  activeStreak,
  dayString,
  heldBeltIndex,
  isUnlocked,
  nextLesson,
  type Completed,
} from '../learn/progress'
import { Bubble } from '../mascot/Bubble'
import { GREETING } from '../mascot/lines'

const swatch = (b: Belt) =>
  b.stripe ? `linear-gradient(${b.color} 55%, ${b.stripe} 55%)` : b.color

const percent = (lessons: Lesson[], completed: Completed) =>
  lessons.length === 0
    ? 0
    : Math.round((lessons.filter((l) => completed[l.id]).length / lessons.length) * 100)

function ProgressBar({ value }: { value: number }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200"
    >
      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${value}%` }} />
    </div>
  )
}

/** Course outline: numbered belt sections with a chapter preview, typed rows and a % per section. */
export function PathPage() {
  const { t, loc } = useT()
  const completed = useAppStore((s) => s.completed)
  const streak = useAppStore((s) => s.streak)
  const strict = useAppStore((s) => s.strictOrder)
  const reset = useAppStore((s) => s.reset)
  const held = heldBeltIndex(completed)
  const [open, setOpen] = useState<Set<string>>(() => new Set([BELTS[held].id]))
  const next = nextLesson(completed)
  const days = activeStreak(streak, dayString())
  const toggle = (id: string, on: boolean) =>
    setOpen((o) => {
      const n = new Set(o)
      if (on) n.add(id)
      else n.delete(id)
      return n
    })
  const sections = [
    ...BELTS.map((b, i) => {
      const unit = UNITS.find((u) => u.earns === b.id)
      return {
        id: b.id,
        belt: b,
        index: i,
        title: unit ? loc(unit.title) : loc(b.name),
        lessons: unit ? lessonsOfUnit(unit.id) : [],
      }
    }),
  ]
  const bonus = UNITS.find((u) => u.id === 'bonus')
  const bonusLessons = lessonsOfUnit('bonus')
  const total = percent(LESSONS, completed)

  return (
    <section className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <nav aria-label={t('pathSections')} className="hidden h-fit lg:sticky lg:top-4 lg:block">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          {t('pathSections')}
        </p>
        <ol className="grid gap-1">
          {sections.map((s, i) => (
            <li key={s.id}>
              <a
                href={`#sec-${s.id}`}
                onClick={() => toggle(s.id, true)}
                className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white"
              >
                <span className="w-5 text-right text-xs text-slate-400">{i + 1}</span>
                <span
                  aria-hidden
                  className="inline-block h-3 w-5 rounded-sm border border-slate-700"
                  style={{ background: swatch(s.belt) }}
                />
                <span className="flex-1 font-medium">{s.belt.rank}</span>
                <span className="text-xs text-slate-500">{percent(s.lessons, completed)}%</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-4">
        <div>
          <h1 className="mb-1 text-2xl font-bold">{t('pathTitle')}</h1>
          <p className="mb-3 text-sm text-slate-600">{t('pathHint')}</p>
          <div className="flex items-center gap-3 text-sm">
            <span className="font-semibold">{t('pathOverall')}</span>
            <div className="flex-1">
              <ProgressBar value={total} />
            </div>
            <span>{total}%</span>
          </div>
        </div>

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

        {sections.map((s, i) => {
          const pct = percent(s.lessons, completed)
          const isOpen = open.has(s.id)
          return (
            <details
              key={s.id}
              id={`sec-${s.id}`}
              open={isOpen}
              onToggle={(e) => toggle(s.id, e.currentTarget.open)}
              className="rounded-2xl border bg-white shadow-sm"
            >
              <summary className="grid cursor-pointer gap-2 p-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-400">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span
                    aria-hidden
                    className="inline-block h-4 w-8 rounded border border-slate-800"
                    style={{ background: swatch(s.belt) }}
                  />
                  <span className="flex-1">
                    <span className="block font-bold">
                      {s.belt.rank} · {loc(s.belt.name)}
                      {i === held && (
                        <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs">
                          {t('youAreHere')}
                        </span>
                      )}
                    </span>
                    {s.lessons.length > 0 && (
                      <span className="block text-xs text-slate-500">
                        {s.lessons.map((l) => loc(l.title)).join(' · ')}
                      </span>
                    )}
                  </span>
                  <span className="text-sm font-semibold">{pct}%</span>
                </div>
                <ProgressBar value={pct} />
              </summary>
              <div className="grid gap-3 border-t p-4">
                {s.lessons.length > 0 ? (
                  <LessonList lessons={s.lessons} completed={completed} strict={strict} />
                ) : (
                  <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500">
                    {t('comingSoon')}
                  </p>
                )}
                <Link to={`/study/${s.index}`} className="w-fit text-sm underline">
                  📖 {t('pathStudyLink')}
                </Link>
              </div>
            </details>
          )
        })}

        {bonus && (
          <details className="rounded-2xl border border-dashed border-amber-400 bg-amber-50/50">
            <summary className="cursor-pointer p-4 font-bold">
              {loc(bonus.title)}
              <span className="block text-xs font-normal text-slate-600">{t('bonusHint')}</span>
            </summary>
            <div className="border-t border-amber-200 p-4">
              <LessonList lessons={bonusLessons} completed={completed} strict={strict} />
            </div>
          </details>
        )}

        <button className="w-fit text-xs text-slate-500 underline" onClick={() => reset()}>
          {t('resetProgress')}
        </button>
      </div>
    </section>
  )
}

function LessonList({
  lessons,
  completed,
  strict,
}: {
  lessons: Lesson[]
  completed: Completed
  strict: boolean
}) {
  const { t, loc } = useT()
  return (
    <ol className="grid gap-1.5">
      {lessons.map((l) => {
        const unlocked = isUnlocked(l.id, completed, strict)
        const stars = completed[l.id]
        const cls = 'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm'
        const label = (
          <>
            <span aria-hidden>{stars ? '✅' : unlocked ? '▶️' : '🔒'}</span>
            <span
              className={`rounded px-1.5 py-0.5 text-[11px] font-semibold uppercase ${l.checkpoint ? 'bg-violet-100 text-violet-800' : 'bg-sky-100 text-sky-800'}`}
            >
              {l.checkpoint ? t('pathQuiz') : t('pathLesson')}
            </span>
            <span className="flex-1">{loc(l.title)}</span>
            {stars ? <span aria-label={`${stars} stars`}>{'⭐'.repeat(stars)}</span> : null}
          </>
        )
        return (
          <li key={l.id}>
            {unlocked ? (
              <Link to={`/lesson/${l.id}`} className={`${cls} bg-white hover:bg-amber-50`}>
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
  )
}
