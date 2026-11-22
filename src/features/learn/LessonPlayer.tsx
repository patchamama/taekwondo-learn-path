import { japanesePart } from '../../data/japanese'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CARD_BY_ID } from '../../data/cards'
import { MORPHEME_BY_ID } from '../../data/morphemes'
import { THEORY_BY_ID } from '../../data/theory'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { useT } from '../../shared/i18n/useT'
import { speakKorean } from '../../shared/lib/speech'
import { COMFORT, PRAISE, pick } from '../mascot/lines'
import { CLIPS, CLIPS_BY_CARD } from '../../data/clips'
import { FrameStrip } from '../videos/FrameStrip'
import { ClipPlayer } from '../videos/ClipPlayer'
import { ClipTile } from '../videos/ClipTile'
import { MaximizeOverlay } from '../../shared/components/Maximize'
import { useAppStore } from '../../shared/store/useAppStore'
import { isCorrect, type Exercise } from './exercises'
import { QuizLog, type LogEntry } from './QuizLog'
import { QuizReview } from './QuizReview'
import { QuizProgress, type SegmentState } from './QuizProgress'
import { ResultModal } from './ResultModal'

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
  const autoCheck = useAppStore((s) => s.quizAutoCheck)
  const resultMode = useAppStore((s) => s.quizResultMode)
  const autoContinue = useAppStore((s) => s.quizAutoContinue)
  const hangulOnly = useAppStore((s) => s.hangulOnly)
  const clipLayout = useAppStore((s) => s.clipLayout)
  const [clipModal, setClipModal] = useState<string | null>(null)
  const [resultOpen, setResultOpen] = useState(false)
  const [outcomes, setOutcomes] = useState<Record<number, boolean>>({})
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [review, setReview] = useState<LogEntry | null>(null)
  const log = useRef<PlayerResult['answers']>([])
  const retried = useRef(new Set<Exercise>())

  const ex = queue[pos]
  const total = Math.max(1, exercises.length - skipped)
  const correctCount = Object.values(firstTry).filter(Boolean).length

  // play audio automatically for listening exercises
  useEffect(() => {
    if (ex?.type === 'listen' || ex?.type === 'listenmeaning')
      speakKorean(CARD_BY_ID[ex.cardId].hangul)
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
    if (ex.type === 'meaning' || ex.type === 'listenmeaning')
      return ex.options.map((id) => ({ key: id, label: loc(CARD_BY_ID[id].meaning) }))
    if (ex.type === 'frames' || ex.type === 'video')
      return ex.options.map((id) => ({
        key: id,
        label: `${hangulOnly ? CARD_BY_ID[id].hangul : CARD_BY_ID[id].ko} · ${loc(CARD_BY_ID[id].meaning)}`,
      }))
    if (ex.type === 'pickclip')
      return ex.options.map((id) => ({
        key: id,
        label: hangulOnly ? CARD_BY_ID[id].hangul : CARD_BY_ID[id].ko,
      }))
    if (ex.type === 'recall' || ex.type === 'listen')
      return ex.options.map((id) => ({
        key: id,
        label: hangulOnly
          ? CARD_BY_ID[id].hangul
          : ex.type === 'listen'
            ? CARD_BY_ID[id].ko
            : `${CARD_BY_ID[id].ko} · ${CARD_BY_ID[id].hangul}`,
      }))
    return []
  }, [ex, loc, hangulOnly])

  if (!ex) return null

  const cardOf = 'cardId' in ex ? CARD_BY_ID[ex.cardId] : undefined
  const answer = ex.type === 'build' ? chips : choice
  const canCheck =
    phase === 'answering' && (ex.type === 'build' ? chips.length > 0 : choice !== null)

  const check = (given: string | string[] | number | null = answer) => {
    if (phase !== 'answering' || given === null || (Array.isArray(given) && given.length === 0))
      return
    const ok = isCorrect(ex, given)
    log.current.push({ cardId: cardOf?.id, correct: ok })
    setOutcomes((o) => (pos in o ? o : { ...o, [pos]: ok }))
    const givenLabel =
      ex.type === 'build'
        ? (given as string[]).map((c) => MORPHEME_BY_ID[c].ko).join(' + ')
        : (options.find((o) => o.key === given)?.label ?? String(given))
    const optionRows =
      ex.type === 'build'
        ? undefined
        : options.map((o) => ({
            label: String(o.label),
            correct: isCorrect(ex, o.key),
            given: o.key === given,
          }))
    const subject =
      ex.type === 'meaning'
        ? `${cardOf!.ko} · ${cardOf!.hangul}`
        : ex.type === 'recall' || ex.type === 'build'
          ? loc(cardOf!.meaning)
          : ex.type === 'listen' || ex.type === 'listenmeaning'
            ? '🔊'
            : ex.type === 'theory'
              ? loc(THEORY_BY_ID[ex.theoryId].question)
              : undefined
    setEntries((list) => [
      ...list,
      {
        n: list.length + 1,
        prompt,
        given: givenLabel,
        ok,
        correctText,
        cardId: cardOf?.id,
        segment: pos,
        subject,
        options: optionRows,
      },
    ])
    setResultOpen(true)
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
    setResultOpen(false)
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
    setResultOpen(false)
  }

  const frameClip =
    ex.type === 'frames' ? CLIPS.find((c) => c.cardId === ex.cardId && c.silentSafe) : undefined
  const videoClip =
    ex.type === 'video' ? CLIPS.find((c) => c.cardId === ex.cardId && c.silentSafe) : undefined

  const segments: SegmentState[] = queue.map((_, i) =>
    i in outcomes
      ? outcomes[i]
        ? 'ok'
        : 'bad'
      : i === pos
        ? 'current'
        : i < pos
          ? 'skipped'
          : 'pending',
  )
  const correctText =
    ex.type === 'build'
      ? (cardOf?.parts ?? []).map((p) => MORPHEME_BY_ID[p].ko).join(' + ')
      : ex.type === 'theory'
        ? loc(THEORY_BY_ID[ex.theoryId].correct)
        : ex.type === 'meaning' || ex.type === 'listenmeaning'
          ? loc(cardOf!.meaning)
          : hangulOnly
            ? cardOf!.hangul
            : `${cardOf!.ko} · ${cardOf!.hangul}`

  const prompt =
    ex.type === 'meaning'
      ? t('qMeaning')
      : ex.type === 'recall'
        ? t('qRecall')
        : ex.type === 'listen'
          ? t('qListen')
          : ex.type === 'listenmeaning'
            ? t('qListenMeaning')
            : ex.type === 'video'
              ? t('qVideo')
              : ex.type === 'pickclip'
                ? t('qPickClip')
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
        <QuizProgress
          segments={segments}
          position={pos + 1}
          titles={segments.map((_, i) => {
            const e = [...entries].reverse().find((x) => x.segment === i)
            return e ? `${e.n}. ${e.prompt}${e.subject ? `: ${e.subject}` : ''}` : undefined
          })}
          active={review?.segment ?? null}
          onSelect={(i) => setReview([...entries].reverse().find((x) => x.segment === i) ?? null)}
        />
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
              {hangulOnly ? (
                <p lang="ko" className="text-2xl font-bold">
                  {cardOf!.hangul}
                </p>
              ) : (
                <>
                  <p className="text-2xl font-bold">{cardOf!.ko}</p>
                  <p lang="ko" className="text-slate-500">
                    {cardOf!.hangul}
                  </p>
                </>
              )}
            </div>
            <SpeakButton text={cardOf!.hangul} />
            <SpeakButton text={cardOf!.hangul} slow />
          </div>
        )}
        {ex.type === 'frames' && frameClip && <FrameStrip clip={frameClip} />}
        {ex.type === 'recall' && <p className="text-2xl font-bold">{loc(cardOf!.meaning)}</p>}
        {ex.type === 'video' && videoClip && <ClipPlayer clip={videoClip} muted autoplay />}
        {ex.type === 'pickclip' && (
          <div className="flex items-center gap-3">
            <p className="text-2xl font-bold">
              {hangulOnly ? (
                <span lang="ko">{cardOf!.hangul}</span>
              ) : (
                <>
                  {cardOf!.ko}{' '}
                  <span lang="ko" className="text-lg font-normal text-slate-500">
                    {cardOf!.hangul}
                  </span>
                </>
              )}
            </p>
            <SpeakButton text={cardOf!.hangul} />
          </div>
        )}
        {(ex.type === 'listen' || ex.type === 'listenmeaning') && (
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
                  {japanesePart(c) && (
                    <span lang="ja-Latn" className="ml-1 text-xs font-normal text-rose-700">
                      JP {japanesePart(c)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ) : ex.type === 'pickclip' ? (
        <div
          data-clip-row
          className={
            clipLayout === 'row'
              ? 'flex snap-x gap-3 overflow-x-auto pb-2'
              : 'grid grid-cols-1 gap-3 sm:grid-cols-2'
          }
        >
          {options.map((o) => {
            const id = String(o.key)
            const selected = choice === id
            const right = phase !== 'answering' && isCorrect(ex, id)
            const wrong = phase === 'wrong' && selected && !right
            return (
              <div
                key={id}
                data-clip-option
                className={`relative shrink-0 snap-start rounded-xl border-2 p-2 ${clipLayout === 'row' ? 'w-60' : ''} ${right ? 'border-emerald-500 bg-emerald-50' : wrong ? 'border-rose-500 bg-rose-50' : selected ? 'border-sky-500 bg-sky-50' : 'bg-white'}`}
              >
                <button
                  disabled={phase !== 'answering'}
                  aria-pressed={selected}
                  aria-label={`${t('qPickClip')} ${o.label}`}
                  onClick={() => {
                    setChoice(id)
                    if (autoCheck) check(id)
                  }}
                  className="block w-full"
                >
                  <ClipTile cardId={id} label={String(o.label)} />
                </button>
                <button
                  type="button"
                  className="absolute right-3 top-3 rounded-full bg-white/90 px-2 text-sm shadow"
                  aria-label={`▶ ${o.label}`}
                  onClick={() => setClipModal(id)}
                >
                  ▶
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <ul className="grid gap-2">
          {options.map((o) => {
            const selected = choice === o.key
            const right = phase !== 'answering' && isCorrect(ex, o.key)
            const wrong = phase === 'wrong' && selected && !right
            const voiced =
              ex.type === 'recall' ||
              ex.type === 'listen' ||
              ex.type === 'frames' ||
              ex.type === 'video'
            return (
              <li key={String(o.key)} className="relative">
                <button
                  disabled={phase !== 'answering'}
                  aria-pressed={selected}
                  onClick={() => {
                    setChoice(o.key)
                    if (autoCheck) check(o.key)
                  }}
                  className={`w-full rounded-xl border-2 px-4 py-3 text-left font-medium ${voiced ? 'pr-14' : ''} ${right ? 'border-emerald-500 bg-emerald-50' : wrong ? 'border-rose-500 bg-rose-50' : selected ? 'border-sky-500 bg-sky-50' : 'bg-white hover:bg-slate-50'}`}
                >
                  {o.label}
                </button>
                {voiced && (
                  <SpeakButton
                    text={CARD_BY_ID[String(o.key)].hangul}
                    className="absolute right-2 top-2 !h-8 !w-8 !text-base"
                  />
                )}
              </li>
            )
          })}
        </ul>
      )}

      <div className="mt-auto grid gap-3">
        {phase === 'answering' ? (
          !autoCheck || ex.type === 'build' ? (
            <button
              onClick={() => check()}
              disabled={!canCheck}
              className="rounded-xl bg-emerald-500 py-3 font-bold text-white disabled:bg-slate-300"
            >
              {t('check')}
            </button>
          ) : null
        ) : (
          !resultOpen && (
            <button
              autoFocus
              onClick={next}
              className={`rounded-xl py-3 font-bold text-white ${phase === 'right' ? 'bg-emerald-500' : 'bg-rose-500'}`}
            >
              {t('continue')}
            </button>
          )
        )}
      </div>

      <QuizLog entries={entries} onReview={setReview} activeSegment={review?.segment ?? null} />

      {review && <QuizReview entry={review} onClose={() => setReview(null)} />}

      {clipModal && (
        <MaximizeOverlay onClose={() => setClipModal(null)}>
          <ClipPlayer clip={CLIPS_BY_CARD[clipModal][0]} muted autoplay />
        </MaximizeOverlay>
      )}

      {resultOpen && phase !== 'answering' && (
        <ResultModal
          ok={phase === 'right'}
          message={loc(phase === 'right' ? pick(PRAISE, lastMsg) : pick(COMFORT, lastMsg))}
          correctText={correctText}
          hangul={cardOf?.hangul}
          beltColor={beltColor}
          retryNote={phase === 'wrong'}
          seconds={resultMode === '3s' ? 3 : resultMode === '5s' ? 5 : 0}
          autoContinue={autoContinue}
          onContinue={next}
          onClose={() => setResultOpen(false)}
        />
      )}
    </div>
  )
}
