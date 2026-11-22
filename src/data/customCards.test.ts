import { afterEach, describe, expect, it, vi } from 'vitest'
import { createCard, customCatalogue, setCardVisibility } from '../features/editor/api'

afterEach(() => vi.unstubAllGlobals())
import { adaptCustomCards } from './customCards'

const loc = { en: 'New', de: 'Neu', es: 'Nuevo' }
describe('custom catalogue adapters', () => {
  it('adapts each actual schema without changing stable IDs or exam levels', () => {
    const common = { id: 'new', ko: 'new', hangul: '새', kup: 8 }
    const data = adaptCustomCards([
      { ...common, id: 'brick', kind: 'morpheme', group: 'action', family: 'action', meaning: loc },
      { ...common, kind: 'technique', category: 'hand', parts: ['brick'], names: loc, karate: '—' },
      { ...common, id: 'term', kind: 'term', group: 'basic', meaning: loc },
      { ...common, id: 'form', kind: 'form', system: 'taegeuk', kukkiwon: 'New', moves: 20, symbol: loc, meaning: loc },
    ])
    expect(data.techniques[0]).toMatchObject({ id: 'new', kup: 8, parts: ['brick'] })
    expect(data.forms[0]).toMatchObject({ id: 'form', examKup: 8, moves: 20 })
    expect(data.morphemes[0]).toMatchObject({ id: 'brick', family: 'action' })
    expect(data.terms[0]).toMatchObject({ id: 'term', kup: 8 })
  })
  it('keeps empty persisted catalogue additive', () => {
    expect(adaptCustomCards([])).toEqual({ techniques: [], morphemes: [], terms: [], forms: [], hyong: [], yudanja: [] })
  })
  it('client creation and visibility APIs retain IDs and local write headers; reads include hidden entries', async () => {
    const entry = { id: 'custom new', kind: 'term' as const, ko: 'new', hangul: '새', kup: 8, group: 'basic' as const, meaning: loc }
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, entry }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ ok: true, id: entry.id, hidden: true }) })
      .mockResolvedValueOnce({ ok: true, json: async () => ({ entries: [entry], hiddenIds: [entry.id] }) })
    vi.stubGlobal('fetch', fetcher)
    expect(await createCard(entry)).toEqual({ ok: true, entry })
    expect(fetcher.mock.calls[0]).toEqual(['/api/cards/custom', { method: 'POST', headers: { 'X-Editor': '1', 'Content-Type': 'application/json' }, body: JSON.stringify(entry) }])
    expect(await setCardVisibility(entry.id, true)).toEqual({ ok: true, id: entry.id, hidden: true })
    expect(fetcher.mock.calls[1]).toEqual(['/api/cards/custom%20new/visibility', { method: 'PUT', headers: { 'X-Editor': '1', 'Content-Type': 'application/json' }, body: '{"hidden":true}' }])
    expect(await customCatalogue()).toEqual({ entries: [entry], hiddenIds: [entry.id] })
  })
  it('client surfaces rejected writes without a success response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, json: async () => ({ ok: false, error: 'Card id already exists' }) }))
    await expect(setCardVisibility('existing', true)).rejects.toThrow('Card id already exists')
  })
})
