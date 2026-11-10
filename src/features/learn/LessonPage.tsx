import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BELTS } from '../../data/belts'
import { CARD_BY_ID } from '../../data/cards'
import { LESSON_BY_ID, LESSONS, UNITS } from '../../data/lessons'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { useT } from '../../shared/i18n/useT'
import { useAppStore } from '../../shared/store/useAppStore'
import { Bubble } from '../mascot/Bubble'
import { CardDetail } from './CardDetail'
import { buildExercises, buildPractice, makeRng } from './exercises'
import { LessonPlayer, type PlayerResult } from './LessonPlayer'
import { heldBeltIndex, isUnlocked, learnedCardIds, starsFor, unitComplete } from './progress'

type Stage = 'intro' | 'play' | 'done'

export function LessonPage() {
  const { id } = useParams()
  const lesson = id ? LESSON_BY_ID[id] : undefined
  const completed = useAppStore((s) => s.completed)
  const strict = useAppStore((s) => s.strictOrder)
  if (!lesson) return <Missing />
  if (!isUnlocked(lesson.id, completed, strict)) return <Missing locked />
  return <Run key={lesson.id} lessonId={lesson.id} />
}

function Missing({ locked = false }: { locked?: boolean }) {
  const { t } = useT()
  return (
    <div className="text-center">
      <p className="mb-4">{locked ? t('locked') : '404'}</p>
      <Link className="underline" to="/">
        {t('backToPath')}
      </Link>
    </div>
  )
}

export function PracticePage() {
  const { t } = useT()
  const completed = useAppStore((s) => s.completed)
  const mastery = useAppStore((s) => s.mastery)
  const learned = useMemo(() => learnedCardIds(completed), [completed])
  if (learned.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <Bubble mood="think">{t('practiceEmpty')}</Bubble>
        <Link className="mt-4 inline-block underline" to="/">
          {t('backToPath')}
        </Link>
      </div>
    )
  }
  return <Run key="practice" lessonId={null} learned={learned} mastery={mastery} />
}

interface RunProps {
  lessonId: string | null
  learned?: string[]
  mastery?: Record<string, number>
}

function Run({ lessonId, learned = [], mastery = {} }: RunProps) {
  const { t, loc } = useT()
  const nav = useNavigate()
  const lesson = lessonId ? LESSON_BY_ID[lessonId] : null
  const completed = useAppStore((s) => s.completed)
  const completeLesson = useAppStore((s) => s.completeLesson)
  const addXp = useAppStore((s) => s.addXp)
  const recordAnswer = useAppStore((s) => s.recordAnswer)
  const listening = useAppStore((s) => s.listening)
  const beltBefore = useMemo(() => BELTS[heldBeltIndex(completed)], []) // eslint-disable-line react-hooks/exhaustive-deps
  const [stage, setStage] = useState<Stage>(lesson ? 'intro' : 'play')
  const [result, setResult] = useState<PlayerResult | null>(null)
  const [earned, setEarned] = useState<string | null>(null)
  const [exercises] = useState(() =>
    lesson
      ? buildExercises(lesson, makeRng(Date.now()), { listening })
      : buildPractice(learned, mastery, makeRng(Date.now()), 10, listening),
  )

  const finish = (r: PlayerResult) => {
    r.answers.forEach((a) => a.cardId && recordAnswer(a.cardId, a.correct))
    const stars = starsFor(r.correct, r.total)
    const xp = 5 + r.correct * 2 + (stars === 3 ? 5 : 0)
    if (lesson) {
      const wasDone = completed[lesson.id]
      const before = heldBeltIndex(completed)
      const after = heldBeltIndex({ ...completed, [lesson.id]: stars })
      completeLesson(lesson.id, stars, wasDone ? Math.ceil(xp / 2) : xp)
      if (after > before) setEarned(BELTS[after].id)
    } else {
      addXp(xp)
    }
    setResult(r)
    setStage('done')
  }

  if (stage === 'intro' && lesson) {
    return (
      <div className="mx-auto grid max-w-xl gap-6">
        <h1 className="text-2xl font-bold">{loc(lesson.title)}</h1>
        <Bubble mood="happy" beltColor={beltBefore.color}>
          {loc(lesson.tip)}
        </Bubble>
        {lesson.cardIds.length > 0 && (
          <ul className="grid gap-2">
            {lesson.cardIds.map((cid, k) => (
              <CardDetail key={cid} cardId={cid} defaultOpen={k === 0} />
            ))}
          </ul>
        )}
        <button
          className="rounded-xl bg-emerald-500 py-3 font-bold text-white"
          onClick={() => setStage('play')}
        >
          {t('start')}
        </button>
      </div>
    )
  }

  if (stage === 'done' && result) {
    const stars = starsFor(result.correct, result.total)
    const idx = lesson ? LESSONS.findIndex((l) => l.id === lesson.id) : -1
    const nextL = idx >= 0 ? LESSONS[idx + 1] : undefined
    const unit = lesson ? UNITS.find((u) => u.id === lesson.unit) : undefined
    const unitDone = Boolean(
      lesson && unit && unitComplete(unit.id, { ...completed, [lesson.id]: stars }),
    )
    const recapCards = lesson ? lesson.cardIds : learned.slice(0, 8)
    return (
      <div className="mx-auto grid max-w-xl gap-5 text-center">
        <h1 className="text-2xl font-bold">{t('lessonComplete')}</h1>
        <p className="text-4xl" aria-label={`${stars} stars`}>
          {'⭐'.repeat(stars)}
          {'☆'.repeat(3 - stars)}
        </p>
        <p>
          {Math.round((result.correct / Math.max(1, result.total)) * 100)}% {t('accuracy')}
        </p>
        {earned && unitDone && (
          <Bubble mood="cheer" beltColor={BELTS.find((b) => b.id === earned)!.color} tone="good">
            <b>
              {t('beltEarned')}: {BELTS.find((b) => b.id === earned)!.rank}
            </b>{' '}
            – {loc(BELTS.find((b) => b.id === earned)!.name)}
          </Bubble>
        )}
        {recapCards.length > 0 && (
          <div className="rounded-2xl border bg-white p-4 text-left">
            <h2 className="mb-2 font-semibold">{t('wordsRecap')}</h2>
            <ul className="grid gap-1 text-sm">
              {recapCards.map((cid) => (
                <li key={cid} className="flex items-center gap-2">
                  <SpeakButton text={CARD_BY_ID[cid].hangul} className="!h-7 !w-7 !text-sm" />
                  <b>{CARD_BY_ID[cid].ko}</b> = {loc(CARD_BY_ID[cid].meaning)}
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="grid gap-2">
          {nextL && (
            <button
              className="rounded-xl bg-emerald-500 py-3 font-bold text-white"
              onClick={() => nav(`/lesson/${nextL.id}`)}
            >
              {t('nextLesson')}: {loc(nextL.title)}
            </button>
          )}
          <Link className="rounded-xl border bg-white py-3 font-semibold" to="/">
            {t('backToPath')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <LessonPlayer
      exercises={exercises}
      beltColor={beltBefore.color}
      onFinish={finish}
      onExit={() => nav('/')}
    />
  )
}
