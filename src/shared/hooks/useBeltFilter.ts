import { cardBeltIndex } from '../../data/levels'
import { useAppStore } from '../store/useAppStore'

/**
 * Global content filter. Either everything up to the slider belt (cumulative), or, when a single belt is
 * picked, only the items that are new at that belt.
 */
export function useBeltFilter() {
  const max = useAppStore((s) => s.maxBelt)
  const setMax = useAppStore((s) => s.setMaxBelt)
  const only = useAppStore((s) => s.onlyBelt)
  const setOnly = useAppStore((s) => s.setOnlyBelt)
  const visibleIndex = (i: number) => (only === null ? i <= max : i === only)
  return {
    max,
    setMax,
    only,
    setOnly,
    visibleCard: (cardId: string) => visibleIndex(cardBeltIndex(cardId)),
    visibleIndex,
  }
}
