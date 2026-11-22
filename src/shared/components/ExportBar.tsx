import { useState, type ReactNode } from 'react'
import type { Doc } from '../../features/export/document'
import { downloadMarkdown, downloadWord, printPdf } from '../../features/export/download'
import { useT } from '../i18n/useT'

function FileIcon({ format }: { format: 'Markdown' | 'Word' | 'PDF' }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M14 2H5v20h14V7z M14 2v5h5" />
      {format === 'Markdown' ? <path d="M7 16v-5l2.5 3 2.5-3v5 M16 11v6m-2-2 2 2 2-2" />
        : format === 'Word' ? <path d="m7 11 1.5 6 3-5 3 5 1.5-6" />
          : <path d="M8 17c5-1 7-1 8 0-2 2-5-6-4-7 2-1-1 8-4 7Z" />}
    </svg>
  )
}

/** Export buttons for a reading document; compact and scope are opt-in for Study. */
export function ExportBar({ build, label, compact = false, scope }: {
  build: () => Doc
  label?: string
  compact?: boolean
  scope?: ReactNode
}) {
  const { t, lang } = useT()
  const title = `${t('exportLabel')}${label ? ` · ${label}` : ''}`
  const [msg, setMsg] = useState('')
  const btn = 'rounded-lg border bg-white px-3 py-1 text-sm hover:bg-slate-50'
  const iconBtn = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border bg-white hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600'
  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={title}>
      <span className={`text-sm font-semibold ${compact && scope ? 'sr-only' : ''}`}>{title}:</span>
      {scope}
      <button className={compact ? iconBtn : btn} aria-label={compact ? 'Markdown' : undefined} title={compact ? 'Markdown' : undefined} onClick={() => downloadMarkdown(build())}>
        {compact ? <FileIcon format="Markdown" /> : 'Markdown'}
      </button>
      <button className={compact ? iconBtn : btn} aria-label={compact ? 'Word' : undefined} title={compact ? 'Word' : undefined} onClick={() => void downloadWord(build())}>
        {compact ? <FileIcon format="Word" /> : 'Word'}
      </button>
      <button
        className={compact ? iconBtn : btn}
        aria-label={compact ? 'PDF' : undefined}
        title={compact ? 'PDF' : undefined}
        onClick={() => setMsg(printPdf(build(), lang) ? t('exportPdfHint') : t('exportPopup'))}
      >
        {compact ? <FileIcon format="PDF" /> : 'PDF'}
      </button>
      {msg && (
        <span role="status" className="text-xs text-slate-600">
          {msg}
        </span>
      )}
    </div>
  )
}
