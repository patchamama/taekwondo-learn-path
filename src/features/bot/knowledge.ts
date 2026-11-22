import { CARDS } from '../../data/cards'
import { BACKGROUND } from '../../data/background'
import { CLIPS_BY_CARD, COURSE_VIDEOS, SELF_DEFENSE_VIDEO } from '../../data/clips'
import { CONCEPTS } from '../../data/concepts'
import { bookSynonym } from '../../data/bookSpelling'
import { cardBeltIndex } from '../../data/levels'
import { THEORY } from '../../data/theory'
import { HISTORY_CONTEXT, TIMELINE } from '../history/timeline'
import type { Loc } from '../../shared/i18n/types'

export interface VideoLink {
  label: string
  url: string
}

export interface KnowledgeDoc {
  id: string
  kind: 'card' | 'concept' | 'history' | 'fact' | 'theory'
  title: string
  /** short names (romanization, hangul, meanings, book spelling) that count as the title when searching */
  names: string[]
  text: Loc
  /** route inside the app (HashRouter path) */
  route: string
  /** belt index (0 = 10 Kup … 10 = 1 Dan) for cards */
  belt?: number
  videos?: VideoLink[]
}

const yt = (id: string, start: number) =>
  `https://www.youtube.com/watch?v=${id}&t=${Math.floor(start)}s`

/** Where to watch a technique: the course dubs, the self-defence compilation or the external clip. */
export function videosOf(cardId: string): VideoLink[] {
  return (CLIPS_BY_CARD[cardId] ?? []).flatMap((c) => {
    if (c.source === 'course') {
      return [
        { label: 'Course (ES)', url: yt(COURSE_VIDEOS.es, c.start) },
        { label: 'Course (DE)', url: yt(COURSE_VIDEOS.de, c.start) },
      ]
    }
    if (c.source === 'selfdefense')
      return [{ label: 'Self-defence', url: yt(SELF_DEFENSE_VIDEO, c.start) }]
    return c.videoId ? [{ label: c.label ?? 'Video', url: yt(c.videoId, c.start) }] : []
  })
}

const join = (parts: Loc[]): Loc => ({
  en: parts.map((p) => p.en).join(' '),
  de: parts.map((p) => p.de).join(' '),
  es: parts.map((p) => p.es).join(' '),
})

/** Everything the site teaches, as searchable documents (also the source of the NotebookLM pack). */
export function buildKnowledge(): KnowledgeDoc[] {
  const docs: KnowledgeDoc[] = []
  for (const c of CARDS) {
    const book0 = c.kind === 'technique' ? bookSynonym(c.id) : null
    const text: Loc = {
      en: [c.meaning.en, c.info?.en].filter(Boolean).join(' — '),
      de: [c.meaning.de, book0?.de, c.info?.de].filter(Boolean).join(' — '),
      es: [c.meaning.es, c.info?.es].filter(Boolean).join(' — '),
    }
    const book = c.kind === 'technique' ? bookSynonym(c.id) : null
    docs.push({
      id: `card:${c.id}`,
      kind: 'card',
      title: `${c.ko} ${c.hangul}`,
      names: [
        c.ko,
        c.hangul,
        c.meaning.en,
        c.meaning.de,
        c.meaning.es,
        ...(book ? [book.spelling, ...(book.de ? [book.de] : [])] : []),
      ],
      text,
      route: `/study/${cardBeltIndex(c.id)}`,
      belt: cardBeltIndex(c.id),
      videos: videosOf(c.id),
    })
  }
  for (const c of CONCEPTS)
    docs.push({
      id: `concept:${c.id}`,
      kind: 'concept',
      title: c.title.en,
      names: [c.title.en, c.title.de, c.title.es],
      text: join([c.title, ...c.paragraphs]),
      route: `/concepts#${c.id}`,
    })
  TIMELINE.forEach((e, i) =>
    docs.push({
      id: `history:event-${i}`,
      kind: 'history',
      title: e.year,
      names: [e.year],
      text: e.text,
      route: '/history',
    }),
  )
  for (const t of HISTORY_CONTEXT)
    docs.push({
      id: `history:${t.id}`,
      kind: 'history',
      title: t.title.en,
      names: [t.title.en, t.title.de, t.title.es],
      text: join([t.title, ...t.paragraphs]),
      route: '/history',
    })
  for (const f of BACKGROUND)
    docs.push({
      id: `fact:${f.id}`,
      kind: 'fact',
      title: f.title.en,
      names: [f.title.en, f.title.de, f.title.es],
      text: join([f.title, f.text]),
      route: '/background',
    })
  for (const t of THEORY) {
    docs.push({
      id: `theory:${t.id}`,
      kind: 'theory',
      title: t.question.en,
      names: [t.question.en, t.question.de, t.question.es],
      text: {
        en: `${t.question.en} ${t.correct.en}`,
        de: `${t.question.de} ${t.correct.de}`,
        es: `${t.question.es} ${t.correct.es}`,
      },
      route: '/exam',
    })
  }
  return docs
}
