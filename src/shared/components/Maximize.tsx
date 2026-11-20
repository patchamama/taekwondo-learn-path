import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useT } from '../i18n/useT'

const triggerSelector = '[data-maximize-trigger]'
const controlSelector = 'button, a[href], input, select, textarea, iframe, [tabindex]'

function tabStops(dialog: HTMLElement) {
  return Array.from(dialog.querySelectorAll<HTMLElement>(controlSelector)).filter((node) => {
    if (node.tabIndex < 0 || node.matches(':disabled') || node.closest('[hidden], [inert]')) {
      return false
    }
    // Do not use layout rectangles: JSDOM has no layout, and visible controls still work there.
    if (getComputedStyle(node).visibility !== 'visible') return false
    for (let ancestor: HTMLElement | null = node; ancestor; ancestor = ancestor.parentElement) {
      if (getComputedStyle(ancestor).display === 'none') return false
      if (ancestor === dialog) break
    }
    return true
  })
}

function captureFocusReturn() {
  const opener = document.activeElement
  // Existing consumers replace their entire inline subtree with the overlay. Record the
  // trigger's ordinal in each ancestor before that DOM is removed, not just a stale node.
  const slots: { parent: HTMLElement; index: number }[] = []
  if (opener instanceof HTMLElement && opener.matches(triggerSelector)) {
    for (let parent = opener.parentElement; parent; parent = parent.parentElement) {
      slots.push({
        parent,
        index: Array.from(parent.querySelectorAll(triggerSelector)).indexOf(opener),
      })
    }
  }
  return () => {
    if (opener instanceof HTMLElement && opener.isConnected) {
      opener.focus()
      return
    }
    const slot = slots.find(({ parent }) => parent.isConnected)
    slot?.parent.querySelectorAll<HTMLElement>(triggerSelector)[slot.index]?.focus()
  }
}

/** Full-window overlay for clips and frames. Closes with Esc or the close button. */
export function MaximizeOverlay({
  children,
  onClose,
}: {
  children: ReactNode
  onClose: () => void
}) {
  const { t } = useT()
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  // Capture before commit removes the opener and moves focus into the dialog.
  const [restoreFocus] = useState(captureFocusReturn)
  useEffect(() => {
    closeRef.current?.focus()
    return restoreFocus
  }, [restoreFocus])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      const dialog = dialogRef.current
      if (e.key !== 'Tab' || !dialog) return
      const stops = tabStops(dialog)
      const index = stops.indexOf(document.activeElement as HTMLElement)
      const next = index < 0 ? (e.shiftKey ? stops.length - 1 : 0)
        : (index + (e.shiftKey ? -1 : 1) + stops.length) % stops.length
      e.preventDefault()
      ;(stops[next] ?? dialog).focus()
    }
    const onFocus = (e: FocusEvent) => {
      const dialog = dialogRef.current
      if (dialog && e.target instanceof Node && !dialog.contains(e.target)) {
        ;(tabStops(dialog)[0] ?? dialog).focus()
      }
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('focusin', onFocus)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('focusin', onFocus)
    }
  }, [onClose])
  return (
    <div
      ref={dialogRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={t('maximize')}
      className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-3 sm:p-6"
    >
      <div className="mx-auto grid max-w-6xl gap-3 text-white">
        <button
          type="button"
          ref={closeRef}
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
      data-maximize-trigger=""
      className="justify-self-start rounded-lg border px-2 py-0.5 text-sm"
    >
      ⛶ {t('maximize')}
    </button>
  )
}
