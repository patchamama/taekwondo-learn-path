import { BELTS } from '../../data/belts'
import type { KnowledgeDoc } from './knowledge'

export interface PackFile {
  name: string
  content: string
}

const link = (base: string, route: string) => `${base.replace(/\/?$/, '/')}#${route}`

const header = (title: string, intro: string) => `# ${title}\n\n${intro}\n\n`

const INTRO =
  'Taekwondo Learn is a free course (Kukkiwon/WT style, with notes on ITF) with Korean terms, techniques, forms, history and exams, in English, German and Spanish. ' +
  'The links point to the matching page of the site and to the videos (with the start time).'

function entry(d: KnowledgeDoc, base: string): string {
  const lines = [`### ${d.title}`, `- **EN:** ${d.text.en}`, `- **DE:** ${d.text.de}`, `- **ES:** ${d.text.es}`, `- Page: ${link(base, d.route)}`]
  if (d.videos?.length) lines.push(`- Videos: ${d.videos.map((v) => `[${v.label}](${v.url})`).join(' · ')}`)
  return lines.join('\n')
}

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

/**
 * Markdown sources to upload to NotebookLM so it can answer from the same content as the site: one file per
 * Kup plus concepts, history, background facts, theory questions and an index of the videos.
 */
export function buildPack(docs: KnowledgeDoc[], base: string): PackFile[] {
  const files: PackFile[] = []
  const cards = docs.filter((d) => d.kind === 'card')

  BELTS.forEach((belt, i) => {
    const inBelt = cards.filter((d) => d.belt === i)
    if (inBelt.length === 0) return
    files.push({
      name: `techniques-and-terms-${String(i).padStart(2, '0')}-${slug(belt.rank)}.md`,
      content: header(`Taekwondo Learn — techniques and terms for ${belt.rank}`, INTRO) + inBelt.map((d) => entry(d, base)).join('\n\n') + '\n',
    })
  })

  const section = (name: string, title: string, kind: KnowledgeDoc['kind']) => {
    const list = docs.filter((d) => d.kind === kind)
    files.push({ name, content: header(`Taekwondo Learn — ${title}`, INTRO) + list.map((d) => entry(d, base)).join('\n\n') + '\n' })
  }
  section('concepts.md', 'concepts and training readings', 'concept')
  section('history.md', 'history of Taekwondo', 'history')
  section('background.md', 'background facts', 'fact')
  section('theory.md', 'theory questions and answers', 'theory')

  const withVideos = cards.filter((d) => d.videos?.length)
  files.push({
    name: 'videos-index.md',
    content:
      header('Taekwondo Learn — video index', `${INTRO}\n\nEvery technique that has a video, with the link to the exact moment.`) +
      withVideos.map((d) => `- **${d.title}** (${d.text.en.split(' — ')[0]}): ${d.videos!.map((v) => `[${v.label}](${v.url})`).join(' · ')}`).join('\n') +
      '\n',
  })
  return files
}
