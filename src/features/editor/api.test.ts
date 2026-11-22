import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { editorAvailable, frameUrl, resetEditorCache, saveCard } from './api'

describe('editor api', () => {
  beforeEach(() => resetEditorCache())
  afterEach(() => vi.unstubAllGlobals())

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

  it('builds frame URLs with one decimal and never a negative time', () => {
    expect(frameUrl('abc', 12.34)).toBe('/api/frame?id=abc&t=12.3&w=640')
    expect(frameUrl('abc', -5, 320)).toBe('/api/frame?id=abc&t=0.0&w=320')
  })
})
