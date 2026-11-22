import raw from './customCards.json'

/** Pure, ID-only predicate: hiding a brick never hides its dependent techniques. */
export function isVisible(id: string, hiddenIds: readonly string[] = raw.hiddenIds): boolean {
  return !hiddenIds.includes(id)
}
