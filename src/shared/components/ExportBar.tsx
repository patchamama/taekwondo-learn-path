import { useState } from 'react'
import type { Doc } from '../../features/export/document'
import { downloadMarkdown, downloadWord, printPdf } from '../../features/export/download'
import { useT } from '../i18n/useT'

/** Export buttons for a reading document: Markdown, Word (.docx) and PDF (print dialog). */
export function ExportBar({ build, label }: { build: () => Doc; label?: string }) {
  const { t, lang } = useT()
  const title = `${t('exportLabel')}${label ? ` · ${label}` : ''}`
  const [msg, setMsg] = useState('')
  const btn = 'rounded-lg border bg-white px-3 py-1 text-sm hover:bg-slate-50'
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={title}>
      <span className="text-sm font-semibold">{title}:</span>
      <button className={btn} onClick={() => downloadMarkdown(build())}>
        Markdown
      </button>
      <button className={btn} onClick={() => void downloadWord(build())}>
        Word
      </button>
      <button
        className={btn}
        onClick={() => setMsg(printPdf(build(), lang) ? t('exportPdfHint') : t('exportPopup'))}
      >
        PDF
      </button>
      {msg && (
        <span role="status" className="text-xs text-slate-600">
          {msg}
        </span>
      )}
    </div>
  )
}
