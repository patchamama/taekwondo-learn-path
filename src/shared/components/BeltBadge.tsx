import { BELTS } from '../../data/belts'
import { cardBeltIndex } from '../../data/levels'
import { useT } from '../i18n/useT'

/** Small belt-coloured chip telling at which level a card first appears. */
export function BeltBadge({ cardId, index }: { cardId?: string; index?: number }) {
  const { t } = useT()
  const i = index ?? (cardId ? cardBeltIndex(cardId) : 0)
  const b = BELTS[i]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border bg-white px-2 py-0.5 text-xs font-semibold text-slate-700"
      title={`${t('appearsAt')} ${b.rank}`}
    >
      <span
        aria-hidden
        className="inline-block h-2.5 w-5 rounded-sm border border-slate-700"
        style={{
          background: b.stripe ? `linear-gradient(${b.color} 55%, ${b.stripe} 55%)` : b.color,
        }}
      />
      {b.rank}
    </span>
  )
}
