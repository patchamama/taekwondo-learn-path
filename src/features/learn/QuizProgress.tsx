export type SegmentState = 'ok' | 'bad' | 'current' | 'pending' | 'skipped'

const COLOR: Record<SegmentState, string> = {
  ok: 'bg-emerald-500',
  bad: 'bg-rose-500',
  current: 'bg-sky-500',
  pending: 'bg-slate-200',
  skipped: 'bg-slate-400',
}

/** One segment per question (wrong ones in red; they are asked again at the end) and the "3/10" counter. */
export function QuizProgress({ segments, position }: { segments: SegmentState[]; position: number }) {
  const done = segments.filter((s) => s === 'ok' || s === 'bad' || s === 'skipped').length
  const percent = segments.length === 0 ? 0 : Math.min(100, Math.round((done / segments.length) * 100))
  return (
    <div className="flex flex-1 items-center gap-2">
      <div
        className="flex h-3 flex-1 gap-0.5 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        {segments.map((s, i) => (
          <span key={i} data-state={s} className={`h-full flex-1 transition-colors ${COLOR[s]}`} />
        ))}
      </div>
      <span className="text-xs font-semibold tabular-nums text-slate-600" aria-label="question-counter">
        {Math.min(position, segments.length)}/{segments.length}
      </span>
    </div>
  )
}
