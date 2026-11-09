import pkg from '../../../package.json'
import { useT } from '../i18n/useT'

export function Banner() {
  const { t } = useT()
  return (
    <div
      className="bg-slate-900 px-4 py-1 text-center text-xs text-slate-300"
      data-testid="version-banner"
    >
      {t('version')} v{pkg.version}
    </div>
  )
}
