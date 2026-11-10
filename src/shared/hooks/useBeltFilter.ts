import { cardBeltIndex } from '../../data/levels'
import { useAppStore } from '../store/useAppStore'

/** Global content filter: items whose belt is above the slider are hidden. */
export function useBeltFilter() {
  const max = useAppStore((s) => s.maxBelt)
  const setMax = useAppStore((s) => s.setMaxBelt)
  return {
    max,
    setMax,
    visibleCard: (cardId: string) => cardBeltIndex(cardId) <= max,
    visibleIndex: (i: number) => i <= max,
  }
}
