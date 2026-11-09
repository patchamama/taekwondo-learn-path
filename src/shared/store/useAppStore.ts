import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '../i18n/types'
import { dayString, updateStreak, type Completed, type Streak } from '../../features/learn/progress'

interface AppState {
  lang: Lang
  learned: string[] // techniques ticked as learned manually
  completed: Completed
  xp: number
  streak: Streak
  mastery: Record<string, number> // cardId → correct answers
  setLang: (l: Lang) => void
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
      ...empty,
      setLang: (lang) => set({ lang }),
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
