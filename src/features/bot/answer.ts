import type { Lang } from '../../shared/i18n/types'
import { health } from '../editor/api'
import type { KnowledgeDoc, VideoLink } from './knowledge'
import { search } from './search'

export interface BotSource {
  title: string
  route: string
  videos: VideoLink[]
}

export interface BotAnswer {
  text: string
  sources: BotSource[]
  /** which model wrote it; undefined = plain site search */
  provider?: string
}

const WRITE = { 'X-Editor': '1', 'Content-Type': 'application/json' }

const excerpt = (s: string, n = 220) =>
  s.length <= n ? s : `${s.slice(0, n).replace(/\s+\S*$/, '')}…`

const toSource = (d: KnowledgeDoc): BotSource => ({
  title: d.title,
  route: d.route,
  videos: (d.videos ?? []).slice(0, 3),
})

/** Retrieval-only answer (works on the deployed site, with no model). `labels` are the localized sentences. */
export function searchAnswer(
  docs: KnowledgeDoc[],
  question: string,
  lang: Lang,
  labels: { found: string; nothing: string },
): BotAnswer {
  const results = search(docs, question, lang, 3)
  if (results.length === 0) return { text: labels.nothing, sources: [] }
  const lines = results.map((r) => `• ${r.doc.title} — ${excerpt(r.doc.text[lang])}`)
  return {
    text: `${labels.found}\n${lines.join('\n')}`,
    sources: results.map((r) => toSource(r.doc)),
  }
}

/** Asks the language model of the local backend, giving it the best passages of the site as the only context. */
export async function modelAnswer(
  docs: KnowledgeDoc[],
  question: string,
  lang: Lang,
  provider: string,
): Promise<BotAnswer> {
  const results = search(docs, question, lang, 6)
  if (results.length === 0) throw new Error('no context')
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: WRITE,
    body: JSON.stringify({
      question,
      lang,
      contexts: results.map((r) => ({
        title: r.doc.title,
        text: excerpt(r.doc.text[lang], 900),
        url: r.doc.route,
      })),
    }),
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok || body.ok === false || typeof body.answer !== 'string')
    throw new Error(body.error ?? `HTTP ${res.status}`)
  return { text: body.answer, sources: results.slice(0, 4).map((r) => toSource(r.doc)), provider }
}

export async function ask(
  docs: KnowledgeDoc[],
  question: string,
  lang: Lang,
  labels: { found: string; nothing: string },
): Promise<BotAnswer> {
  const h = await health()
  if (h.ai.enabled) {
    try {
      return await modelAnswer(docs, question, lang, h.ai.provider ?? 'model')
    } catch {
      // the model is optional: fall back to the site search
    }
  }
  return searchAnswer(docs, question, lang, labels)
}
