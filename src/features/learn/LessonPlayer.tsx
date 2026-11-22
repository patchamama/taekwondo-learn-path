import { useEffect, useMemo, useRef, useState } from 'react'
import { CARD_BY_ID } from '../../data/cards'
import { MORPHEME_BY_ID } from '../../data/morphemes'
import { THEORY_BY_ID } from '../../data/theory'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { useT } from '../../shared/i18n/useT'
import { speakKorean } from '../../shared/lib/speech'
import { Bubble } from '../mascot/Bubble'
import { COMFORT, PRAISE, pick } from '../mascot/lines'
import { CLIPS } from '../../data/clips'
import { FrameStrip } from '../videos/FrameStrip'
import { isCorrect, type Exercise } from './exercises'

export interface PlayerResult {
  correct: number
  total: number
  answers: { cardId?: string; correct: boolean }[]
}

interface Props {
  exercises: Exercise[]
  beltColor: string
  onFinish: (r: PlayerResult) => void
  onExit: () => void
}

type Phase = 'answering' | 'right' | 'wrong'

export function LessonPlayer({ exercises, beltColor, onFinish, onExit }: Props) {
  const { t, loc } = useT()
  const [queue, setQueue] = useState<Exercise[]>(exercises)
  const [pos, setPos] = useState(0)
  const [phase, setPhase] = useState<Phase>('answering')
  const [choice, setChoice] = useState<string | number | null>(null)
  const [chips, setChips] = useState<string[]>([])
  const [firstTry, setFirstTry] = useState<Record<number, boolean>>({})
  const [lastMsg, setLastMsg] = useState(0)
  const [skipped, setSkipped] = useState(0)
  const log = useRef<PlayerResult['answers']>([])
  const retried = useRef(new Set<Exercise>())

  const ex = queue[pos]
  const total = Math.max(1, exercises.length - skipped)
  const correctCount = Object.values(firstTry).filter(Boolean).length

  // play audio automatically for listening exercises
  useEffect(() => {
    if (ex?.type === 'listen') speakKorean(CARD_BY_ID[ex.cardId].hangul)
  }, [ex])

  const options = useMemo(() => {
    if (!ex) return []
    if (ex.type === 'theory')
      return ex.order.map((i) => ({
        key: i,
        label:
          i === 0
            ? loc(THEORY_BY_ID[ex.theoryId].correct)
            : loc(THEORY_BY_ID[ex.theoryId].wrong[i - 1]),
      }))
    if (ex.type === 'meaning')
      return ex.options.map((id) => ({ key: id, label: loc(CARD_BY_ID[id].meaning) }))
    if (ex.type === 'frames')
      return ex.options.map((id) => ({
        key: id,
        label: `${CARD_BY_ID[id].ko} · ${loc(CARD_BY_ID[id].meaning)}`,
      }))
    if (ex.type === 'recall' || ex.type === 'listen')
      return ex.options.map((id) => ({
        key: id,
        label:
          ex.type === 'listen'
            ? CARD_BY_ID[id].ko
            : `${CARD_BY_ID[id].ko} · ${CARD_BY_ID[id].hangul}`,
      }))
    return []
  }, [ex, loc])

  if (!ex) return null

  const cardOf = 'cardId' in ex ? CARD_BY_ID[ex.cardId] : undefined
  const answer = ex.type === 'build' ? chips : choice
  const canCheck =
    phase === 'answering' && (ex.type === 'build' ? chips.length > 0 : choice !== null)

  const check = () => {
    if (!canCheck) return
    const ok = isCorrect(ex, answer as string | string[] | number)
    log.current.push({ cardId: cardOf?.id, correct: ok })
    if (!retried.current.has(ex)) setFirstTry((f) => ({ ...f, [pos]: ok }))
    if (!ok && !retried.current.has(ex)) {
      retried.current.add(ex)
      setQueue((q) => [...q, ex])
    }
    setPhase(ok ? 'right' : 'wrong')
    setLastMsg((n) => n + 1)
  }

  const next = () => {
    if (pos + 1 >= queue.length) {
      const allAnswers = log.current
      onFinish({ correct: correctCount, total, answers: allAnswers })
      return
    }
    setPos(pos + 1)
    setPhase('answering')
    setChoice(null)
    setChips([])
  }

  // listening exercises can be skipped (no headphones): they count neither as right nor as wrong
  const skip = () => {
    setSkipped((n) => n + 1)
    if (pos + 1 >= queue.length) {
      onFinish({
        correct: correctCount,
        total: Math.max(1, exercises.length - skipped - 1),
        answers: log.current,
      })
      return
    }
    setPos(pos + 1)
    setPhase('answering')
    setChoice(null)
    setChips([])
  }

  const frameClip =
    ex.type === 'frames' ? CLIPS.find((c) => c.cardId === ex.cardId && c.silentSafe) : undefined

  const progress = Math.min(100, Math.round((pos / queue.length) * 100))
  const correctText =
    ex.type === 'build'
      ? (cardOf?.parts ?? []).map((p) => MORPHEME_BY_ID[p].ko).join(' + ')
      : ex.type === 'theory'
        ? loc(THEORY_BY_ID[ex.theoryId].correct)
        : ex.type === 'meaning'
          ? loc(cardOf!.meaning)
          : `${cardOf!.ko} · ${cardOf!.hangul}`

  const prompt =
    ex.type === 'meaning'
      ? t('qMeaning')
      : ex.type === 'recall'
        ? t('qRecall')
        : ex.type === 'listen'
          ? t('qListen')
          : ex.type === 'frames'
            ? t('qFrames')
            : ex.type === 'build'
              ? t('qBuild')
              : t('qTheory')

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-xl flex-col gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onExit}
          className="text-sm text-slate-500 underline"
          aria-label={t('exit')}
        >
          ✕ {t('exit')}
        </button>
        <div
          className="h-3 flex-1 overflow-hidden rounded-full bg-slate-200"
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <h2 className="text-lg font-bold">{prompt}</h2>

      <div className="rounded-2xl border bg-white p-5 shadow-sm">
        {ex.type === 'theory' && (
          <>
            <p className="text-lg font-medium">{loc(THEORY_BY_ID[ex.theoryId].question)}</p>
          </>
        )}
        {ex.type === 'meaning' && (
          <div className="flex items-center gap-3">
            <div>
              <p className="text-2xl font-bold">{cardOf!.ko}</p>
              <p lang="ko" className="text-slate-500">
                {cardOf!.hangul}
              </p>
            </div>
            <SpeakButton text={cardOf!.hangul} />
            <SpeakButton text={cardOf!.hangul} slow />
          </div>
        )}
        {ex.type === 'frames' && frameClip && <FrameStrip clip={frameClip} />}
        {ex.type === 'recall' && <p className="text-2xl font-bold">{loc(cardOf!.meaning)}</p>}
        {ex.type === 'listen' && (
          <div className="flex items-center gap-3">
            <SpeakButton text={cardOf!.hangul} className="!h-14 !w-14 !text-2xl" />
            <SpeakButton text={cardOf!.hangul} slow />
            {phase === 'answering' && (
              <button type="button" onClick={skip} className="ml-auto text-sm underline">
                {t('cannotListen')}
              </button>
            )}
          </div>
        )}
        {ex.type === 'build' && <p className="text-2xl font-bold">{loc(cardOf!.meaning)}</p>}
      </div>

      {ex.type === 'build' ? (
        <div className="grid gap-3">
          <p className="text-sm text-slate-500">{t('tapWords')}</p>
          <div
            className="flex min-h-12 flex-wrap items-center gap-2 rounded-xl border-2 border-dashed p-2"
            data-testid="build-answer"
          >
            {chips.map((c, i) => (
              <button
                key={`${c}-${i}`}
                disabled={phase !== 'answering'}
                onClick={() => setChips(chips.filter((_, j) => j !== i))}
                className="rounded-lg border-2 bg-sky-50 px-3 py-1 font-semibold"
              >
                {MORPHEME_BY_ID[c].ko}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {ex.chips.map((c, i) => {
              const used =
                chips.filter((x) => x === c).length >
                ex.chips.slice(0, i).filter((x) => x === c).length
              return (
                <button
                  key={`${c}-${i}`}
                  disabled={used || phase !== 'answering'}
                  onClick={() => setChips([...chips, c])}
                  className="rounded-lg border-2 bg-white px-3 py-1 font-semibold disabled:opacity-30"
                >
                  {MORPHEME_BY_ID[c].ko}
                  <span className="ml-1 text-xs font-normal text-slate-500">
                    {loc(MORPHEME_BY_ID[c].meaning)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <ul className="grid gap-2">
          {options.map((o) => {
            const selected = choice === o.key
            const right = phase !== 'answering' && isCorrect(ex, o.key)
            const wrong = phase === 'wrong' && selected && !right
            return (
              <li key={String(o.key)}>
                <button
                  disabled={phase !== 'answering'}
                  aria-pressed={selected}
                  onClick={() => setChoice(o.key)}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-left font-medium ${right ? 'border-emerald-500 bg-emerald-50' : wrong ? 'border-rose-500 bg-rose-50' : selected ? 'border-sky-500 bg-sky-50' : 'bg-white hover:bg-slate-50'}`}
                >
                  {o.label}
                </button>
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-auto grid gap-3">
        {phase !== 'answering' && (
          <Bubble
            mood={phase === 'right' ? 'cheer' : 'oops'}
            beltColor={beltColor}
            tone={phase === 'right' ? 'good' : 'bad'}
          >
            <p className="font-semibold">
              {loc(phase === 'right' ? pick(PRAISE, lastMsg) : pick(COMFORT, lastMsg))}
            </p>
            {phase === 'wrong' && (
              <p className="mt-1">
                {t('correctAnswer')}: <b>{correctText}</b>
              </p>
            )}
            {cardOf && <SpeakButton text={cardOf.hangul} className="mt-1" />}
          </Bubble>
        )}
        {phase === 'answering' ? (
          <button
            onClick={check}
            disabled={!canCheck}
            className="rounded-xl bg-emerald-500 py-3 font-bold text-white disabled:bg-slate-300"
          >
            {t('check')}
          </button>
        ) : (
          <button
            autoFocus
            onClick={next}
            className={`rounded-xl py-3 font-bold text-white ${phase === 'right' ? 'bg-emerald-500' : 'bg-rose-500'}`}
          >
            {t('continue')}
          </button>
        )}
      </div>
    </div>
  )
}
