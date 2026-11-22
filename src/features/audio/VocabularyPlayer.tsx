import { useEffect, useMemo, useRef, useState } from 'react'
import { AUDIO_ITEMS } from '../../data/audioManifest'
import { CARD_BY_ID } from '../../data/cards'
import type { StringKey } from '../../shared/i18n/strings'
import { useT } from '../../shared/i18n/useT'
import type { PlaybackRole, PlaybackStep } from './audioPlan'
import { loadDurations } from './durations'
import { framesFor } from './images'
import { buildChapters, buildTimeline, formatTime, stepAt } from './timeline'

const ITEM_BY_ID = new Map(AUDIO_ITEMS.map((i) => [i.id, i]))

const CHAPTER_LABEL: Record<string, StringKey> = {
  words: 'studyWords',
  hand: 'catHand',
  foot: 'catFoot',
  stance: 'catStance',
  combo: 'catCombo',
  terms: 'studyTerms',
  forms: 'navForms',
  descriptions: 'audioDescriptionsChapter',
}

type Said = { id: string; parts: Partial<Record<PlaybackRole, true>> }

/** Still of the technique being said; cycles through its frames while the word plays. */
function StepImage({ id }: { id: string }) {
  const frames = useMemo(() => framesFor(id), [id])
  const [n, setN] = useState(0)
  const [broken, setBroken] = useState(false)
  useEffect(() => {
    if (frames.length < 2) return
    const timer = setInterval(() => setN((v) => (v + 1) % frames.length), 700)
    return () => clearInterval(timer)
  }, [frames])
  if (frames.length === 0 || broken) return null
  return (
    <figure className="overflow-hidden rounded-xl bg-black">
      <img
        src={frames[n]}
        alt={CARD_BY_ID[id]?.ko ?? id}
        onError={() => setBroken(true)}
        className="mx-auto aspect-video max-h-56 w-full object-contain"
      />
    </figure>
  )
}

/**
 * Plays the plan clip by clip and writes each word only after it has been said, so you can see how it is spelled.
 * Playing clip by clip (instead of the joined file) keeps the text exactly in step with the voice, and lets the
 * progress bar, the chapters and the repeat buttons jump to any step.
 */
export function VocabularyPlayer({
  steps,
  base,
  onRunningChange,
}: {
  steps: PlaybackStep[]
  base: string
  onRunningChange?: (running: boolean) => void
}) {
  const { t, loc } = useT()
  const [durations, setDurations] = useState<Record<string, number>>({})
  const [running, setRunning] = useState(false)
  const [position, setPosition] = useState(0)
  const [said, setSaid] = useState<Said[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const cancel = useRef<() => void>(() => {})
  const run = useRef(0)
  const seekTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const seekingUntil = useRef(0)

  useEffect(() => {
    let alive = true
    loadDurations(base).then((d) => alive && setDurations(d))
    return () => {
      alive = false
    }
  }, [base])

  const timeline = useMemo(() => buildTimeline(steps, durations), [steps, durations])
  const chapters = useMemo(() => buildChapters(steps, (id) => ITEM_BY_ID.get(id)?.section), [steps])
  const firstStepOf = useMemo(() => {
    const map = new Map<string, number>()
    steps.forEach((s, i) => {
      if ('id' in s && !map.has(s.id)) map.set(s.id, i)
    })
    return map
  }, [steps])

  // leaving the card (or changing the selection) must silence the voice
  useEffect(
    () => () => {
      cancel.current()
      clearTimeout(seekTimer.current)
    },
    [],
  )
  // lets the page hide everything else while the repetition plays
  useEffect(() => {
    onRunningChange?.(running)
    return () => onRunningChange?.(false)
  }, [running, onRunningChange])

  /** Plays from a position (seconds); a previous run is cancelled first, so jumping never overlaps voices. */
  const start = async (from: number) => {
    cancel.current()
    const mine = ++run.current
    let cancelled = false
    let release: () => void = () => {}
    let current: HTMLAudioElement | null = null
    let stepIndex = 0
    let stepStartedAt = performance.now()
    const ticker = setInterval(() => {
      if (cancelled || performance.now() < seekingUntil.current) return
      const elapsed = current ? current.currentTime : (performance.now() - stepStartedAt) / 1000
      setPosition(Math.min(timeline.total, timeline.starts[stepIndex] + elapsed))
    }, 200)
    cancel.current = () => {
      cancelled = true
      current?.pause()
      release()
      clearInterval(ticker)
    }
    setSaid([])
    setRunning(true)
    let i = stepAt(timeline, from)
    let offset = Math.max(0, from - timeline.starts[i])
    for (; i < steps.length; i++) {
      if (cancelled || run.current !== mine) break
      stepIndex = i
      stepStartedAt = performance.now() - offset * 1000
      setPosition(timeline.starts[i] + offset)
      const step = steps[i]
      if ('silence' in step) {
        await new Promise<void>((resolve) => {
          const timer = setTimeout(resolve, Math.max(0, step.silence - offset) * 1000)
          release = () => {
            clearTimeout(timer)
            resolve()
          }
        })
        offset = 0
        continue
      }
      setCurrentId(step.id)
      const ok = await new Promise<boolean>((resolve) => {
        const audio = new Audio(base + step.file)
        current = audio
        release = () => resolve(false)
        audio.onended = () => resolve(true)
        audio.onerror = () => resolve(false)
        if (offset > 0) audio.currentTime = offset
        void audio.play()?.catch(() => resolve(false))
      })
      offset = 0
      if (cancelled || run.current !== mine) break
      if (ok) {
        setSaid((prev) => {
          const at = prev.findIndex((s) => s.id === step.id)
          if (at === -1) return [...prev, { id: step.id, parts: { [step.role]: true } }]
          const next = [...prev]
          // the reverse pass starts again from the meaning, so the Korean word is hidden until it is said
          const kept = step.pass === 'reverse' && step.role === 'meaning' ? {} : next[at].parts
          next[at] = { ...next[at], parts: { ...kept, [step.role]: true } }
          return next
        })
      }
    }
    clearInterval(ticker)
    if (run.current === mine) {
      setRunning(false)
      if (!cancelled) setPosition(0)
    }
  }

  const stop = () => cancel.current()

  /** Jump right away and keep playing (chapters, repeat buttons). */
  const jumpToStep = (index: number) => {
    seekingUntil.current = 0
    void start(timeline.starts[index] ?? 0)
  }

  /** The progress bar: moves the marker at once, and restarts playback once the bar stops moving. */
  const seek = (value: number) => {
    setPosition(value)
    seekingUntil.current = performance.now() + 600
    clearTimeout(seekTimer.current)
    if (running) seekTimer.current = setTimeout(() => void start(value), 200)
  }

  const play = () => void start(position >= timeline.total - 0.5 ? 0 : position)

  return (
    <div className="grid gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="w-fit rounded-lg border px-4 py-2"
          onClick={() => (running ? stop() : play())}
          disabled={steps.length === 0}
        >
          {running ? `⏹ ${t('audioStop')}` : `▶ ${t('audioPlay')}`}
        </button>
        <label className="flex min-w-48 flex-1 items-center gap-2 text-xs text-slate-600">
          <span className="tabular-nums">{formatTime(position)}</span>
          <input
            type="range"
            aria-label={t('audioSeek')}
            className="w-full"
            min={0}
            max={Math.max(1, Math.round(timeline.total))}
            step={1}
            value={Math.min(Math.round(position), Math.round(timeline.total))}
            onChange={(e) => seek(Number(e.target.value))}
            disabled={steps.length === 0}
          />
          <span className="tabular-nums">{formatTime(timeline.total)}</span>
        </label>
      </div>

      {chapters.length > 1 && (
        <nav aria-label={t('audioChapters')} className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">{t('audioChapters')}:</span>
          {chapters.map((c) => (
            <button
              key={c.key}
              type="button"
              className="rounded-full border bg-white px-3 py-0.5 text-xs hover:bg-slate-100"
              onClick={() => jumpToStep(c.stepIndex)}
            >
              {t(CHAPTER_LABEL[c.key])}
            </button>
          ))}
        </nav>
      )}

      {currentId && running && <StepImage key={currentId} id={currentId} />}

      <ol aria-live="polite" aria-label={t('audioTranscript')} className="grid gap-2">
        {[...said].reverse().map((s) => {
          const item = ITEM_BY_ID.get(s.id)
          const card = CARD_BY_ID[s.id]
          if (!item || !card) return null
          return (
            <li key={s.id} className="flex items-start gap-2 rounded-lg border bg-slate-50 p-3">
              <div className="min-w-0 flex-1">
                {s.parts.ko && (
                  <p className="text-lg font-bold">
                    <span lang="ko">{item.hangul}</span>{' '}
                    <span className="text-sm font-normal text-slate-500">{card.ko}</span>
                  </p>
                )}
                {s.parts.meaning && <p>{loc(item.meaning)}</p>}
                {s.parts.ja && (
                  <p className="text-sm text-slate-600">
                    <span lang="ja">{item.ja}</span>
                    {item.jaRomaji ? ` (${item.jaRomaji})` : ''}
                  </p>
                )}
                {s.parts.info && item.info && (
                  <p className="mt-1 text-sm text-slate-700">{loc(item.info)}</p>
                )}
              </div>
              <button
                type="button"
                className="shrink-0 rounded-full border px-2 text-sm hover:bg-white"
                aria-label={`${t('audioRepeatWord')}: ${card.ko}`}
                onClick={() => jumpToStep(firstStepOf.get(s.id) ?? 0)}
              >
                ↺
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
