import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '../i18n/types'

export type VideoLang = 'auto' | 'es' | 'de'
import { dayString, updateStreak, type Completed, type Streak } from '../../features/learn/progress'

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
  listening: boolean // include listening exercises
  videoLang: VideoLang
  setLang: (l: Lang) => void
  setStrictOrder: (v: boolean) => void
  setMaxBelt: (v: number) => void
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
      onlyBelt: null,
      listening: true,
      videoLang: 'auto',
      ...empty,
      setLang: (lang) => set({ lang }),
      setStrictOrder: (strictOrder) => set({ strictOrder }),
      setMaxBelt: (v) => set({ maxBelt: Math.max(0, Math.min(10, Math.round(v))) }),
      setOnlyBelt: (onlyBelt) => set({ onlyBelt }),
      setListening: (listening) => set({ listening }),
      setVideoLang: (videoLang) => set({ videoLang }),
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
