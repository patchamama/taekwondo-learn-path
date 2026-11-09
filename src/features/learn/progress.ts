import { BELTS } from '../../data/belts'
import { LESSONS, UNITS, lessonsOfUnit, type UnitId } from '../../data/lessons'

export type Completed = Record<string, number> // lessonId → stars (1-3)

export interface Streak {
  count: number
  last: string | null // YYYY-MM-DD
}

export const dayString = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

const dayDiff = (a: string, b: string) =>
  Math.round((new Date(b + 'T00:00:00').getTime() - new Date(a + 'T00:00:00').getTime()) / 86400000)

export function updateStreak(streak: Streak, today: string): Streak {
  if (streak.last === today) return streak
  if (streak.last && dayDiff(streak.last, today) === 1)
    return { count: streak.count + 1, last: today }
  return { count: 1, last: today }
}

/** Streak as shown: it is broken if the last practice was before yesterday. */
export function activeStreak(streak: Streak, today: string): number {
  if (!streak.last) return 0
  return dayDiff(streak.last, today) <= 1 ? streak.count : 0
}

export function starsFor(correct: number, total: number): 1 | 2 | 3 {
  if (total === 0) return 3
  const r = correct / total
  return r >= 0.9 ? 3 : r >= 0.7 ? 2 : 1
}

/** With strict order off (default) every lesson is open; with it on, lessons unlock one after another. */
export const isUnlocked = (
  lessonId: string,
  completed: Completed,
  strictOrder: boolean,
): boolean => {
  if (!strictOrder) return LESSONS.some((l) => l.id === lessonId)
  const i = LESSONS.findIndex((l) => l.id === lessonId)
  if (i <= 0) return i === 0
  return Boolean(completed[LESSONS[i - 1].id])
}

export const unitComplete = (unit: UnitId, completed: Completed) =>
  lessonsOfUnit(unit).every((l) => completed[l.id])

/** Belts earned = beltIds of completed units (in order). Everyone starts as 10 Kup. */
export function heldBeltIndex(completed: Completed): number {
  let idx = 0
  for (const u of UNITS) {
    if (!unitComplete(u.id, completed)) break
    idx = Math.max(
      idx,
      BELTS.findIndex((b) => b.id === u.earns),
    )
  }
  return idx
}

export const nextLesson = (completed: Completed) => LESSONS.find((l) => !completed[l.id])

export function learnedCardIds(completed: Completed): string[] {
  return [...new Set(LESSONS.filter((l) => completed[l.id]).flatMap((l) => l.cardIds))]
}
