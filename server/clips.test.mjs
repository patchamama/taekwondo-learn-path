import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { frameTimes, saveClips, validFrameKey, validateClips } from './clips.mjs'

test('validateClips rounds to a tenth and rejects bad ranges', () => {
  assert.deepEqual(validateClips([{ index: 0, start: 1203.54, end: 1230.06 }]), [{ index: 0, start: 1203.5, end: 1230.1 }])
  assert.throws(() => validateClips([{ index: 0, start: 10, end: 10 }]))
  assert.throws(() => validateClips([{ index: -1, start: 1, end: 2 }]))
  assert.throws(() => validateClips([{ index: 0, start: -1, end: 2 }]))
  assert.throws(() => validateClips([{ index: 0, start: 'a', end: 2 }]))
  assert.throws(() => validateClips('x'))
})

test('saveClips stores per card, sorted, and removes with an empty list', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cl-'))
  const file = join(dir, 'clipOverrides.json')
  try {
    writeFileSync(file, '{}')
    saveClips(file, 'b', [{ index: 0, start: 1, end: 2 }])
    saveClips(file, 'a', [{ index: 1, start: 3, end: 4 }])
    assert.deepEqual(Object.keys(JSON.parse(readFileSync(file, 'utf8'))), ['a', 'b'])
    saveClips(file, 'a', [])
    assert.deepEqual(Object.keys(JSON.parse(readFileSync(file, 'utf8'))), ['b'])
    assert.throws(() => saveClips(file, '../x', []))
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('frameTimes spreads six moments inside the clip', () => {
  const t = frameTimes(100, 160)
  assert.equal(t.length, 6)
  assert.equal(t[0], 105)
  assert.equal(t[5], 155)
  assert.ok(t.every((x, i) => i === 0 || x > t[i - 1]))
})

test('validFrameKey only allows the known frame folders', () => {
  for (const k of ['course', 'selfdefense', 'ext-azqXl4ys3WY']) assert.equal(validFrameKey(k), true, k)
  for (const k of ['../x', 'ext-', 'other', 'course/../x']) assert.equal(validFrameKey(k), false, k)
})
