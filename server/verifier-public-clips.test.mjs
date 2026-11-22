import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { handleEditor } from './editor.mjs'

const loc = { en: 'New', de: 'Neu', es: 'Nuevo' }
const kinds = ['technique', 'morpheme', 'term', 'form']

test('public clip creation rejects unknown IDs without writes and accepts built-in and current custom cards of every kind', async () => {
  const root = mkdtempSync(join(tmpdir(), 'verifier-public-clips-'))
  const data = join(root, 'src', 'data')
  mkdirSync(data, { recursive: true })
  writeFileSync(join(data, 'cards.ts'), `export const ALL_CARDS = ${JSON.stringify(kinds.map((kind) => ({ id: `builtin-${kind}`, kind })))}`)
  writeFileSync(join(data, 'customCards.ts'), 'export const CUSTOM_CARDS = []')
  writeFileSync(join(data, 'customCards.json'), JSON.stringify({ entries: [], hiddenIds: [] }))
  writeFileSync(join(data, 'clips-external.json'), '[]\n')
  writeFileSync(join(data, 'clipOverrides.json'), '{}\n')
  const request = async (path, body) => {
    let result
    const handled = await handleEditor({ method: 'POST', headers: { host: 'localhost', 'x-editor': '1' } }, {}, new URL(path, 'http://localhost'), {
      root, readBody: async () => JSON.stringify(body), send: (_res, status, body) => { result = { status, body } },
    })
    assert.equal(handled, true)
    return result
  }
  const snapshot = () => Object.fromEntries(readdirSync(data).sort().map((name) => [name, readFileSync(join(data, name))]))
  const counts = () => ({
    clips: JSON.parse(readFileSync(join(data, 'clips-external.json'), 'utf8')).length,
    cards: JSON.parse(readFileSync(join(data, 'customCards.json'), 'utf8')).entries.length,
  })
  const input = { cardId: 'nonexistent-technique', url: 'https://youtu.be/abcdefghijk', start: 1.24, end: 5.66 }
  const rejectUnknown = async () => {
    const before = snapshot()
    const beforeCounts = counts()
    const result = await request('/api/clips/add', input)
    // Check persistence even when the response itself is wrong.
    assert.deepEqual(snapshot(), before, 'unknown card must leave all stored bytes and files unchanged')
    assert.deepEqual(counts(), beforeCounts)
    assert.deepEqual(result, { status: 400, body: { ok: false, error: 'Unknown card id' } })
  }
  try {
    await rejectUnknown()
    for (const kind of kinds) {
      const cardId = `builtin-${kind}`
      assert.deepEqual(await request('/api/clips/add', { ...input, cardId }), {
        status: 200, body: { ok: true, clip: { cardId, videoId: 'abcdefghijk', start: 1.2, end: 5.7 } },
      })
    }
    // Create after the first clip request: the built-in cache must not freeze custom IDs.
    for (const kind of kinds) {
      const entry = { id: `custom-${kind}`, kind, ko: 'new', hangul: '새', kup: 8,
        ...(kind === 'technique' ? { category: 'hand', parts: [], names: loc, karate: '—' }
          : kind === 'morpheme' ? { group: 'action', family: 'action', meaning: loc }
            : kind === 'term' ? { group: 'basic', meaning: loc }
              : { system: 'taegeuk', kukkiwon: 'New', moves: 20, symbol: loc, meaning: loc }),
      }
      assert.deepEqual(await request('/api/cards/custom', entry), { status: 200, body: { ok: true, entry } })
      assert.deepEqual(await request('/api/clips/add', { ...input, cardId: entry.id }), {
        status: 200, body: { ok: true, clip: { cardId: entry.id, videoId: 'abcdefghijk', start: 1.2, end: 5.7 } },
      })
    }
    assert.deepEqual(counts(), { clips: 8, cards: 4 })
    const saved = JSON.parse(readFileSync(join(data, 'clips-external.json'), 'utf8'))
    assert.deepEqual(saved, ['builtin', 'custom'].flatMap((prefix) => kinds.map((kind) => ({
      cardId: `${prefix}-${kind}`, videoId: 'abcdefghijk', start: 1.2, end: 5.7,
    }))))
    await rejectUnknown()
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
