import type { Doc } from './document'
import { toHtml, toMarkdown } from './document'
import type { Lang } from '../../shared/i18n/types'

function save(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export const slug = (s: string) =>
  s
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase() || 'taekwondo'

export function downloadMarkdown(doc: Doc) {
  save(
    new Blob([toMarkdown(doc)], { type: 'text/markdown;charset=utf-8' }),
    `${slug(doc.title)}.md`,
  )
}

/** Real .docx (docx library, loaded on demand). */
export async function downloadWord(doc: Doc) {
  const { Document, ExternalHyperlink, HeadingLevel, Packer, Paragraph, TextRun } =
    await import('docx')
  const urlRe = /(https:\/\/\S+)/g
  const runs = (text: string, bold = false) =>
    text.split(urlRe).map((part) =>
      part.startsWith('https://')
        ? new ExternalHyperlink({
            link: part,
            children: [new TextRun({ text: part, style: 'Hyperlink' })],
          })
        : new TextRun({ text: part, bold }),
    )
  const heading = {
    h1: HeadingLevel.HEADING_1,
    h2: HeadingLevel.HEADING_2,
    h3: HeadingLevel.HEADING_3,
  } as const
  const children = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun(doc.title)] }),
    ...doc.blocks.map((b) => {
      if (b.t === 'h1' || b.t === 'h2' || b.t === 'h3')
        return new Paragraph({ heading: heading[b.t], children: [new TextRun(b.text)] })
      if (b.t === 'li') return new Paragraph({ bullet: { level: 0 }, children: runs(b.text) })
      if (b.t === 'kv')
        return new Paragraph({
          children: [new TextRun({ text: `${b.label}: `, bold: true }), ...runs(b.text)],
        })
      return new Paragraph({ children: runs(b.text) })
    }),
  ]
  const blob = await Packer.toBlob(new Document({ sections: [{ children }] }))
  save(blob, `${slug(doc.title)}.docx`)
}

/** PDF through the browser's print dialog ("Save as PDF"): keeps hangul rendering correct. */
export function printPdf(doc: Doc, lang: Lang): boolean {
  const w = window.open('', '_blank')
  if (!w) return false
  w.document.open()
  w.document.write(toHtml(doc, lang))
  w.document.close()
  w.focus()
  setTimeout(() => w.print(), 300)
  return true
}
