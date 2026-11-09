import { STRINGS, type StringKey } from './strings'
import { useAppStore } from '../store/useAppStore'
import type { Loc } from './types'

export function useT() {
  const lang = useAppStore((s) => s.lang)
  return {
    lang,
    t: (key: StringKey) => STRINGS[key][lang],
    loc: (l: Loc) => l[lang],
  }
}
