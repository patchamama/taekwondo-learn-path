import type { KnowledgeDoc } from './knowledge'
import type { Lang } from '../../shared/i18n/types'

const strip = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

export const tokenize = (s: string): string[] =>
  strip(s)
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length >= 2)

/** Question words that carry no content (English, German, Spanish); dropped from the query only. */
const STOP = new Set(
  (
    'what is are the a an of in on to for how why when who which does do can about tell me and or ' +
    'was ist sind der die das ein eine einen einem von zu fur wie warum wann wer welche kann ueber und oder mir ' +
    'que es son el la los las un una de del en para como por cuando quien cual cuales puede sobre dime y o'
  ).split(' '),
)

interface Indexed {
  doc: KnowledgeDoc
  /** weighted term frequencies: title ×3, text in the app language ×1.5, text in the others ×1 */
  tf: Map<string, number>
  len: number
  /** token sets of the short names, to reward an exact match */
  names: Set<string>[]
}

interface Built {
  items: Indexed[]
  idf: Map<string, number>
  avg: number
}

const cache = new WeakMap<KnowledgeDoc[], Map<Lang, Built>>()

function index(docs: KnowledgeDoc[], lang: Lang): Built {
  const byLang = cache.get(docs) ?? new Map<Lang, Built>()
  cache.set(docs, byLang)
  const hit = byLang.get(lang)
  if (hit) return hit
  const items: Indexed[] = docs.map((doc) => {
    const tf = new Map<string, number>()
    const add = (text: string, w: number) => {
      for (const t of tokenize(text)) tf.set(t, (tf.get(t) ?? 0) + w)
    }
    add(doc.title, 3)
    for (const n of doc.names) add(n, 3)
    for (const l of ['en', 'de', 'es'] as const) add(doc.text[l], l === lang ? 1.5 : 1)
    return {
      doc,
      tf,
      len: [...tf.values()].reduce((a, b) => a + b, 0),
      names: [doc.title, ...doc.names].map((n) => new Set(tokenize(n))),
    }
  })
  const df = new Map<string, number>()
  for (const it of items) for (const t of it.tf.keys()) df.set(t, (df.get(t) ?? 0) + 1)
  const n = items.length
  const idf = new Map([...df].map(([t, d]) => [t, Math.log(1 + (n - d + 0.5) / (d + 0.5))]))
  const built = { items, idf, avg: items.reduce((a, b) => a + b.len, 0) / Math.max(1, n) }
  byLang.set(lang, built)
  return built
}

/** BM25-style ranking over all three languages at once, so a question in any language finds the content. */
export function search(
  docs: KnowledgeDoc[],
  query: string,
  lang: Lang,
  limit = 5,
): { doc: KnowledgeDoc; score: number }[] {
  const all = [...new Set(tokenize(query))]
  const content = all.filter((t) => !STOP.has(t))
  const q = content.length > 0 ? content : all
  if (q.length === 0) return []
  const { items, idf, avg } = index(docs, lang)
  const k1 = 1.2
  const b = 0.75
  const scored = items
    .map(({ doc, tf, len, names }) => {
      let score = 0
      for (const t of q) {
        const f = tf.get(t)
        if (!f) continue
        score += (idf.get(t) ?? 0) * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * len) / avg)))
      }
      // asking for a name exactly (in any language) beats a longer text that merely mentions it
      if (score > 0 && names.some((n) => n.size === q.length && q.every((t) => n.has(t))))
        score += 8
      return { doc, score }
    })
    .filter((r) => r.score > 0)
  return scored.sort((a, b2) => b2.score - a.score).slice(0, limit)
}
