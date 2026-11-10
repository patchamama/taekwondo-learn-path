import { BELTS } from '../../data/belts'
import { CARD_BY_ID } from '../../data/cards'
import { CLIPS_BY_CARD, videoIdFor, resolveVideoLanguage, type Clip } from '../../data/clips'
import { KUKKIWON_BY_ID } from '../../data/kukkiwon'
import { levelContent } from '../../data/levelContent'
import { MORPHEME_BY_ID } from '../../data/morphemes'
import type { RuleSection } from '../../data/examRules'
import { UNITS } from '../../data/lessons'
import type { StringKey } from '../../shared/i18n/strings'
import type { Lang, Loc } from '../../shared/i18n/types'

export interface Ctx {
  lang: Lang
  t: (k: StringKey) => string
  loc: (l: Loc) => string
}

export type Block =
  { t: 'h1' | 'h2' | 'h3' | 'p' | 'li'; text: string } | { t: 'kv'; label: string; text: string }

export interface Doc {
  title: string
  blocks: Block[]
}

const SOURCE_ORDER = ['course', 'selfdefense', 'external'] as const

function clipLink(c: Clip, lang: Lang): string {
  const id = videoIdFor(c, resolveVideoLanguage('auto', lang))
  return `https://youtu.be/${id}?t=${c.start}`
}

function cardBlocks(cardId: string, ctx: Ctx): Block[] {
  const { t, loc, lang } = ctx
  const c = CARD_BY_ID[cardId]
  const out: Block[] = [{ t: 'h3', text: `${c.ko} ${c.hangul} – ${loc(c.meaning)}` }]
  if (c.info) out.push({ t: 'p', text: loc(c.info) })
  if (c.parts?.length)
    out.push({
      t: 'kv',
      label: t('breakdown'),
      text: c.parts
        .map((p) => `${p} (${MORPHEME_BY_ID[p] ? loc(MORPHEME_BY_ID[p].meaning) : p})`)
        .join(' + '),
    })
  if (c.karate) out.push({ t: 'kv', label: t('karate'), text: c.karate })
  const kk = KUKKIWON_BY_ID[cardId]
  if (kk)
    out.push({
      t: 'kv',
      label: t('kukkiwonShort'),
      text: `${kk.kukkiwon.split(' (')[0]} ${kk.kukkiwonHangul}`,
    })
  const clips = (CLIPS_BY_CARD[cardId] ?? [])
    .slice()
    .sort((a, b) => SOURCE_ORDER.indexOf(a.source) - SOURCE_ORDER.indexOf(b.source))
  for (const clip of clips) out.push({ t: 'li', text: `${t('watch')}: ${clipLink(clip, lang)}` })
  return out
}

function levelBlocks(index: number, ctx: Ctx): Block[] {
  const { t, loc } = ctx
  const belt = BELTS[index]
  const c = levelContent(index)
  const unit = UNITS.find((u) => u.earns === belt.id)
  const out: Block[] = [{ t: 'h1', text: `${belt.rank} · ${loc(belt.name)}` }]
  if (unit) out.push({ t: 'p', text: loc(unit.title) })
  const group = (key: StringKey, ids: string[]) => {
    if (!ids.length) return
    out.push({ t: 'h2', text: t(key) })
    for (const id of ids) out.push(...cardBlocks(id, ctx))
  }
  const techs = c.techniques.map((x) => x.id)
  const by = (g: string) => techs.filter((id) => CARD_BY_ID[id].group.includes(g))
  group(
    'studyWords',
    c.morphemes.map((x) => x.id),
  )
  group('catHand', by('hand'))
  group('catFoot', by('foot'))
  group('catStance', by('stance'))
  group('catCombo', by('combo'))
  group(
    'studyTerms',
    c.terms.map((x) => x.id),
  )
  group(
    'navForms',
    c.forms.map((x) => x.id),
  )
  const listed = new Set(['hand', 'foot', 'stance', 'combo'].flatMap(by))
  group(
    'studyOther',
    techs.filter((id) => !listed.has(id)),
  )
  if (c.theory.length) {
    out.push({ t: 'h2', text: t('studyTheory') })
    for (const th of c.theory) out.push({ t: 'kv', label: loc(th.question), text: loc(th.correct) })
  }
  return out
}

/** One belt, or every belt when `index` is null. */
export function buildLevelDoc(index: number | null, ctx: Ctx): Doc {
  if (index !== null) {
    const blocks = levelBlocks(index, ctx)
    return { title: ctx.t('studyTitle') + ' – ' + BELTS[index].rank, blocks }
  }
  return {
    title: ctx.t('studyTitle'),
    blocks: BELTS.flatMap((_, i) => levelBlocks(i, ctx)),
  }
}

export function buildSectionsDoc(title: string, sections: RuleSection[], ctx: Ctx): Doc {
  const blocks: Block[] = []
  for (const s of sections) {
    blocks.push({ t: 'h2', text: ctx.loc(s.title) })
    for (const b of s.bullets ?? []) blocks.push({ t: 'li', text: ctx.loc(b) })
    for (const r of s.rows ?? [])
      blocks.push({ t: 'kv', label: ctx.loc(r.label), text: ctx.loc(r.value) })
  }
  return { title, blocks }
}

export function toMarkdown(doc: Doc): string {
  const lines: string[] = []
  // the document title is a level-1 heading only when the first block is not one already
  if (doc.blocks[0]?.t !== 'h1') lines.push(`# ${doc.title}`, '')
  for (const b of doc.blocks) {
    if (b.t === 'h1') lines.push('', `# ${b.text}`, '')
    else if (b.t === 'h2') lines.push('', `## ${b.text}`, '')
    else if (b.t === 'h3') lines.push('', `### ${b.text}`, '')
    else if (b.t === 'li') lines.push(`- ${b.text}`)
    else if (b.t === 'kv') lines.push(`- **${b.label}:** ${b.text}`)
    else lines.push(b.text, '')
  }
  return (
    lines
      .join('\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  )
}

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const linkify = (s: string) => esc(s).replace(/(https:\/\/[^\s<]+)/g, '<a href="$1">$1</a>')

/** Standalone HTML used for the PDF (browser print) export. */
export function toHtml(doc: Doc, lang: Lang = 'en'): string {
  const body = doc.blocks
    .map((b) => {
      if (b.t === 'h1') return `<h1>${esc(b.text)}</h1>`
      if (b.t === 'h2') return `<h2>${esc(b.text)}</h2>`
      if (b.t === 'h3') return `<h3>${esc(b.text)}</h3>`
      if (b.t === 'li') return `<ul><li>${linkify(b.text)}</li></ul>`
      if (b.t === 'kv') return `<p><b>${esc(b.label)}:</b> ${linkify(b.text)}</p>`
      return `<p>${linkify(b.text)}</p>`
    })
    .join('\n')
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><title>${esc(doc.title)}</title>
<style>body{font-family:system-ui,'Apple SD Gothic Neo','Noto Sans KR',sans-serif;max-width:46rem;margin:2rem auto;padding:0 1rem;line-height:1.45}
h1{page-break-before:always;font-size:1.6rem}h1:first-of-type{page-break-before:auto}h2{border-bottom:1px solid #ccc;font-size:1.2rem}h3{margin-bottom:.2rem;page-break-after:avoid}
p{margin:.25rem 0}ul{margin:.1rem 0;padding-left:1.2rem}a{color:#1d4ed8;word-break:break-all}</style></head>
<body><h1>${esc(doc.title)}</h1>${body}</body></html>`
}
