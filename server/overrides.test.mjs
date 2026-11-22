import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { saveOverride, validateOverride, validId } from './overrides.mjs'

const loc = (v) => ({ en: v, de: v, es: v })

test('validId accepts card ids and rejects anything path-like', () => {
  for (const id of ['ap-chagi', 'düt-gubi', 'basic-kam sa hamnida', 'taeguk-1']) assert.equal(validId(id), true, id)
  for (const id of ['', '../x', 'a/b', 'a\\b', '.hidden', 'x'.repeat(200), '__proto__']) assert.equal(validId(id), false, id)
})

test('validateOverride keeps only known, well-formed fields', () => {
  const clean = validateOverride({
    ko: ' dojang ',
    hangul: '도장',
    meaning: loc('hall'),
    info: loc('long text'),
    kup: 3,
    images: [{ src: 'images/cards/a.jpg', source: 'Book p. 3', caption: 'c' }, { src: 'frames/course/ap-chagi/3.jpg' }],
    evil: 'x',
  })
  assert.deepEqual(clean, {
    ko: 'dojang',
    hangul: '도장',
    meaning: loc('hall'),
    info: loc('long text'),
    kup: 3,
    images: [{ src: 'images/cards/a.jpg', source: 'Book p. 3', caption: 'c' }, { src: 'frames/course/ap-chagi/3.jpg' }],
  })
})

test('validateOverride rejects bad values', () => {
  assert.throws(() => validateOverride({ kup: 11 }))
  assert.throws(() => validateOverride({ kup: 1.5 }))
  assert.throws(() => validateOverride({ meaning: { en: 'x' } }))
  assert.throws(() => validateOverride({ hangul: 5 }))
  assert.throws(() => validateOverride({ images: [{ src: '../../etc/passwd' }] }))
  assert.throws(() => validateOverride({ images: [{ src: 'javascript:alert(1)' }] }))
  assert.throws(() => validateOverride({ images: 'nope' }))
})

test('saveOverride writes sorted JSON, merges per card and deletes with an empty object', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ov-'))
  const file = join(dir, 'cardOverrides.json')
  try {
    writeFileSync(file, '{}')
    saveOverride(file, 'b-card', { kup: 2 })
    saveOverride(file, 'a-card', { hangul: '가' })
    assert.deepEqual(Object.keys(JSON.parse(readFileSync(file, 'utf8'))), ['a-card', 'b-card'])
    saveOverride(file, 'b-card', {})
    assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), { 'a-card': { hangul: '가' } })
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})
