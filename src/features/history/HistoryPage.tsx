import { useT } from '../../shared/i18n/useT'

export function HistoryPage() {
  const { t } = useT()
  return (
    <section>
      <h1 className="mb-2 text-2xl font-bold">{t('historyTitle')}</h1>
      <p className="text-slate-600">{t('placeholder')}</p>
    </section>
  )
}
