import { describe, expect, it } from 'vitest'
import { buildKnowledge } from './knowledge'
import { buildPack } from './pack'

const BASE = 'https://example.github.io/taekwondo-learn-path/'
const files = buildPack(buildKnowledge(), BASE)
const byName = (re: RegExp) => files.filter((f) => re.test(f.name))

describe('NotebookLM pack', () => {
  it('stays within NotebookLM limits: at most 50 Markdown sources, each well under 500k words', () => {
    expect(files.length).toBeLessThanOrEqual(50)
    for (const f of files) {
      expect(f.name).toMatch(/\.md$/)
      expect(f.content.split(/\s+/).length, f.name).toBeLessThan(400_000)
    }
  })

  it('has one file per Kup with the technique and its three languages and its links', () => {
    const kups = byName(/^techniques-and-terms-/)
    expect(kups.length).toBeGreaterThan(5)
    const all = kups.map((f) => f.content).join('\n')
    expect(all).toContain('### ap-chagi 앞 차기')
    expect(all).toMatch(/- \*\*EN:\*\* Front kick/)
    expect(all).toMatch(/- \*\*DE:\*\* /)
    expect(all).toMatch(/- \*\*ES:\*\* /)
    expect(all).toContain(`${BASE}#/study/`)
    expect(all).toMatch(/\[Course \(ES\)\]\(https:\/\/www\.youtube\.com\/watch\?v=[\w-]+&t=\d+s\)/)
  })

  it('has concepts, history, background, theory and a video index', () => {
    for (const re of [/^concepts/, /^history/, /^background/, /^theory/, /^videos-index/]) expect(byName(re).length, String(re)).toBe(1)
    expect(byName(/^videos-index/)[0].content).toContain('youtube.com/watch')
    expect(byName(/^history/)[0].content).toContain(`${BASE}#/history`)
  })

  it('starts each file with a title and what it is, so NotebookLM knows how to use it', () => {
    for (const f of files) expect(f.content.startsWith('# '), f.name).toBe(true)
    expect(files[0].content).toMatch(/Taekwondo/)
  })
})
