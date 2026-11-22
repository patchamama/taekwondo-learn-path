import assert from 'node:assert/strict'
import { URL } from 'node:url'
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { createCustomCard, setCardHidden } from './custom-cards.mjs'
import { handleEditor } from './editor.mjs'

const loc = { en: 'New', de: 'Neu', es: 'Nuevo' }
const catalogue = [{ id: 'existing', kind: 'technique' }, { id: 'brick', kind: 'morpheme' }]
const technique = { id: 'new', kind: 'technique', ko: 'new', hangul: '새', kup: 8, category: 'hand', parts: ['brick'], names: loc, karate: '—' }
function scratch(run) {
  const dir = mkdtempSync(join(tmpdir(), 'custom-cards-'))
  const file = join(dir, 'customCards.json')
  writeFileSync(file, JSON.stringify({ entries: [], hiddenIds: [] }))
  try { run(file) } finally { rmSync(dir, { recursive: true, force: true }) }
}
test('persists each technique category, bricks, terms and form systems with stable IDs', () => scratch((file) => {
  for (const category of ['hand', 'foot', 'stance', 'combo']) {
    const entry = { ...technique, category, id: category }
    assert.deepEqual(createCustomCard(file, entry, catalogue), entry)
  }
  const entries = [
    { id: 'custom-brick', kind: 'morpheme', ko: 'new', hangul: '새', kup: 10, group: 'action', family: 'action', meaning: loc },
    { id: 'custom-term', kind: 'term', ko: 'new', hangul: '새', kup: 0, group: 'basic', meaning: loc },
    ...['taegeuk', 'hyong', 'yudanja'].map((system) => ({ id: system, kind: 'form', system, ko: 'new', hangul: '새', kup: 0, moves: 20, symbol: loc, meaning: loc, ...(system === 'taegeuk' ? { kukkiwon: 'New' } : {}) })),
  ]
  for (const entry of entries) assert.deepEqual(createCustomCard(file, entry, catalogue), entry)
  assert.equal(JSON.parse(readFileSync(file, 'utf8')).entries.length, 9)
}))
test('rejects collisions, invalid parts, locales, levels and type fields with bytes/counters unchanged', () => scratch((file) => {
  createCustomCard(file, technique, catalogue)
  const before = readFileSync(file, 'utf8')
  for (const input of [
    technique, { ...technique, id: 'existing' }, { ...technique, id: 'brick' },
    { ...technique, id: 'bad', parts: ['missing'] }, { ...technique, id: 'bad', parts: ['existing'] },
    { ...technique, id: 'bad', names: { en: 'Only' } }, { ...technique, id: 'bad', names: { ...loc, es: '' } },
    { ...technique, id: 'bad', kup: 11 }, { ...technique, id: 'bad', kup: 1.5 },
    { ...technique, id: 'bad', category: 'form' }, { ...technique, id: '../bad' },
    { ...technique, id: 'bad', video: 'anything' },
  ]) {
    assert.throws(() => createCustomCard(file, input, catalogue))
    assert.equal(readFileSync(file, 'utf8'), before)
  }
}))
test('hide/unhide preserves entries and accepts hidden bricks as dependencies; no cascade', () => scratch((file) => {
  setCardHidden(file, 'brick', true, catalogue)
  createCustomCard(file, technique, catalogue)
  setCardHidden(file, 'new', true, catalogue)
  setCardHidden(file, 'new', true, catalogue)
  let saved = JSON.parse(readFileSync(file, 'utf8'))
  assert.deepEqual(saved.entries, [technique])
  assert.deepEqual(saved.hiddenIds, ['brick', 'new'])
  setCardHidden(file, 'new', false, catalogue)
  saved = JSON.parse(readFileSync(file, 'utf8'))
  assert.deepEqual(saved.hiddenIds, ['brick'])
  const before = readFileSync(file, 'utf8')
  assert.throws(() => setCardHidden(file, 'unknown', true, catalogue))
  assert.throws(() => setCardHidden(file, 'new', 'yes', catalogue))
  assert.equal(readFileSync(file, 'utf8'), before)
}))

test('local API creates/hides with exact responses; rejected requests leave bytes and counters unchanged', async () => {
  const root = mkdtempSync(join(tmpdir(), 'catalogue-api-'))
  const data = join(root, 'src', 'data')
  mkdirSync(data, { recursive: true })
  const file = join(data, 'customCards.json')
  writeFileSync(file, JSON.stringify({ entries: [], hiddenIds: [] }))
  writeFileSync(join(data, 'customCards.ts'), 'export const CUSTOM_CARDS = []')
  writeFileSync(join(data, 'cards.ts'), `export const ALL_CARDS = ${JSON.stringify(catalogue)}`)
  const request = async (method, path, body, headers = { host: 'localhost:3000', 'x-editor': '1' }) => {
    let response
    const handled = await handleEditor({ method, headers }, {}, new URL(path, 'http://localhost:3000'), {
      root, send: (_res, status, body) => { response = { status, body } }, readBody: async () => JSON.stringify(body),
    })
    assert.equal(handled, true)
    return response
  }
  try {
    const before = readFileSync(file, 'utf8')
    assert.deepEqual(await request('POST', '/api/cards/custom', technique, { host: 'evil.test', 'x-editor': '1' }), { status: 403, body: { ok: false, error: 'Forbidden host' } })
    assert.deepEqual(await request('POST', '/api/cards/custom', technique, { host: 'localhost:3000' }), { status: 403, body: { ok: false, error: 'Missing X-Editor header' } })
    assert.equal(readFileSync(file, 'utf8'), before)
    assert.deepEqual(await request('POST', '/api/cards/custom', technique), { status: 200, body: { ok: true, entry: technique } })
    const saved = readFileSync(file, 'utf8')
    assert.deepEqual(await request('POST', '/api/cards/custom', technique), { status: 400, body: { ok: false, error: 'Card id already exists' } })
    assert.equal(readFileSync(file, 'utf8'), saved)
    assert.deepEqual(await request('PUT', '/api/cards/new/visibility', { hidden: true }), { status: 200, body: { ok: true, id: 'new', hidden: true } })
    assert.deepEqual(await request('GET', '/api/cards/custom'), { status: 200, body: { entries: [technique], hiddenIds: ['new'] } })
    assert.deepEqual(await request('PUT', '/api/cards/new/visibility', { hidden: false }), { status: 200, body: { ok: true, id: 'new', hidden: false } })
  } finally { rmSync(root, { recursive: true, force: true }) }
})
