import { useState } from 'react'
import { useT } from '../../shared/i18n/useT'
import { CardEditor } from './CardEditor'
import { useEditor } from './useEditor'

/** Pencil that opens the card editor. Only rendered when the local editor backend is running. */
export function EditButton({ cardId }: { cardId: string }) {
  const { t } = useT()
  const on = useEditor()
  const [open, setOpen] = useState(false)
  if (!on) return null
  return (
    <>
      <button
        type="button"
        aria-label={t('edEdit')}
        title={t('edEdit')}
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        className="rounded-full border bg-white px-1.5 text-xs hover:bg-slate-100"
      >
        ✎
      </button>
      {open && <CardEditor cardId={cardId} onClose={() => setOpen(false)} />}
    </>
  )
}
