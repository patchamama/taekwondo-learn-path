import assert from 'node:assert/strict'
import { URL } from 'node:url'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { handleEditor } from './editor.mjs'
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

test('public clip writes merge retimings and reject invalid requests without changing data', async () => {
  const root = mkdtempSync(join(tmpdir(), 'clip-api-'))
  const dir = join(root, 'src', 'data')
  mkdirSync(dir, { recursive: true })
  const file = join(dir, 'clipOverrides.json')
  const initial = { a: [{ index: 0, start: 1, end: 2 }, { index: 1, start: 3, end: 4 }], b: [{ index: 0, start: 8, end: 9 }] }
  writeFileSync(file, JSON.stringify(initial))
  try {
    const request = async (clips, headers = { host: 'localhost:3000', 'x-editor': '1' }) => {
      let result
      await handleEditor({ method: 'PUT', headers }, {}, new URL('http://localhost/api/clips/a'), {
        root, readBody: async () => JSON.stringify({ clips }), send: (_res, status, body) => { result = { status, body } },
      })
      return result
    }
    for (const [clips, headers, status, error] of [
      [[{ index: 0, start: 2, end: 2 }], undefined, 400, 'The end must be after the start'],
      [[{ index: 0, start: 1.01, end: 1.02 }], undefined, 400, 'The end must be after the start'],
      [[{ index: 0, start: 1, end: 2 }, { index: 0, start: 3, end: 4 }], undefined, 400, 'Duplicate clip index'],
      [[], { host: 'remote.test', 'x-editor': '1' }, 403, 'Forbidden host'],
      [[], { host: 'localhost' }, 403, 'Missing X-Editor header'],
      [[], { host: 'localhost', 'x-editor': '1', origin: 'https://evil.test' }, 403, 'Forbidden origin'],
    ]) {
      assert.deepEqual(await request(clips, headers), { status, body: { ok: false, error } })
      assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), initial)
    }
    assert.deepEqual(await request([{ index: 1, start: 5, end: 6 }]), { status: 200, body: { ok: true } })
    assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), { ...initial, a: [initial.a[0], { index: 1, start: 5, end: 6 }] })
  } finally { rmSync(root, { recursive: true, force: true }) }
})

test('public add-video endpoint validates URL/range and preserves existing external clips', async () => {
  const root = mkdtempSync(join(tmpdir(), 'clip-add-'))
  const dir = join(root, 'src', 'data')
  mkdirSync(dir, { recursive: true })
  writeFileSync(join(dir, 'cards.ts'), 'export const ALL_CARDS = [{ id: "new-technique", kind: "technique" }, { id: "other", kind: "technique" }]')
  writeFileSync(join(dir, 'customCards.ts'), 'export const CUSTOM_CARDS = []')
  const file = join(dir, 'clips-external.json')
  const existing = [{ cardId: 'other', videoId: 'abcdefghijk', start: 1, end: 2, label: 'Kept' }]
  writeFileSync(file, JSON.stringify(existing))
  try {
    const request = async (body, headers = { host: 'localhost', 'x-editor': '1' }) => {
      let result
      const handled = await handleEditor({ method: 'POST', headers }, {}, new URL('http://localhost/api/clips/add'), {
        root, readBody: async () => JSON.stringify(body), send: (_res, status, body) => { result = { status, body } },
      })
      assert.equal(handled, true)
      return result
    }
    const input = { cardId: 'new-technique', url: 'https://www.youtube.com/watch?v=azqXl4ys3WY', start: 1.5, end: 4.2 }
    for (const bad of [{ url: 'https://evil.test/watch?v=azqXl4ys3WY' }, { url: 'javascript:alert(1)' }, { url: 'http://localhost/private' }, { start: -1 }, { end: 1 }, { cardId: '../bad' }]) {
      const result = await request({ ...input, ...bad })
      assert.equal(result.status, 400)
      assert.equal(result.body.ok, false)
      assert.equal(typeof result.body.error, 'string')
      assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), existing)
    }
    assert.equal((await request(input, { host: 'evil.test', 'x-editor': '1' })).status, 403)
    assert.equal((await request(input, { host: 'localhost' })).status, 403)
    assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), existing)
    assert.deepEqual(await request(input), { status: 200, body: { ok: true, clip: { cardId: input.cardId, videoId: 'azqXl4ys3WY', start: 1.5, end: 4.2 } } })
    const saved = JSON.parse(readFileSync(file, 'utf8'))
    assert.deepEqual(saved, [...existing, { cardId: input.cardId, videoId: 'azqXl4ys3WY', start: 1.5, end: 4.2 }])
    assert.equal((await request(input)).status, 400)
    assert.deepEqual(JSON.parse(readFileSync(file, 'utf8')), saved)
  } finally { rmSync(root, { recursive: true, force: true }) }
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
