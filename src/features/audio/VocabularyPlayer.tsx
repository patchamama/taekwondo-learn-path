import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AUDIO_ITEMS, SECTION_BY_ID } from '../../data/audioManifest'
import { CARD_BY_ID } from '../../data/cards'
import { CLIPS_BY_CARD } from '../../data/clips'
import { BeltBadge } from '../../shared/components/BeltBadge'
import type { StringKey } from '../../shared/i18n/strings'
import { useT } from '../../shared/i18n/useT'
import { pickKoreanVoice, speechSupported } from '../../shared/lib/speech'
import { PLAYBACK_RATES, transportCopy } from './transportCopy'
import type { PlaybackRole, PlaybackStep } from './audioPlan'
import { loadDurations } from './durations'
import { framesFor } from './images'
import './VocabularyPlayer.css'
import {
  buildChapters,
  buildTimeline,
  chapterDurations,
  chapterKey,
  formatAudioTime as formatTime,
  stepAt,
} from './timeline'

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

const CHAPTER_COLOR: Record<string, string> = {
  words: '#bfdbfe', hand: '#fbcfe8', foot: '#bbf7d0', stance: '#fde68a',
  combo: '#ddd6fe', terms: '#fed7aa', forms: '#a5f3fc', descriptions: '#e2e8f0',
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
  const { t, loc, lang } = useT()
  const copy = transportCopy(lang)
  const [rate, setRate] = useState(1)
  const [seekSeconds, setSeekSeconds] = useState(5)
  const rateRef = useRef(1)
  const updateRate = useRef<() => void>(() => {})
  const [durations, setDurations] = useState<Record<string, number>>({})
  const [running, setRunning] = useState(false)
  const [playbackError, setPlaybackError] = useState(false)
  const [position, setPosition] = useState(0)
  const [said, setSaid] = useState<Said[]>([])
  const [currentId, setCurrentId] = useState<string | null>(null)
  const playerRef = useRef<HTMLAudioElement | null>(null)
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
  const sectionTimes = useMemo(
    () => chapterDurations(steps, timeline, (id) => SECTION_BY_ID[id]),
    [steps, timeline],
  )
  // Silence belongs to the preceding section; shuffled/reversed plans can revisit it.
  const segments = useMemo(() => {
    const result: { key: string; start: number; end: number }[] = []
    let key: string | undefined
    steps.forEach((step, index) => {
      if ('id' in step) key = chapterKey(step, (id) => SECTION_BY_ID[id])
      const start = timeline.starts[index]
      const end = timeline.starts[index + 1] ?? timeline.total
      if (!key || end <= start) return
      const last = result.at(-1)
      if (last?.key === key && last.end === start) last.end = end
      else result.push({ key, start, end })
    })
    return result
  }, [steps, timeline])
  const activeStep = steps
    .slice(0, stepAt(timeline, position) + 1)
    .reverse()
    .find((step) => 'id' in step)
  const activeChapter =
    currentId && activeStep && 'id' in activeStep
      ? chapterKey(activeStep, (id) => SECTION_BY_ID[id])
      : undefined
  const firstStepOf = useMemo(() => {
    const map = new Map<string, number>()
    steps.forEach((s, i) => {
      if ('id' in s && !map.has(s.id)) map.set(s.id, i)
    })
    return map
  }, [steps])

  // Adjust selection-owned state during render so no stale card or position is committed.
  // Identity matters: different selections can have exactly the same number of steps.
  const [selection, setSelection] = useState({ steps, base })
  if (selection.steps !== steps || selection.base !== base) {
    setSelection({ steps, base })
    setRunning(false)
    setPosition(0)
    setSaid([])
    setCurrentId(null)
  }

  // Cleanup intentionally reads the latest active run, not the refs' setup-time values.
  const disposePlayback = useCallback(() => {
    ++run.current
    cancel.current()
    clearTimeout(seekTimer.current)
    seekingUntil.current = 0
  }, [])
  useEffect(() => disposePlayback, [steps, base, disposePlayback])

  const itemIds = [...firstStepOf.keys()]
  const itemNumber = currentId ? itemIds.indexOf(currentId) + 1 : 0
  // lets the page hide everything else while the repetition plays
  useEffect(() => {
    onRunningChange?.(running)
    return () => onRunningChange?.(false)
  }, [running, onRunningChange])

  /** Plays from a position (seconds); a previous run is cancelled first, so jumping never overlaps voices. */
  const start = async (from: number) => {
    clearTimeout(seekTimer.current)
    seekingUntil.current = 0
    cancel.current()
    if (steps.length === 0) return
    from = Math.max(0, Math.min(timeline.total, from))
    if (from >= timeline.total) {
      ++run.current
      setRunning(false)
      setPosition(timeline.total)
      return
    }
    const mine = ++run.current
    // Reuse the media element started by the user gesture across asynchronous steps.
    const player = playerRef.current ?? (playerRef.current = new Audio())
    setPlaybackError(false)
    let failed = false
    let cancelled = false
    let release: () => void = () => {}
    let current: HTMLAudioElement | null = null
    let stepIndex = 0
    let lastAudioTime = 0
    let lastAudioAdvance = performance.now()
    let clockOffset = 0
    let clockAnchor = performance.now()
    let clockRate = rateRef.current
    const elapsed = () => clockOffset + ((performance.now() - clockAnchor) / 1000) * clockRate
    const ticker = setInterval(() => {
      if (cancelled || performance.now() < seekingUntil.current) return
      const at = current ? current.currentTime : elapsed()
      if (current) {
        if (at !== lastAudioTime) { lastAudioTime = at; lastAudioAdvance = performance.now() }
        else if (performance.now() - lastAudioAdvance >= 15000) {
          current.pause()
          release()
          return
        }
      }
      const end = timeline.starts[stepIndex + 1] ?? timeline.total
      setPosition(Math.min(end, timeline.starts[stepIndex] + at))
    }, 200)
    cancel.current = () => {
      if (cancelled) return
      cancelled = true
      current?.pause()
      release()
      updateRate.current = () => {}
      clearInterval(ticker)
    }
    // Transport changes must not erase cards already revealed in this review.
    setRunning(true)
    let i = stepAt(timeline, from)
    let offset = Math.max(0, from - timeline.starts[i])
    for (; i < steps.length; i++) {
      if (cancelled || run.current !== mine) break
      stepIndex = i
      current = null
      clockOffset = offset
      clockAnchor = performance.now()
      clockRate = rateRef.current
      const rebaseClock = () => {
        clockOffset = elapsed()
        clockAnchor = performance.now()
        clockRate = rateRef.current
      }
      setPosition(timeline.starts[i] + offset)
      const step = steps[i]
      if ('silence' in step) {
        await new Promise<void>((resolve) => {
          let timer: ReturnType<typeof setTimeout>
          const schedule = () => {
            clearTimeout(timer)
            timer = setTimeout(
              resolve,
              (Math.max(0, step.silence - elapsed()) * 1000) / rateRef.current,
            )
          }
          updateRate.current = () => {
            rebaseClock()
            schedule()
          }
          schedule()
          release = () => {
            clearTimeout(timer)
            resolve()
          }
        })
        offset = 0
        continue
      }
      setCurrentId(step.id)
      // A description is explanatory rather than a question: keep its complete card visible,
      // including when the listener seeks directly into the description chapter.
      if (step.role === 'info') {
        setSaid((prev) => [
          ...prev.filter((s) => s.id !== step.id),
          { id: step.id, parts: { ko: true, meaning: true, info: true } },
        ])
      }
      const ok = await new Promise<boolean>((resolve) => {
        const audio = player
        audio.src = base + step.file
        current = audio
        lastAudioTime = offset
        lastAudioAdvance = performance.now()
        let settled = false
        let speaking = false
        let utterance: SpeechSynthesisUtterance | null = null
        const finish = (ok: boolean) => {
          if (settled) return
          settled = true
          audio.onended = null
          audio.onerror = null
          updateRate.current = () => {}
          resolve(ok)
        }
        release = () => {
          if (settled) return
          if (utterance) {
            utterance.onend = null
            utterance.onerror = null
            window.speechSynthesis.cancel()
          }
          finish(false)
        }
        const fallback = () => {
          if (cancelled || settled || speaking) return
          audio.pause()
          current = null
          const item = ITEM_BY_ID.get(step.id)
          const text =
            item &&
            (step.role === 'ko'
              ? item.hangul
              : step.role === 'ja'
                ? item.ja
                : step.role === 'info'
                  ? item.info && loc(item.info)
                  : loc(item.meaning))
          if (!text || !speechSupported()) {
            finish(false)
            return
          }
          speaking = true
          const synth = window.speechSynthesis
          const speak = () => {
            if (utterance) {
              utterance.onend = null
              utterance.onerror = null
              synth.cancel()
            }
            utterance = new SpeechSynthesisUtterance(text)
            utterance.lang = step.role === 'ko' ? 'ko-KR' : step.role === 'ja' ? 'ja-JP' : lang
            const voice =
              step.role === 'ko'
                ? pickKoreanVoice(synth.getVoices())
                : synth.getVoices().find((v) => v.lang.startsWith(utterance!.lang))
            if (voice) utterance.voice = voice
            utterance.rate = rateRef.current
            utterance.onend = () => finish(true)
            utterance.onerror = () => finish(false)
            synth.speak(utterance)
          }
          updateRate.current = () => {
            rebaseClock()
            speak()
          }
          speak()
        }
        updateRate.current = () => {
          audio.playbackRate = rateRef.current
        }
        audio.playbackRate = rateRef.current
        audio.onended = () => finish(true)
        audio.onerror = fallback
        audio.currentTime = offset
        void audio.play()?.catch((error: unknown) => {
          // A permission failure is not a missing recording: never bypass autoplay policy.
          if ((error as { name?: string })?.name === 'NotAllowedError') finish(false)
          else fallback()
        })
      })
      offset = 0
      if (cancelled || run.current !== mine) break
      if (!ok) {
        failed = true
        setPlaybackError(true)
        setPosition(timeline.starts[i])
        break
      }
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
      if (!cancelled && !failed) setPosition(timeline.total)
    }
  }

  const stop = () => {
    clearTimeout(seekTimer.current)
    seekingUntil.current = 0
    ++run.current
    cancel.current()
    setRunning(false)
  }

  /** Jump right away and keep playing (chapters, repeat buttons). */
  const jumpToStep = (index: number) => {
    seekingUntil.current = 0
    void start(timeline.starts[index] ?? 0)
  }

  /** The progress bar: moves the marker at once, and restarts playback once the bar stops moving. */
  const seek = (value: number, immediate = false) => {
    value = Math.max(0, Math.min(timeline.total, value))
    setPosition(value)
    const preceding = steps
      .slice(0, stepAt(timeline, value) + 1)
      .reverse()
      .find((s) => 'id' in s)
    setCurrentId(preceding && 'id' in preceding ? preceding.id : null)
    seekingUntil.current = performance.now() + 600
    clearTimeout(seekTimer.current)
    if (running) {
      if (immediate) void start(value)
      else seekTimer.current = setTimeout(() => void start(value), 200)
    }
  }

  const play = () => void start(position >= timeline.total ? 0 : position)
  const changeRate = (value: number) => {
    if (!PLAYBACK_RATES.includes(value)) return
    rateRef.current = value
    setRate(value)
    updateRate.current()
  }
  const navigateItem = (direction: number) => {
    const at = Math.max(0, itemIds.indexOf(currentId ?? ''))
    const id = itemIds[Math.max(0, Math.min(itemIds.length - 1, at + direction))]
    if (id) jumpToStep(firstStepOf.get(id)!)
  }
  const repeatPart = (id: string, role: PlaybackRole) => {
    const index = steps.findIndex((step) => 'id' in step && step.id === id && step.role === role)
    if (index >= 0) jumpToStep(index)
  }
  const iconButton = (label: string, icon: string, action: () => void, disabled: boolean) => (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={action}
      disabled={disabled}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg border px-2 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-40"
    >
      <span aria-hidden="true">{icon}</span>
    </button>
  )

  return (
    <div className="grid gap-3">
      {playbackError && <p role="alert" className="text-sm text-red-700">{({
        en: 'Audio could not play. Press Play to try again.',
        de: 'Audio konnte nicht abgespielt werden. Drücke auf Abspielen, um es erneut zu versuchen.',
        es: 'No se pudo reproducir el audio. Pulsa Reproducir para intentarlo de nuevo.',
      })[lang]}</p>}
      <label className="flex w-full items-center gap-2 text-xs text-slate-600">
        <span className="tabular-nums">{formatTime(position)}</span>
        <span className="audio-seek min-w-0 flex-1">
          <span className="audio-seek-track" aria-hidden="true">
            {segments.map((segment, i) => (
              <span key={`${segment.key}-${i}`} data-audio-segment={segment.key} style={{
                left: `${segment.start / timeline.total * 100}%`,
                width: `${(segment.end - segment.start) / timeline.total * 100}%`,
                backgroundColor: CHAPTER_COLOR[segment.key] ?? '#e2e8f0',
              }} />
            ))}
          </span>
        <input
          type="range"
          aria-label={t('audioSeek')}
          className="audio-seek-input"
          min={0}
          max={timeline.total || 1}
          step={0.1}
          value={Math.min(position, timeline.total)}
          onChange={(e) => seek(Number(e.target.value))}
          disabled={steps.length === 0}
        />
        </span>
        <span className="tabular-nums">{formatTime(timeline.total)}</span>
      </label>
      <div
        role="group"
        aria-label={copy.controls}
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {iconButton(
          copy.previous,
          '⏮',
          () => navigateItem(-1),
          itemIds.length === 0 || itemNumber <= 1,
        )}
        {iconButton(t('audioPlay'), '▶', play, steps.length === 0 || running)}
        {iconButton(t('audioStop'), '⏹', stop, !running)}
        {iconButton(
          copy.next,
          '⏭',
          () => navigateItem(1),
          itemIds.length === 0 || itemNumber >= itemIds.length,
        )}
        {iconButton(
          `${copy.back} ${seekSeconds} s`,
          '↶',
          () => seek(position - seekSeconds, true),
          steps.length === 0 || position <= 0,
        )}
        <select
          aria-label={copy.seekSeconds}
          title={copy.seekSeconds}
          value={seekSeconds}
          disabled={steps.length === 0}
          onChange={(e) => setSeekSeconds(Number(e.target.value))}
          className="min-h-11 rounded-lg border bg-white px-2"
        >
          {[2, 5, 10, 15].map((seconds) => (
            <option key={seconds} value={seconds}>
              {seconds} s
            </option>
          ))}
        </select>
        {iconButton(
          `${copy.forward} ${seekSeconds} s`,
          '↷',
          () => seek(position + seekSeconds, true),
          steps.length === 0 || position >= timeline.total,
        )}
        <select
          aria-label={copy.speed}
          title={copy.speed}
          value={rate}
          disabled={steps.length === 0}
          onChange={(e) => changeRate(Number(e.target.value))}
          className="min-h-11 rounded-lg border bg-white px-2"
        >
          {PLAYBACK_RATES.map((value) => (
            <option key={value} value={value}>
              {value}×
            </option>
          ))}
        </select>
        <span aria-label="audio-position" className="text-xs tabular-nums text-slate-600">
          {itemNumber}/{itemIds.length}
        </span>
      </div>

      {chapters.length > 0 && (
        <nav aria-label={t('audioChapters')} className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">{t('audioChapters')}:</span>
          {chapters.map((c) => (
            <button
              key={c.key}
              type="button"
              data-audio-chapter={c.key}
              aria-current={activeChapter === c.key ? 'true' : undefined}
              style={{ backgroundColor: CHAPTER_COLOR[c.key] ?? '#e2e8f0' }}
              className={`rounded-full border px-3 py-0.5 text-xs text-slate-900 ${activeChapter === c.key ? 'border-slate-900 font-semibold ring-2 ring-slate-700' : 'border-slate-400 hover:brightness-95'}`}
              onClick={() => jumpToStep(c.stepIndex)}
            >
              {t(CHAPTER_LABEL[c.key])} ({formatTime(sectionTimes[c.key] ?? 0)})
            </button>
          ))}
        </nav>
      )}

      {currentId && <StepImage key={currentId} id={currentId} />}

      <ol aria-live="polite" aria-label={t('audioTranscript')} className="grid gap-2">
        {[...said].reverse().map((s) => {
          const item = ITEM_BY_ID.get(s.id)
          const card = CARD_BY_ID[s.id]
          if (!item || !card) return null
          return (
            <li key={s.id} className="grid gap-2 rounded-lg border bg-slate-50 p-3">
              <div className="flex flex-wrap items-center justify-end gap-2 text-xs text-slate-600">
                <span>{t(CHAPTER_LABEL[item.section])}</span>
                {framesFor(s.id).length > 0 && (
                  <span role="img" aria-label={copy.clip} title={copy.clip}>
                    🎞
                  </span>
                )}
                {(CLIPS_BY_CARD[s.id]?.length ?? 0) > 0 && (
                  <span role="img" aria-label={copy.video} title={copy.video}>
                    ▶
                  </span>
                )}
                <BeltBadge cardId={s.id} />
              </div>
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  {s.parts.ko && (
                    <button
                      type="button"
                      className="block text-left text-lg font-bold hover:underline"
                      onClick={() => repeatPart(s.id, 'ko')}
                    >
                      <span lang="ko">{item.hangul}</span>{' '}
                      <span className="text-sm font-normal text-slate-500">{card.ko}</span>
                    </button>
                  )}
                  {s.parts.meaning && (
                    <button
                      type="button"
                      className="block text-left hover:underline"
                      onClick={() => repeatPart(s.id, 'meaning')}
                    >
                      {loc(item.meaning)}
                    </button>
                  )}
                  {s.parts.ja && (
                    <button
                      type="button"
                      className="block text-left text-sm text-slate-600 hover:underline"
                      onClick={() => repeatPart(s.id, 'ja')}
                    >
                      <span lang="ja">{item.ja}</span>
                      {item.jaRomaji ? ` (${item.jaRomaji})` : ''}
                    </button>
                  )}
                  {s.parts.info && item.info && (
                    <button
                      type="button"
                      className="mt-1 block text-left text-sm text-slate-700 hover:underline"
                      onClick={() => repeatPart(s.id, 'info')}
                    >
                      {loc(item.info)}
                    </button>
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
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
