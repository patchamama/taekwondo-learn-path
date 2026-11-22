import { afterEach, describe, expect, it, vi } from 'vitest'
import { backendStatus, buildMp3 } from './backend'

afterEach(() => vi.unstubAllGlobals())

describe('audio backend client', () => {
  it('reports the backend as usable only when it answers and has ffmpeg', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, ffmpeg: true }) }))
    expect(await backendStatus()).toBe(true)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true, ffmpeg: false }) }))
    expect(await backendStatus()).toBe(false)
  })

  it('treats a missing backend (static site) as unavailable', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    expect(await backendStatus()).toBe(false)
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }))
    expect(await backendStatus()).toBe(false)
  })

  it('posts the plan and returns an mp3 blob', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['x'], { type: 'audio/mpeg' }) })
    vi.stubGlobal('fetch', fetchMock)
    const blob = await buildMp3([{ file: 'audio/ko/a-12345678.mp3' }, { silence: 2 }])
    expect(blob.type).toBe('audio/mpeg')
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/audio/build')
    expect(JSON.parse(init.body)).toEqual({ plan: [{ file: 'audio/ko/a-12345678.mp3' }, { silence: 2 }] })
  })

  it('throws when the backend refuses', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 400, text: async () => 'bad' }))
    await expect(buildMp3([{ silence: 1 }])).rejects.toThrow('bad')
  })
})
