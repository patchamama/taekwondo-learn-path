import { describe, expect, it } from 'vitest'
import { BELTS } from '../../data/belts'
import { buildLevelDoc, buildSectionsDoc, toHtml, toMarkdown } from './document'
import { EXAM_RULES } from '../../data/examRules'
import { STRINGS } from '../../shared/i18n/strings'
import type { StringKey } from '../../shared/i18n/strings'
import type { Loc } from '../../shared/i18n/types'

const ctx = (lang: 'en' | 'de' | 'es') => ({
  lang,
  t: (k: StringKey) => STRINGS[k][lang],
  loc: (l: Loc) => l[lang],
})

describe('reading document export', () => {
  it('builds a level document with techniques, theory and video links', () => {
    const doc = buildLevelDoc(1, ctx('en'))
    const md = toMarkdown(doc)
    expect(md).toContain('# 9 Kup')
    expect(md).toContain('olgul-macki')
    expect(md).toMatch(/https:\/\/youtu\.be\/\S+\?t=\d+/)
    expect(md).toContain('## Theory')
  })

  it('uses the selected language', () => {
    const md = toMarkdown(buildLevelDoc(1, ctx('es')))
    expect(md).toContain('Bloqueo alto')
    expect(md).not.toContain('High (rising) block')
  })

  it('exports one document for all belts', () => {
    const md = toMarkdown(buildLevelDoc(null, ctx('en')))
    for (const b of BELTS) expect(md).toContain(b.rank)
  })

  it('exports fact sections and escapes HTML', () => {
    const doc = buildSectionsDoc('Exam <rules>', EXAM_RULES, ctx('en'))
    expect(toMarkdown(doc)).toContain('## Scoring')
    const html = toHtml(doc)
    expect(html).toContain('Exam &lt;rules&gt;')
    expect(html).toContain('<html')
  })
})

describe('docx export', () => {
  it('produces a valid zip (.docx) for a whole level', async () => {
    const { Document, Packer, Paragraph, TextRun } = await import('docx')
    const doc = buildLevelDoc(1, ctx('en'))
    const buf = await Packer.toBuffer(
      new Document({
        sections: [
          { children: doc.blocks.map((b) => new Paragraph({ children: [new TextRun(b.text)] })) },
        ],
      }),
    )
    expect(buf.subarray(0, 2).toString()).toBe('PK')
    expect(buf.length).toBeGreaterThan(2000)
  })
})
