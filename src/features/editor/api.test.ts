import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { editorAvailable, frameUrl, resetEditorCache, saveCard, saveClipRanges, translateWithAi, type Lang, type TranslationTarget } from './api'

describe('editor api', () => {
  beforeEach(() => resetEditorCache())
  afterEach(() => vi.unstubAllGlobals())

  it('saves a clip removal using the same guarded endpoint as retiming', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) })
    vi.stubGlobal('fetch', fetchMock)
    await saveClipRanges('momtong-packat-macki', [{ index: 0, removed: true }])
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/clips/momtong-packat-macki', {
      method: 'PUT', headers: { 'X-Editor': '1', 'Content-Type': 'application/json' },
      body: JSON.stringify({ clips: [{ index: 0, removed: true }] }),
    })
  })

  it('is available only when the backend says it has the editor', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, editor: true }) }),
    )
    expect(await editorAvailable()).toBe(true)
    resetEditorCache()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) }),
    )
    expect(await editorAvailable()).toBe(false)
    resetEditorCache()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await editorAvailable()).toBe(false)
  })

  it('saves a card with the X-Editor header', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => ({ ok: true, override: { kup: 2 } }) })
    vi.stubGlobal('fetch', fetchMock)
    await saveCard('düt-gubi', { kup: 2 })
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/cards/d%C3%BCt-gubi')
    expect(init.method).toBe('PUT')
    expect(init.headers['X-Editor']).toBe('1')
    expect(JSON.parse(init.body)).toEqual({ kup: 2 })
  })

  it('reports the error message of the backend', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => ({ ok: false, error: 'Invalid kup' }),
      }),
    )
    await expect(saveCard('x', { kup: 99 })).rejects.toThrow('Invalid kup')
  })

  it('requests secondary Japanese translations only through the server editor endpoint', async () => {
    const target: TranslationTarget = 'ja'
    // Japanese is not an interface/source language.
    // @ts-expect-error Japanese must not widen the editor source-language contract.
    const source: Lang = 'ja'
    void source
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ ok: true, translations: { ja: '前蹴り' } }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const input = { from: 'en' as const, targets: [target], text: 'front kick' }
    expect((await translateWithAi(input)).translations.ja).toBe('前蹴り')
    expect(fetchMock).toHaveBeenCalledExactlyOnceWith('/api/ai/translate', {
      method: 'POST', headers: { 'X-Editor': '1', 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    })
  })

  it('preserves the existing German and Spanish translation request', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true, json: async () => ({ ok: true, translations: { de: 'Tritt', es: 'patada' } }),
    })
    vi.stubGlobal('fetch', fetchMock)
    const input = { from: 'en' as const, targets: ['de', 'es'] as Lang[], text: 'kick' }
    expect(await translateWithAi(input)).toEqual({ ok: true, translations: { de: 'Tritt', es: 'patada' } })
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(input)
  })

  it('builds frame URLs with one decimal and never a negative time', () => {
    expect(frameUrl('abc', 12.34)).toBe('/api/frame?id=abc&t=12.3&w=640')
    expect(frameUrl('abc', -5, 320)).toBe('/api/frame?id=abc&t=0.0&w=320')
  })
})
