import { useT } from '../i18n/useT'
import { useAppStore } from '../store/useAppStore'

/** Cards compact (images only as a hover hint) or in details mode (images shown). */
export function CardViewToggle() {
  const { t } = useT()
  const view = useAppStore((s) => s.cardView)
  const setView = useAppStore((s) => s.setCardView)
  return (
    <fieldset className="flex items-center gap-3 text-sm">
      <legend className="sr-only">{t('cardViewLabel')}</legend>
      <span aria-hidden className="font-semibold text-slate-600">
        {t('cardViewLabel')}:
      </span>
      {(['compact', 'details'] as const).map((id) => (
        <label key={id} className="flex items-center gap-1">
          <input type="radio" name="cardView" checked={view === id} onChange={() => setView(id)} />
          {t(id === 'compact' ? 'cardViewCompact' : 'cardViewDetails')}
        </label>
      ))}
    </fieldset>
  )
}
