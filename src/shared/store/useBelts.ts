import { useMemo } from 'react'
import { BELTS, type Belt } from '../../data/belts'
import { beltLook } from '../../data/beltScheme'
import { useAppStore } from './useAppStore'

/** The belts as shown under the chosen colour scheme (colour, stripe, name). Ranks and ids never change. */
export function useBelts(): Belt[] {
  const scheme = useAppStore((s) => s.beltScheme)
  return useMemo(() => BELTS.map((b) => beltLook(b, scheme)), [scheme])
}
