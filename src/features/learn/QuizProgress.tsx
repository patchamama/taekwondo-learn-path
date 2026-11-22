export type SegmentState = 'ok' | 'bad' | 'current' | 'pending' | 'skipped'

const COLOR: Record<SegmentState, string> = {
  ok: 'bg-emerald-500',
  bad: 'bg-rose-500',
  current: 'bg-sky-500',
  pending: 'bg-slate-200',
  skipped: 'bg-slate-400',
}

/** One segment per question (wrong ones in red; they are asked again at the end) and the "3/10" counter. */
export function QuizProgress({
  segments,
  position,
  titles = [],
  active = null,
  onSelect,
}: {
  segments: SegmentState[]
  position: number
  /** hint of each segment (the question), shown on hover */
  titles?: (string | undefined)[]
  /** segment whose question is being reviewed */
  active?: number | null
  /** pressing an already evaluated segment */
  onSelect?: (i: number) => void
}) {
  const done = segments.filter((s) => s === 'ok' || s === 'bad' || s === 'skipped').length
  const percent =
    segments.length === 0 ? 0 : Math.min(100, Math.round((done / segments.length) * 100))
  return (
    <div className="flex flex-1 items-center gap-2">
      <div
        className="flex h-3 flex-1 gap-0.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {segments.map((s, i) => {
          const cls = `h-full flex-1 transition-colors ${COLOR[s]} ${active === i ? 'ring-2 ring-inset ring-slate-900' : ''}`
          return (s === 'ok' || s === 'bad') && onSelect ? (
            <button
              key={i}
              type="button"
              data-state={s}
              title={titles[i]}
              aria-label={titles[i] ?? String(i + 1)}
              aria-current={active === i ? 'true' : undefined}
              onClick={() => onSelect(i)}
              className={`${cls} cursor-pointer`}
            />
          ) : (
            <span key={i} data-state={s} title={titles[i]} className={cls} />
          )
        })}
      </div>
      <span
        className="text-xs font-semibold tabular-nums text-slate-600"
        aria-label="question-counter"
      >
        {Math.min(position, segments.length)}/{segments.length}
      </span>
    </div>
  )
}
