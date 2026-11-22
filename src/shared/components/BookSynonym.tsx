import { bookSynonym } from '../../data/bookSpelling'
import { useT } from '../i18n/useT'

/** Book spelling of a technique (e.g. Arae-Makki) shown as a synonym of the card's own romanization. */
export function BookSynonym({ cardId }: { cardId: string }) {
  const { t } = useT()
  const s = bookSynonym(cardId)
  if (!s) return null
  return (
    <p className="text-slate-600">
      <span className="font-semibold">{t('synonymBook')}: </span>
      {s.spelling}
      {s.de ? ` – ${s.de}` : ''}
    </p>
  )
}
