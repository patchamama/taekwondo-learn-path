import { Link } from 'react-router-dom'
import type { Belt } from '../../data/belts'
import type { Lesson } from '../../data/lessons'
import { useT } from '../../shared/i18n/useT'
import { isUnlocked, type Completed } from '../learn/progress'

export interface RoadmapSection {
  id: string
  belt?: Belt
  title: string
  lessons: Lesson[]
}

const GAP = 96
const OFFSETS = [0, 44, 68, 44, 0, -44, -68, -44]
const W = 240
const X0 = W / 2

const swatch = (b: Belt) =>
  b.stripe ? `linear-gradient(${b.color} 55%, ${b.stripe} 55%)` : b.color

/** Points of a section's trail: one per lesson, zig-zagging down the page. */
export const trailPoints = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    x: X0 + OFFSETS[i % OFFSETS.length],
    y: 40 + i * GAP,
  }))

/** Smooth SVG path through the points. */
export function trailPath(pts: { x: number; y: number }[]): string {
  if (pts.length === 0) return ''
  return pts
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`
      const q = pts[i - 1]
      const my = (q.y + p.y) / 2
      return `C ${q.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`
    })
    .join(' ')
}

/** Visual roadmap: each belt is a stretch of trail with round lesson nodes (quizzes are stars). */
export function PathRoadmap({
  sections,
  completed,
  strict,
  nextId,
}: {
  sections: RoadmapSection[]
  completed: Completed
  strict: boolean
  nextId?: string
}) {
  const { t, loc } = useT()
  return (
    <div className="grid gap-8" data-testid="roadmap">
      {sections.map((s, si) => {
        const pts = trailPoints(s.lessons.length)
        const height = Math.max(80, 40 + s.lessons.length * GAP)
        const doneCount = s.lessons.filter((l) => completed[l.id]).length
        const doneUpTo = s.lessons.findIndex((l) => !completed[l.id])
        const donePts = pts.slice(0, doneUpTo === -1 ? pts.length : doneUpTo + 1)
        return (
          <section
            key={s.id}
            id={`sec-${s.id}`}
            aria-label={s.title}
            className="mx-auto w-full max-w-md"
          >
            <div className="mb-3 flex items-center gap-3 rounded-2xl border bg-white p-3 shadow-sm">
              {s.belt && (
                <span
                  aria-hidden
                  className="inline-block h-5 w-10 rounded border border-slate-800"
                  style={{ background: swatch(s.belt) }}
                />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-400">
                  {String(si + 1).padStart(2, '0')} · {s.belt?.rank ?? '★'}
                </p>
                <p className="truncate font-bold">{s.title}</p>
              </div>
              <span className="text-sm font-semibold">
                {doneCount}/{s.lessons.length}
              </span>
            </div>
            {s.lessons.length === 0 ? (
              <p className="rounded-lg bg-slate-50 p-3 text-center text-sm text-slate-500">
                {t('comingSoon')}
              </p>
            ) : (
              <div className="relative mx-auto" style={{ width: W, height }}>
                <svg width={W} height={height} className="absolute inset-0" aria-hidden>
                  <path
                    d={trailPath(pts)}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth={10}
                    strokeLinecap="round"
                    strokeDasharray="2 16"
                  />
                  {donePts.length > 1 && (
                    <path
                      d={trailPath(donePts)}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth={10}
                      strokeLinecap="round"
                      data-testid="done-trail"
                    />
                  )}
                </svg>
                {s.lessons.map((l, i) => {
                  const unlocked = isUnlocked(l.id, completed, strict)
                  const stars = completed[l.id]
                  const isNext = l.id === nextId
                  const tone = stars
                    ? 'bg-emerald-500 text-white border-emerald-700'
                    : unlocked
                      ? 'bg-amber-400 text-slate-900 border-amber-600'
                      : 'bg-slate-200 text-slate-400 border-slate-300'
                  const icon = stars ? '✓' : unlocked ? (l.checkpoint ? '★' : '▶') : '🔒'
                  const node = (
                    <span
                      className={`grid h-14 w-14 place-items-center rounded-full border-b-4 text-xl font-bold shadow ${tone} ${isNext ? 'ring-4 ring-amber-300' : ''}`}
                    >
                      {icon}
                    </span>
                  )
                  const style = { left: pts[i].x - 28, top: pts[i].y - 28 }
                  const label = `${loc(l.title)}${stars ? ` (${stars}★)` : ''}`
                  return (
                    <div key={l.id} className="absolute" style={style}>
                      {unlocked ? (
                        <Link to={`/lesson/${l.id}`} aria-label={label} title={label}>
                          {node}
                        </Link>
                      ) : (
                        <span aria-label={label} aria-disabled="true" title={label}>
                          {node}
                        </span>
                      )}
                      <span
                        className={`pointer-events-none absolute top-3 w-28 text-xs font-medium leading-tight ${pts[i].x >= X0 ? 'right-16 text-right' : 'left-16'}`}
                      >
                        {loc(l.title)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </section>
        )
      })}
    </div>
  )
}
