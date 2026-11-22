import { create } from 'zustand'
import type { BeltScheme } from '../../data/beltScheme'
import { persist } from 'zustand/middleware'
import type { Lang } from '../i18n/types'

export type VideoLang = 'auto' | 'es' | 'de'
import { dayString, updateStreak, type Completed, type Streak } from '../../features/learn/progress'

export type QuizResultMode = 'button' | '3s' | '5s'

interface AppState {
  lang: Lang
  learned: string[] // techniques ticked as learned manually
  completed: Completed
  xp: number
  streak: Streak
  mastery: Record<string, number> // cardId → correct answers
  strictOrder: boolean // lock lessons until the previous one is done
  maxBelt: number // content filter: show items up to this belt index (0 = 10 Kup … 10 = 1 Dan)
  onlyBelt: number | null // when set, show only the items first needed at this belt
  beltScheme: BeltScheme // belt colours: the club's or the traditional sequence
  pathView: 'list' | 'path' | 'map' // how the Path page shows the course
  listening: boolean // include listening exercises
  videoLang: VideoLang
  quizAutoCheck: boolean // check the answer as soon as it is chosen (no Check button)
  quizResultMode: QuizResultMode // how long the centred result stays
  quizAutoContinue: boolean // after the timed result, go on without pressing Continue
  quizMaxQuestions: number // maximum questions per quiz section
  practiceSections: string[] // sections to practise (word blocks, hand, foot, stances, combos, terms, forms)
  practiceFormats: string[] // exercise formats to practise
  hangulOnly: boolean // show Korean terms in hangul only, without Latin letters
  clipLayout: 'row' | 'grid' // clip choices in one scrolling row, or complete in several rows
  setPracticeSections: (v: string[]) => void
  setPracticeFormats: (v: string[]) => void
  setHangulOnly: (v: boolean) => void
  setClipLayout: (v: 'row' | 'grid') => void
  setQuizAutoCheck: (v: boolean) => void
  setQuizResultMode: (v: QuizResultMode) => void
  setQuizAutoContinue: (v: boolean) => void
  setQuizMaxQuestions: (v: number) => void
  setLang: (l: Lang) => void
  setStrictOrder: (v: boolean) => void
  setMaxBelt: (v: number) => void
  setPathView: (v: 'list' | 'path' | 'map') => void
  setBeltScheme: (v: BeltScheme) => void
  setOnlyBelt: (v: number | null) => void
  setListening: (v: boolean) => void
  setVideoLang: (v: VideoLang) => void
  toggleLearned: (id: string) => void
  recordAnswer: (cardId: string, correct: boolean) => void
  completeLesson: (lessonId: string, stars: number, xp: number, today?: string) => void
  addXp: (xp: number, today?: string) => void
  reset: () => void
}

const empty = {
  learned: [],
  completed: {},
  xp: 0,
  streak: { count: 0, last: null } as Streak,
  mastery: {},
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      lang: 'en',
      strictOrder: false,
      maxBelt: 10,
      pathView: 'list',
      beltScheme: 'club',
      onlyBelt: null,
      listening: true,
      videoLang: 'auto',
      quizAutoCheck: true,
      quizResultMode: 'button',
      quizAutoContinue: false,
      quizMaxQuestions: 14,
      practiceSections: ['words', 'hand', 'foot', 'stance', 'combo', 'terms', 'forms'],
      practiceFormats: ['meaning', 'recall', 'listen', 'listenmeaning', 'frames', 'video', 'pickclip', 'build'],
      hangulOnly: false,
      clipLayout: 'row',
      ...empty,
      setLang: (lang) => set({ lang }),
      setStrictOrder: (strictOrder) => set({ strictOrder }),
      setMaxBelt: (v) => set({ maxBelt: Math.max(0, Math.min(10, Math.round(v))) }),
      setBeltScheme: (beltScheme) => set({ beltScheme }),
      setPathView: (pathView) => set({ pathView }),
      setOnlyBelt: (onlyBelt) => set({ onlyBelt }),
      setListening: (listening) => set({ listening }),
      setVideoLang: (videoLang) => set({ videoLang }),
      setPracticeSections: (practiceSections) => set({ practiceSections }),
      setPracticeFormats: (practiceFormats) => set({ practiceFormats }),
      setHangulOnly: (hangulOnly) => set({ hangulOnly }),
      setClipLayout: (clipLayout) => set({ clipLayout }),
      setQuizAutoCheck: (quizAutoCheck) => set({ quizAutoCheck }),
      setQuizResultMode: (quizResultMode) => set({ quizResultMode }),
      setQuizAutoContinue: (quizAutoContinue) => set({ quizAutoContinue }),
      setQuizMaxQuestions: (v) => set({ quizMaxQuestions: Math.max(3, Math.min(40, Math.round(v))) }),
      toggleLearned: (id) =>
        set((s) => ({
          learned: s.learned.includes(id) ? s.learned.filter((x) => x !== id) : [...s.learned, id],
        })),
      recordAnswer: (cardId, correct) =>
        set((s) => ({
          mastery: {
            ...s.mastery,
            [cardId]: Math.max(0, (s.mastery[cardId] ?? 0) + (correct ? 1 : -1)),
          },
        })),
      completeLesson: (lessonId, stars, xp, today = dayString()) =>
        set((s) => ({
          completed: { ...s.completed, [lessonId]: Math.max(stars, s.completed[lessonId] ?? 0) },
          xp: s.xp + xp,
          streak: updateStreak(s.streak, today),
        })),
      addXp: (xp, today = dayString()) =>
        set((s) => ({ xp: s.xp + xp, streak: updateStreak(s.streak, today) })),
      reset: () => set({ ...empty }),
    }),
    { name: 'tkd-learn', version: 2, migrate: () => ({ lang: 'en', ...empty }) as never },
  ),
)
