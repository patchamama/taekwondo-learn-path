import type { CurriculumFile } from './types'

// Every `kup*.json` in this folder is a curriculum slice (7-5 Kup, 4-3 Kup, 2 Kup-1 Dan, ...).
// Slices are merged in file-name order; the first definition of an id wins (lowest belt first).
const modules = import.meta.glob('./kup*.json', { eager: true, import: 'default' }) as Record<
  string,
  CurriculumFile
>

// File names start with the lowest belt of the slice (kup7-5 → 7). Higher Kup numbers are lower belts,
// so sort descending: 7 Kup first, 1 Dan last.
const firstKup = (path: string) => Number(/kup(\d+)/.exec(path)?.[1] ?? 0)

export const SLICES: CurriculumFile[] = Object.entries(modules)
  .sort(([a], [b]) => firstKup(b) - firstKup(a))
  .map(([, v]) => v)

/** Merge `extra` into `base` by `key`, keeping the first definition. */
export function mergeById<T>(base: T[], extra: T[], key: (x: T) => string): T[] {
  const seen = new Set(base.map(key))
  const out = [...base]
  for (const x of extra) {
    const k = key(x)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(x)
  }
  return out
}

export const flat = <K extends keyof CurriculumFile>(k: K): NonNullable<CurriculumFile[K]> =>
  SLICES.flatMap((s) => (s[k] as unknown[]) ?? []) as NonNullable<CurriculumFile[K]>
