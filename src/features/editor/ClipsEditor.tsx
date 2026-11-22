import { useEffect, useState } from 'react'
import { CARD_BY_ID } from '../../data/cards'
import { isVisible } from '../../data/visibility'
import { CLIPS_BY_CARD, clipKey, type Clip } from '../../data/clips'
import { useT } from '../../shared/i18n/useT'
import { addClip, frameUrl, health, regenerateFrames, saveClipRanges, translateWithAi, videoIdFromUrl, type Lang } from './api'
import { ClipSourcePreview } from './ClipSourcePreview'

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
  const [autoFrames, setAutoFrames] = useState(true)
  const [active, setActive] = useState(0)
  const eligible = Object.values(CARD_BY_ID).filter((c) => isVisible(c.id) && c.kind === 'technique' && !CLIPS_BY_CARD[c.id]?.length)
  const [selected, setSelected] = useState(eligible.some((c) => c.id === cardId) ? cardId : eligible[0]?.id ?? '')
  const [url, setUrl] = useState('')
  const [newRange, setNewRange] = useState({ start: 0, end: 5 })
  const [aiEnabled, setAiEnabled] = useState(false)
  const [from, setFrom] = useState<Lang>('en')
  const [sourceText, setSourceText] = useState('')
  const [suggestions, setSuggestions] = useState<Partial<Record<Lang, string>>>({})
  const [translating, setTranslating] = useState(false)
  useEffect(() => {
    let alive = true
    health().then((h) => { if (alive) setAiEnabled(h.ai.enabled) })
    return () => { alive = false }
  }, [])
  const rangeValid = (r: { start: number; end: number }) =>
    Number.isFinite(r.start) && Number.isFinite(r.end) && r.start >= 0 && r.end <= 100000 && Math.round(r.end * 10) > Math.round(r.start * 10)
  const newVideoId = videoIdFromUrl(url)

  const changed = ranges.map((r, i) => r.start !== clips[i].start || r.end !== clips[i].end)
  const valid = ranges.every(rangeValid)

  const set = (i: number, key: 'start' | 'end', value: number) =>
    setRanges((cur) => cur.map((r, j) => (j === i ? { ...r, [key]: value } : r)))

  const save = async () => {
    setBusy(true)
    setError('')
    try {
      // The backend merges changed indices into all previously saved ranges.
      const payload = clips
        .map((c, i) => ({ index: i, start: ranges[i].start, end: ranges[i].end, was: c }))
        .filter((x, i) => changed[i])
        .map(({ index, start, end }) => ({ index, start, end }))
      await saveClipRanges(cardId, payload)
      for (let i = 0; i < clips.length; i++) {
        if (!changed[i] || !autoFrames) continue
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
    } finally {
      setBusy(false)
    }
  }

  const add = async () => {
    if (!newVideoId || !rangeValid(newRange) || !selected) return
    setBusy(true)
    setError('')
    let saved = false
    try {
      await addClip({ cardId: selected, url, ...newRange })
      saved = true
      if (autoFrames) await regenerateFrames({ cardId: selected, key: `ext-${newVideoId}`, videoId: newVideoId, ...newRange })
      onSaved()
    } catch (e) {
      setError(`${saved ? 'Video saved; frame generation failed. Reload before further edits. ' : ''}${(e as Error).message}`)
    } finally { setBusy(false) }
  }

  const suggest = async () => {
    setTranslating(true)
    setError('')
    try {
      const result = await translateWithAi({ from, targets: (['en', 'de', 'es'] as Lang[]).filter((l) => l !== from), text: sourceText })
      setSuggestions(result.translations)
    } catch (e) { setError((e as Error).message) }
    finally { setTranslating(false) }
  }

  return (
    <fieldset className="grid gap-3" disabled={busy}>
      <legend className="font-semibold text-slate-600">{t('edClips')}</legend>
      <p className="text-xs text-slate-500">Mark boundaries while the local source plays, or enter seconds to one decimal. Saving updates ranges; optional regeneration extracts six frames locally.</p>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={autoFrames} onChange={(e) => setAutoFrames(e.target.checked)} />Automatically regenerate frames</label>
      {clips.length > 0 && <>
        <label className="grid gap-1 text-sm">Source clip
          <select value={active} onChange={(e) => setActive(Number(e.target.value))} className="rounded border p-2">
            {clips.map((c, i) => <option key={i} value={i}>{c.label ?? c.source} · {(ranges[i].end - ranges[i].start).toFixed(1)} s</option>)}
          </select>
        </label>
        <ClipSourcePreview key={`${cardId}-${active}`} videoId={videoOf(clips[active])} {...ranges[active]} onMark={(edge, time) => set(active, edge, time)} />
      </>}
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
                    step={0.1}
                    min={0}
                    max={100000}
                    aria-label={`${t(key === 'start' ? 'edClipStart' : 'edClipEnd')} ${label}`}
                    className="w-28 rounded border px-2 py-0.5 font-normal"
                    value={ranges[i][key]}
                    onChange={(e) => set(i, key, e.target.valueAsNumber)}
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
      <fieldset className="grid gap-2 rounded-lg border p-3">
        <legend>Add video to an existing technique</legend>
        <label className="grid gap-1 text-sm">Technique without video
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="rounded border p-2">
            {eligible.map((c) => <option key={c.id} value={c.id}>{c.ko} · {c.meaning.en}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm">Video URL<input type="url" value={url} onChange={(e) => setUrl(e.target.value)} className="rounded border p-2" placeholder="https://www.youtube.com/watch?v=…" /></label>
        <p className="text-xs text-slate-500">HTTPS YouTube links only. The source must already be available locally for playback or frame extraction. No download is performed.</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {(['start', 'end'] as const).map((edge) => <label key={edge} className="grid gap-1 text-sm">New clip {edge}
            <input type="number" min={0} max={100000} step={0.1} value={Number.isNaN(newRange[edge]) ? '' : newRange[edge]} onChange={(e) => setNewRange({ ...newRange, [edge]: e.target.valueAsNumber })} className="rounded border p-2" />
          </label>)}
        </div>
        {newVideoId && <ClipSourcePreview key={newVideoId} videoId={newVideoId} {...newRange} onMark={(edge, time) => setNewRange((r) => ({ ...r, [edge]: time }))} />}
        <button type="button" className="w-fit rounded border px-3 py-2 disabled:opacity-50" disabled={busy || !selected || !newVideoId || !rangeValid(newRange)} onClick={add}>Add video</button>
      </fieldset>
      <fieldset className="grid gap-2 rounded-lg border border-dashed p-3">
        <legend>Source text translation</legend>
        <label className="grid gap-1 text-sm">Source language<select value={from} onChange={(e) => setFrom(e.target.value as Lang)} className="rounded border p-2">{(['en', 'de', 'es'] as const).map((l) => <option key={l}>{l}</option>)}</select></label>
        <label className="grid gap-1 text-sm">Source text<textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} maxLength={4000} className="rounded border p-2" /></label>
        {aiEnabled ? <button type="button" disabled={translating || !sourceText.trim()} className="w-fit rounded border px-3 py-2 disabled:opacity-50" onClick={suggest}>{translating ? 'Translating…' : 'Translate source text'}</button> : <p className="text-xs text-slate-500">AI assistance is unavailable unless a server-side model is configured.</p>}
        {Object.entries(suggestions).map(([lang, text]) => <label key={lang} className="grid gap-1 text-sm">Suggestion ({lang.toUpperCase()})<textarea value={text} onChange={(e) => setSuggestions((s) => ({ ...s, [lang]: e.target.value }))} className="rounded border p-2" /></label>)}
        {Object.keys(suggestions).length > 0 && <p role="status" className="text-xs text-slate-600">Review and copy suggestions into the card text fields before saving. Nothing is saved automatically.</p>}
      </fieldset>
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
