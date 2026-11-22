import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../../shared/i18n/useT'
import { ask, type BotAnswer } from './answer'
import { NOTEBOOK_URL } from './config'
import type { KnowledgeDoc } from './knowledge'

type Message = { from: 'user'; text: string } | { from: 'bot'; answer: BotAnswer }

/** Floating assistant: answers from the content of the site (and from a language model when the local backend has one). */
export function ChatBot() {
  const { t, lang } = useT()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const docs = useRef<KnowledgeDoc[] | null>(null)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => {
    end.current?.scrollIntoView?.({ block: 'end' })
  }, [messages, busy])

  const send = async (e: React.FormEvent) => {
    e.preventDefault()
    const question = input.trim()
    if (!question || busy) return
    setInput('')
    setMessages((m) => [...m, { from: 'user', text: question }])
    setBusy(true)
    // the index is built on first use so the page does not pay for it until someone asks
    docs.current ??= (await import('./knowledge')).buildKnowledge()
    const answer = await ask(docs.current, question, lang, {
      found: t('botFound'),
      nothing: t('botNothing'),
    })
    setMessages((m) => [...m, { from: 'bot', answer }])
    setBusy(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        aria-label={t('botOpen')}
        title={t('botOpen')}
        onClick={() => setOpen(true)}
        className="fixed bottom-3 right-3 z-30 grid h-11 w-11 place-items-center rounded-full border bg-white text-slate-600 shadow hover:bg-slate-50"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h16v11H9l-5 4V5Z" />
        </svg>
      </button>
    )
  }

  return (
    <section
      role="dialog"
      aria-label={t('botTitle')}
      className="fixed bottom-3 right-3 z-40 flex max-h-[80vh] w-[min(24rem,calc(100vw-1.5rem))] flex-col rounded-2xl border bg-white shadow-xl"
    >
      <header className="flex items-center justify-between border-b px-4 py-2">
        <h2 className="font-semibold">{t('botTitle')}</h2>
        <button
          type="button"
          aria-label={t('close')}
          onClick={() => setOpen(false)}
          className="rounded-full border px-2"
        >
          ✕
        </button>
      </header>

      <div className="grid flex-1 gap-3 overflow-y-auto px-4 py-3 text-sm" aria-live="polite">
        <p className="text-slate-500">{t('botIntro')}</p>
        {messages.map((m, i) =>
          m.from === 'user' ? (
            <p key={i} className="ml-8 rounded-xl bg-slate-900 px-3 py-2 text-white">
              {m.text}
            </p>
          ) : (
            <div key={i} className="mr-4 grid gap-2 rounded-xl bg-slate-100 px-3 py-2">
              <p className="whitespace-pre-wrap">{m.answer.text}</p>
              {m.answer.sources.length > 0 && (
                <ul className="flex flex-wrap gap-1.5">
                  {m.answer.sources.map((s) => (
                    <li key={s.route + s.title} className="flex flex-wrap items-center gap-1">
                      <Link
                        to={s.route}
                        className="rounded-full border bg-white px-2 py-0.5 text-xs underline"
                        onClick={() => setOpen(false)}
                      >
                        {t('botOpenItem')}: {s.title}
                      </Link>
                      {s.videos.map((v) => (
                        <a
                          key={v.url}
                          href={v.url}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full border bg-white px-2 py-0.5 text-xs underline"
                        >
                          ▶ {v.label}
                        </a>
                      ))}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-slate-500">
                {m.answer.provider
                  ? t('botModel').replace('{provider}', m.answer.provider)
                  : t('botSearchMode')}
              </p>
            </div>
          ),
        )}
        {busy && <p className="text-slate-500">{t('botThinking')}</p>}
        <div ref={end} />
      </div>

      <form onSubmit={send} className="flex gap-2 border-t px-3 py-2">
        <input
          aria-label={t('botQuestion')}
          placeholder={t('botPlaceholder')}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-w-0 flex-1 rounded border px-2 py-1"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-lg bg-slate-900 px-3 py-1 text-white disabled:opacity-50"
        >
          {t('botSend')}
        </button>
      </form>
      <footer className="border-t px-4 py-2 text-xs">
        <a href={NOTEBOOK_URL} target="_blank" rel="noreferrer" className="underline">
          {t('botNotebook')} ↗
        </a>
      </footer>
    </section>
  )
}
