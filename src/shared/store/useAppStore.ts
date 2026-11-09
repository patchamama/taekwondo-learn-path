import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lang } from '../i18n/types'
import { BELTS } from '../../data/belts'

interface AppState {
  lang: Lang
  currentBeltIndex: number
  learned: string[]
  setLang: (l: Lang) => void
  reachBelt: (index: number) => void
  toggleLearned: (id: string) => void
  reset: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      lang: 'en',
      currentBeltIndex: 0,
      learned: [],
      setLang: (lang) => set({ lang }),
      reachBelt: (index) =>
        set({ currentBeltIndex: Math.max(0, Math.min(index, BELTS.length - 1)) }),
      toggleLearned: (id) =>
        set((s) => ({
          learned: s.learned.includes(id) ? s.learned.filter((x) => x !== id) : [...s.learned, id],
        })),
      reset: () => set({ currentBeltIndex: 0, learned: [] }),
    }),
    { name: 'tkd-learn' },
  ),
)
