import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { BELTS } from '../../data/belts'
import { CONCEPTS } from '../../data/concepts'
import { CARD_BY_ID } from '../../data/cards'
import { CUSTOM_CARDS } from '../../data/customCards'
import { isVisible } from '../../data/visibility'
import { LESSON_BY_ID, LESSONS, UNITS } from '../../data/lessons'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { useT } from '../../shared/i18n/useT'
import { useAppStore } from '../../shared/store/useAppStore'
import { useBeltFilter } from '../../shared/hooks/useBeltFilter'
import { Bubble } from '../mascot/Bubble'
import { CardDetail } from './CardDetail'
import { buildExercises, buildPractice, makeRng, type ExerciseType } from './exercises'
import { PracticeOptions } from './PracticeOptions'
import { PRACTICE_COPY } from './practiceCopy'
import { SECTION_BY_ID } from '../../data/audioManifest'
import { LessonPlayer, type PlayerResult } from './LessonPlayer'
import { heldBeltIndex, isUnlocked, starsFor, unitComplete } from './progress'

type Stage = 'intro' | 'play' | 'done'

const PRACTICE_CANDIDATES = [...new Set([...LESSONS.flatMap((lesson) => lesson.cardIds), ...CUSTOM_CARDS.map((c) => c.id)])]

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
  const sections = useAppStore((s) => s.practiceSections)
  const formats = useAppStore((s) => s.practiceFormats)
  const { max, only, visibleCard } = useBeltFilter()
  const inRange = PRACTICE_CANDIDATES.filter(visibleCard)
  const learned = inRange.filter((id) => sections.includes(SECTION_BY_ID[id]))
  const available: Record<string, number> = {}
  for (const id of inRange) available[SECTION_BY_ID[id]] = (available[SECTION_BY_ID[id]] ?? 0) + 1
  if (inRange.length === 0) {
    return (
      <div className="mx-auto max-w-xl">
        <Bubble mood="think">{t('practiceEmpty')}</Bubble>
        <Link className="mt-4 inline-block underline" to="/">
          {t('backToPath')}
        </Link>
      </div>
    )
  }
  // Only a filter or option change starts a new session; mastery updates must not rebuild questions.
  const sessionKey = `practice-${only === null ? `up-to-${max}` : `only-${only}`}-${sections.join()}-${formats.join()}`
  return (
    <div className="mx-auto grid max-w-xl gap-3">
      <PracticeOptions available={available} />
      <PracticeSession key={sessionKey} learned={learned} formats={formats as ExerciseType[]} />
    </div>
  )
}

/** Keep bulk IDs frozen for a run; progress updates refresh totals, not its question queue. */
function PracticeSession({ learned, formats }: { learned: string[]; formats: ExerciseType[] }) {
  const { t, loc } = useT()
  const mastery = useAppStore((s) => s.mastery)
  const listening = useAppStore((s) => s.listening)
  const [bulk, setBulk] = useState<{ ids: string[]; serial: number } | null>(null)
  // Reuse the public generator's material/visibility rules, without its ordinary quiz cap.
  const eligible = useMemo(() => [...new Set(buildExercises({
    id: 'practice-totals', unit: 'kup10', title: { en: '', de: '', es: '' },
    tip: { en: '', de: '', es: '' }, cardIds: learned,
  }, makeRng(0), { max: Infinity, listening, formats }).flatMap((ex) => 'cardId' in ex ? [ex.cardId] : []))], [learned, listening, formats])
  const pending = eligible.filter((id) => !Object.hasOwn(mastery, id))
  return <>
    <aside className="grid gap-2 rounded-xl border bg-white p-3 text-sm">
      <p role="status">{loc(PRACTICE_COPY.practiced)}: {eligible.length - pending.length} · {loc(PRACTICE_COPY.pending)}: {pending.length}</p>
      <p>{loc(PRACTICE_COPY.progressMeaning)}</p>
      <button type="button" disabled={pending.length === 0} aria-describedby="pending-help"
        className="rounded-xl bg-emerald-500 p-3 font-bold text-white disabled:bg-slate-300"
        onClick={() => setBulk({ ids: pending, serial: (bulk?.serial ?? 0) + 1 })}>
        {loc(PRACTICE_COPY.allPending)}
      </button>
      <p id="pending-help">{loc(eligible.length === 0 ? PRACTICE_COPY.noEligible : pending.length === 0 ? PRACTICE_COPY.nonePending : PRACTICE_COPY.bulkHelp)}</p>
    </aside>
    {learned.length === 0 ? <Bubble mood="think">{t('practiceNoSection')}</Bubble>
      : eligible.length > 0 && <Run key={bulk?.serial ?? 0} lessonId={null} learned={bulk?.ids ?? learned}
          mastery={mastery} formats={formats} allPending={bulk !== null} />}
  </>
}

function LessonReadings({ cardIds, theory }: { cardIds: string[]; theory: boolean }) {
  const { t, loc } = useT()
  const cards = cardIds.filter((id) => isVisible(id)).map((id) => CARD_BY_ID[id]).filter(Boolean)
  const topics = new Set(['practice'])
  if (cards.some((c) => c.kind === 'technique' || c.group === 'morpheme-action')) topics.add('technique-purpose')
  if (cards.some((c) => c.group.includes('stance') || c.id === 'sogi' || c.id === 'gubi')) topics.add('movement')
  if (cards.some((c) => c.id.includes('macki'))) topics.add('blocks')
  if (cards.some((c) => c.kind === 'form')) topics.add('patterns')
  if (theory || cards.some((c) => c.group.includes('basic') || c.group.includes('command'))) topics.add('principles')
  return (
    <aside className="grid gap-3 rounded-xl border bg-white p-4 text-sm">
      <h2 className="font-bold">{t('readingContext')}</h2>
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {CONCEPTS.filter((c) => topics.has(c.id)).map((c) => (
          <li key={c.id}><Link className="underline" to={`/concepts#${c.id}`}>{loc(c.title)}</Link></li>
        ))}
      </ul>
      <Link className="underline" to="/concepts#meditation">{t('readingPreparation')}</Link>
    </aside>
  )
}

interface RunProps {
  lessonId: string | null
  learned?: string[]
  mastery?: Record<string, number>
  formats?: ExerciseType[]
  allPending?: boolean
}

function Run({ lessonId, learned = [], mastery = {}, formats, allPending = false }: RunProps) {
  const { t, loc } = useT()
  const nav = useNavigate()
  const originalLesson = lessonId ? LESSON_BY_ID[lessonId] : null
  const lesson = originalLesson ? { ...originalLesson, cardIds: originalLesson.cardIds.filter((id) => isVisible(id)) } : null
  const completed = useAppStore((s) => s.completed)
  const completeLesson = useAppStore((s) => s.completeLesson)
  const addXp = useAppStore((s) => s.addXp)
  const recordAnswer = useAppStore((s) => s.recordAnswer)
  const listening = useAppStore((s) => s.listening)
  const maxQuestions = useAppStore((s) => s.quizMaxQuestions)
  const beltBefore = useMemo(() => BELTS[heldBeltIndex(completed)], []) // eslint-disable-line react-hooks/exhaustive-deps
  const [stage, setStage] = useState<Stage>(lesson ? 'intro' : 'play')
  const [result, setResult] = useState<PlayerResult | null>(null)
  const [earned, setEarned] = useState<string | null>(null)
  const [exercises] = useState(() =>
    lesson
      ? buildExercises(lesson, makeRng(Date.now()), { listening, max: maxQuestions })
      : buildPractice(learned, mastery, makeRng(Date.now()), allPending ? Infinity : maxQuestions, listening, formats),
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
        <LessonReadings cardIds={lesson.cardIds} theory={Boolean(lesson.theoryIds?.length)} />
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
    const recapCards = (lesson ? lesson.cardIds : learned).filter((id) => isVisible(id)).slice(0, lesson ? undefined : 8)
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
