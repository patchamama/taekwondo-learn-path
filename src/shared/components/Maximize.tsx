import { useEffect, type ReactNode } from 'react'
import { useT } from '../i18n/useT'

/** Full-window overlay for clips and frames. Closes with Esc or the close button. */
export function MaximizeOverlay({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  const { t } = useT()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t('maximize')}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-3 sm:p-6"
    >
      <div className="mx-auto grid max-w-6xl gap-3 text-white">
        <button
          type="button"
          autoFocus
          onClick={onClose}
          className="justify-self-end rounded-lg bg-white px-3 py-1 text-sm font-semibold text-slate-900"
        >
          ✕ {t('close')}
        </button>
        <div className="grid gap-3 rounded-xl bg-white p-3 text-slate-900">{children}</div>
      </div>
    </div>
  )
}

export function MaximizeButton({ onClick }: { onClick: () => void }) {
  const { t } = useT()
  return (
    <button
      type="button"
      onClick={onClick}
      className="justify-self-start rounded-lg border px-2 py-0.5 text-sm"
    >
      ⛶ {t('maximize')}
    </button>
  )
}
