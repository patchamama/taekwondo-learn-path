import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useT } from '../../shared/i18n/useT'
import { LANGS } from '../../shared/i18n/types'
import { buildKnowledge, type KnowledgeDoc } from '../bot/knowledge'
import { search } from '../bot/search'
import { searchCopy } from './copy'

const KINDS: KnowledgeDoc['kind'][] = ['card', 'concept', 'history', 'fact', 'theory']
const focusStyle = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600'

function SearchDialog({ onClose }: { onClose: () => void }) {
  const { lang } = useT()
  const copy = searchCopy[lang]
  const id = useId()
  const dialog = useRef<HTMLDivElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  // Build only on opening; reuse the existing corpus and its language-aware ranking unchanged.
  const [docs] = useState(buildKnowledge)
  const results = useMemo(() => search(docs, query, lang, docs.length), [docs, query, lang])

  useEffect(() => {
    const opener = document.activeElement
    input.current?.focus()
    const controls = () => Array.from(dialog.current?.querySelectorAll<HTMLElement>(
      'input, button:not(:disabled), a[href]',
    ) ?? [])
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
      }
      if (event.key !== 'Tab') return
      const stops = controls()
      const index = stops.indexOf(document.activeElement as HTMLElement)
      const next = (index + (event.shiftKey ? -1 : 1) + stops.length) % stops.length
      event.preventDefault()
      stops[next]?.focus()
    }
    const onFocus = (event: FocusEvent) => {
      if (event.target instanceof Node && !dialog.current?.contains(event.target)) input.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('focusin', onFocus)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('focusin', onFocus)
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-3 sm:p-6">
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} aria-describedby={`${id}-scope`}
        className="grid max-h-[calc(100dvh-1.5rem)] w-full max-w-2xl grid-rows-[auto_auto_minmax(0,1fr)_auto] rounded-2xl bg-white text-slate-900 shadow-xl sm:max-h-[calc(100dvh-3rem)]">
        <header className="grid gap-2 border-b p-4">
          <h2 id={`${id}-title`} className="text-lg font-bold">{copy.title}</h2>
          <p id={`${id}-scope`} className="text-sm text-slate-600">{copy.scope}</p>
        </header>
        <div className="grid gap-2 p-4">
          <label htmlFor={`${id}-query`} className="text-sm font-semibold">{copy.query}</label>
          <input ref={input} id={`${id}-query`} type="text" value={query}
            onChange={(event) => setQuery(event.target.value)}
            className={`min-h-11 w-full min-w-0 rounded-lg border border-slate-400 px-3 ${focusStyle}`} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p role="status" className="text-sm text-slate-600">
              {!query.trim() ? copy.empty : results.length === 0 ? copy.nothing : `${copy.results}: ${results.length}`}
            </p>
            {query && <button type="button" onClick={() => { setQuery(''); input.current?.focus() }}
              className={`min-h-11 rounded-lg border px-3 text-sm ${focusStyle}`}>{copy.clear}</button>}
          </div>
        </div>
        <div className="min-h-0 overflow-y-auto px-4">
          {KINDS.map((kind) => {
            const matches = results.filter(({ doc }) => doc.kind === kind)
            if (!matches.length) return null
            return <section key={kind} aria-labelledby={`${id}-${kind}`} className="mb-5">
              <h3 id={`${id}-${kind}`} className="mb-2 font-bold text-slate-700">{copy.sections[kind]}</h3>
              <ul className="divide-y divide-slate-200">
                {matches.map(({ doc }) => <li key={doc.id}>
                  <Link to={doc.route} onClick={(event) => {
                    if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) onClose()
                  }} className={`block break-words rounded-lg px-2 py-3 hover:bg-sky-50 ${focusStyle}`}>
                    <span className="font-semibold text-sky-800 underline">
                      {doc.kind === 'card' ? doc.title : doc.names[LANGS.indexOf(lang)] ?? doc.title}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-sm text-slate-600">{doc.text[lang]}</span>
                  </Link>
                </li>)}
              </ul>
            </section>
          })}
        </div>
        <footer className="flex justify-end border-t p-3">
          <button type="button" onClick={onClose} className={`min-h-11 rounded-lg border px-4 font-semibold ${focusStyle}`}>
            {copy.close}
          </button>
        </footer>
      </div>
    </div>, document.body,
  )
}

/** Global navigation action; no backend, bot session, or persisted search state. */
export function GlobalSearch() {
  const { lang } = useT()
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return <>
    <button type="button" aria-label={searchCopy[lang].title} title={searchCopy[lang].title}
      aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}
      className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 ${focusStyle}`}>
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="10.5" cy="10.5" r="6.5" />
        <path strokeLinecap="round" d="m16 16 5 5" />
      </svg>
    </button>
    {open && <SearchDialog onClose={close} />}
  </>
}
