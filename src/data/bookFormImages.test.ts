import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import images from './bookFormImages.json'

// Independent chapter/member pairs, not derived from image order at runtime.
const origins = [
  ['cSD', '223'], ['cTZ', '224'], ['cVS', '225'], ['cYJ', '226'],
  ['c10V', '227'], ['c13M', '228'], ['c165', '229'], ['c18P', '22A'],
]

describe('verified supplemental Taegeuk plates', () => {
  it('contains exactly the eight stable existing Taegeuk IDs', () => {
    expect(Object.keys(images)).toEqual(origins.map((_, i) => `taeguk-${i + 1}`))
  })

  for (const [index, [chapter, suffix]] of origins.entries()) {
    const cardId = `taeguk-${index + 1}` as keyof typeof images
    it(`${cardId} preserves its exact source member, bytes and local asset`, () => {
      const image = images[cardId]
      expect(image.file).toBe(`diagrams/books/woo-taegeuk-${index + 1}-sequence.jpg`)
      expect(image.file).not.toMatch(/https?:|\.\./)
      const bytes = readFileSync(resolve(process.cwd(), 'public', image.file))
      expect(bytes.byteLength).toBe(image.bytes)
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(image.sha256)
      expect(image.sourceMember).toBe(`OEBPS/image_rsrc${suffix}.jpg`)
      expect(image.chapterMember).toBe(`OEBPS/${chapter}.xhtml`)
      expect(image.sourceBookId).toBe('woo-2015')
      expect(image.author).toBe('Sung Woo')
      expect(image.permission).toBe('owner-confirmed')
      expect(image.copyright).toContain('All rights reserved')
      expect(image).not.toHaveProperty('licenceUrl')
      for (const lang of ['en', 'de', 'es'] as const) {
        expect(image.alt[lang]).toContain(`Taegeuk ${index + 1}`)
        expect(image.caption[lang]).toContain(`Taegeuk ${index + 1}`)
        expect(image.alt[lang].length).toBeGreaterThan(60)
        expect(image.caption[lang].length).toBeGreaterThan(100)
      }
    })
  }
})
