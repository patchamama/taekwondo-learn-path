import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CARD_BY_ID } from '../../data/cards'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { useT } from '../../shared/i18n/useT'
import { useAppStore } from '../../shared/store/useAppStore'
import { makeRng } from '../learn/exercises'
import { Bubble } from '../mascot/Bubble'
import { ClipPlayer } from './ClipPlayer'
import { buildVideoRounds } from './videoQuiz'

type Mode = 'guess' | 'recall'
const THINK_SECONDS = 6

export function VideoQuizPage() {
  const { t } = useT()
  const [mode, setMode] = useState<Mode | null>(null)
  if (!mode) {
    return (
      <section className="mx-auto grid max-w-xl gap-4">
        <h1 className="text-2xl font-bold">{t('vqTitle')}</h1>
        <p className="rounded-lg bg-amber-50 p-3 text-sm">ℹ {t('videoCaveat')}</p>
        <button
          onClick={() => setMode('guess')}
          className="rounded-2xl border bg-white p-5 text-left shadow-sm hover:bg-amber-50"
        >
          <b>🔇 {t('vqGuess')}</b>
          <p className="text-sm text-slate-600">{t('vqGuessHint')}</p>
        </button>
        <button
          onClick={() => setMode('recall')}
          className="rounded-2xl border bg-white p-5 text-left shadow-sm hover:bg-amber-50"
        >
          <b>🧠 {t('vqRecall')}</b>
          <p className="text-sm text-slate-600">{t('vqRecallHint')}</p>
        </button>
        <Link to="/videos" className="text-sm underline">
          ← {t('videosTitle')}
        </Link>
      </section>
    )
  }
  return <Game key={mode} mode={mode} onBack={() => setMode(null)} />
}

function Game({ mode, onBack }: { mode: Mode; onBack: () => void }) {
  const { t, loc } = useT()
  const addXp = useAppStore((s) => s.addXp)
  const [seed, setSeed] = useState(() => Date.now())
  const [rounds, setRounds] = useState(() => buildVideoRounds(makeRng(seed)))
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [choice, setChoice] = useState<string | null>(null)
  const [shown, setShown] = useState(false)
  const [left, setLeft] = useState(THINK_SECONDS)
  const [finished, setFinished] = useState(false)

  const revealed = shown || left <= 0
  const round = rounds[i]
  const card = round ? CARD_BY_ID[round.cardId] : undefined

  // countdown for "recall" mode
  useEffect(() => {
    if (mode !== 'recall' || revealed || finished) return
    const id = setTimeout(() => setLeft((n) => n - 1), 1000)
    return () => clearTimeout(id)
  }, [mode, revealed, left, finished])

  const advance = (gotIt: boolean) => {
    const newScore = score + (gotIt ? 1 : 0)
    setScore(newScore)
    if (i + 1 >= rounds.length) {
      addXp(newScore * 3)
      setFinished(true)
      return
    }
    setI(i + 1)
    setChoice(null)
    setShown(false)
    setLeft(THINK_SECONDS)
  }

  const restart = () => {
    const s = Date.now()
    setSeed(s)
    setRounds(buildVideoRounds(makeRng(s)))
    setI(0)
    setScore(0)
    setChoice(null)
    setShown(false)
    setLeft(THINK_SECONDS)
    setFinished(false)
  }

  if (finished || !round || !card) {
    return (
      <section className="mx-auto grid max-w-xl gap-4 text-center">
        <h1 className="text-2xl font-bold">{t('vqEnd')}</h1>
        <p className="text-xl">
          {t('vqScore')}: {score} / {rounds.length}
        </p>
        <Bubble mood={score >= rounds.length / 2 ? 'cheer' : 'think'} tone="good">
          {score >= rounds.length / 2 ? '🐯 Kihap!' : '🐯 …'}
        </Bubble>
        <button onClick={restart} className="rounded-xl bg-emerald-500 py-3 font-bold text-white">
          {t('vqAgain')}
        </button>
        <button onClick={onBack} className="text-sm underline">
          ← {t('vqTitle')}
        </button>
      </section>
    )
  }

  const answered = choice !== null

  return (
    <section className="mx-auto grid max-w-xl gap-4" data-seed={seed}>
      <div className="flex items-center justify-between text-sm">
        <button onClick={onBack} className="underline">
          ✕ {t('exit')}
        </button>
        <span>
          {t('vqRound')} {i + 1}/{rounds.length} · {t('vqScore')} {score}
        </span>
      </div>

      {mode === 'guess' ? (
        <>
          <h2 className="text-lg font-bold">{t('vqGuess')}</h2>
          {/* controls hidden + muted: nothing in the clip reveals the name until answered */}
          <ClipPlayer
            key={`g-${i}-${answered}`}
            cardId={round.cardId}
            muted={!answered}
            controls={answered}
          />
          <ul className="grid gap-2">
            {round.options.map((id) => {
              const c = CARD_BY_ID[id]
              const right = answered && id === round.cardId
              const wrong = answered && id === choice && id !== round.cardId
              return (
                <li key={id}>
                  <button
                    disabled={answered}
                    onClick={() => setChoice(id)}
                    className={`w-full rounded-xl border-2 px-4 py-3 text-left font-medium ${right ? 'border-emerald-500 bg-emerald-50' : wrong ? 'border-rose-500 bg-rose-50' : 'bg-white hover:bg-slate-50'}`}
                  >
                    {c.ko} <span className="text-slate-500">· {loc(c.meaning)}</span>
                  </button>
                </li>
              )
            })}
          </ul>
          {answered && (
            <button
              autoFocus
              onClick={() => advance(choice === round.cardId)}
              className="rounded-xl bg-emerald-500 py-3 font-bold text-white"
            >
              {t('continue')}
            </button>
          )}
        </>
      ) : (
        <>
          <h2 className="text-lg font-bold">{t('vqRecall')}</h2>
          <div className="rounded-2xl border bg-white p-6 text-center shadow-sm">
            <p className="text-3xl font-bold">{card.ko}</p>
            <p lang="ko" className="text-slate-500">
              {card.hangul}
            </p>
            <p className="mt-1">{loc(card.meaning)}</p>
            <div className="mt-2 flex justify-center gap-2">
              <SpeakButton text={card.hangul} />
              <SpeakButton text={card.hangul} slow />
            </div>
          </div>
          {!revealed ? (
            <div className="grid gap-2 text-center">
              <p aria-live="polite" className="text-lg">
                {t('vqThink')} {left}s
              </p>
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{ width: `${(left / THINK_SECONDS) * 100}%` }}
                />
              </div>
              <button
                onClick={() => setShown(true)}
                className="rounded-xl border bg-white py-2 font-semibold"
              >
                {t('vqReveal')}
              </button>
            </div>
          ) : (
            <>
              <ClipPlayer key={`r-${i}`} cardId={round.cardId} />
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => advance(true)}
                  className="rounded-xl bg-emerald-500 py-3 font-bold text-white"
                >
                  {t('vqKnewIt')}
                </button>
                <button
                  onClick={() => advance(false)}
                  className="rounded-xl bg-rose-500 py-3 font-bold text-white"
                >
                  {t('vqMissed')}
                </button>
              </div>
            </>
          )}
        </>
      )}
    </section>
  )
}
