import { useState } from 'react'
import { CLIPS_BY_CARD, clipKey, type Clip } from '../../data/clips'
import { useT } from '../../shared/i18n/useT'
import { frameUrl, regenerateFrames, saveClipRanges } from './api'

/** The local video that holds a clip (the German course dub is used for both course dubs: same timeline). */
const videoOf = (c: Clip) =>
  c.source === 'course'
    ? 'dnYQ1Y0acrE'
    : c.source === 'selfdefense'
      ? 'crp_bNCaPqE'
      : (c.videoId ?? '')

const STEPS = [-3, -1, 1, 3]

/** Re-times the clips of a card (start/end) and regenerates their six frames from the local video. */
export function ClipsEditor({ cardId, onSaved }: { cardId: string; onSaved: () => void }) {
  const { t } = useT()
  const clips = CLIPS_BY_CARD[cardId] ?? []
  const [ranges, setRanges] = useState(clips.map((c) => ({ start: c.start, end: c.end })))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  if (clips.length === 0) return null

  const changed = ranges.map((r, i) => r.start !== clips[i].start || r.end !== clips[i].end)
  const valid = ranges.every(
    (r) => Number.isFinite(r.start) && Number.isFinite(r.end) && r.start >= 0 && r.end > r.start,
  )

  const set = (i: number, key: 'start' | 'end', value: number) =>
    setRanges((cur) => cur.map((r, j) => (j === i ? { ...r, [key]: value } : r)))

  const save = async () => {
    setBusy(true)
    setError('')
    try {
      // keep the clips that were re-timed before, plus the ones changed now
      const payload = clips
        .map((c, i) => ({ index: i, start: ranges[i].start, end: ranges[i].end, was: c }))
        .filter((x, i) => changed[i])
        .map(({ index, start, end }) => ({ index, start, end }))
      await saveClipRanges(cardId, payload)
      for (let i = 0; i < clips.length; i++) {
        if (!changed[i]) continue
        await regenerateFrames({
          cardId,
          key: clipKey(clips[i]),
          videoId: videoOf(clips[i]),
          start: ranges[i].start,
          end: ranges[i].end,
        })
      }
      onSaved()
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <fieldset className="grid gap-3">
      <legend className="font-semibold text-slate-600">{t('edClips')}</legend>
      <p className="text-xs text-slate-500">{t('edClipHint')}</p>
      {clips.map((c, i) => {
        const id = videoOf(c)
        const label = c.label ?? c.source
        return (
          <div key={i} className="grid gap-2 rounded-lg border p-2 sm:grid-cols-2">
            {(['start', 'end'] as const).map((key) => (
              <div key={key} className="grid gap-1">
                <img
                  src={frameUrl(id, ranges[i][key], 320)}
                  alt={`${t(key === 'start' ? 'edClipStart' : 'edClipEnd')} ${label}`}
                  className="aspect-video w-full rounded bg-black object-contain"
                />
                <label className="flex items-center gap-2 text-sm font-medium">
                  <span>
                    {t(key === 'start' ? 'edClipStart' : 'edClipEnd')} · {label}
                  </span>
                  <input
                    type="number"
                    step={0.5}
                    aria-label={`${t(key === 'start' ? 'edClipStart' : 'edClipEnd')} ${label}`}
                    className="w-28 rounded border px-2 py-0.5 font-normal"
                    value={ranges[i][key]}
                    onChange={(e) => set(i, key, Number(e.target.value))}
                  />
                </label>
                <div className="flex gap-1">
                  {STEPS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="rounded border px-1.5 text-xs"
                      onClick={() => set(i, key, Math.max(0, ranges[i][key] + s))}
                    >
                      {s < 0 ? '−' : '+'}
                      {Math.abs(s)} s
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      })}
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <button
        type="button"
        disabled={busy || !valid || !changed.some(Boolean)}
        onClick={save}
        className="w-fit rounded-lg bg-slate-900 px-4 py-1.5 text-sm text-white disabled:opacity-50"
      >
        {t('edClipSave')}
      </button>
    </fieldset>
  )
}
