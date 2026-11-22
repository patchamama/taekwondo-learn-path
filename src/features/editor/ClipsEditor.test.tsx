import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { ClipsEditor } from './ClipsEditor'
import { resetEditorCache } from './api'
import { CARD_BY_ID } from '../../data/cards'
import { CLIPS_BY_CARD } from '../../data/clips'

const visibility = vi.hoisted(() => ({ hidden: '' }))
vi.mock('../../data/visibility', () => ({ isVisible: (id: string) => id !== visibility.hidden }))

const calls: { url: string; init?: RequestInit }[] = []

beforeEach(() => {
  calls.length = 0
  visibility.hidden = Object.values(CARD_BY_ID).find((c) => c.kind === 'technique' && !CLIPS_BY_CARD[c.id])!.id
  resetEditorCache()
  useAppStore.setState({ lang: 'en' })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init?: RequestInit) => {
      calls.push({ url: String(input), init })
      return { ok: true, json: async () => ({ ok: true, frames: 6 }) } as Response
    }),
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('ClipsEditor', () => {
  it('edits only the current card, without the unrelated add-to-another-technique form', () => {
    const hidden = Object.values(CARD_BY_ID).find((c) => c.kind === 'technique' && !CLIPS_BY_CARD[c.id])!
    render(<ClipsEditor cardId={hidden.id} onSaved={() => {}} />)
    expect(screen.queryByText('Add video to an existing technique')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Technique without video' })).not.toBeInTheDocument()
  })
  it('marks precise source playback times and can save without automatic regeneration', async () => {
    const onSaved = vi.fn()
    render(<ClipsEditor cardId="ap-chagi" onSaved={onSaved} />)
    const video = screen.getByLabelText('Source playback') as HTMLVideoElement
    video.currentTime = 1201.3
    fireEvent.timeUpdate(video)
    fireEvent.click(screen.getByRole('button', { name: 'Mark start' }))
    video.currentTime = 1231.7
    fireEvent.timeUpdate(video)
    fireEvent.click(screen.getByRole('button', { name: 'Mark end' }))
    expect(screen.getByRole('spinbutton', { name: /Start .*course/i })).toHaveValue(1201.3)
    expect(screen.getByRole('spinbutton', { name: /End .*course/i })).toHaveValue(1231.7)
    fireEvent.click(screen.getByRole('checkbox', { name: 'Automatically regenerate frames' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save clips' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce())
    expect(calls.filter((c) => c.url === '/api/clips/frames')).toHaveLength(0)
    expect(JSON.parse(String(calls.find((c) => c.init?.method === 'PUT')?.init?.body))).toEqual({ clips: [{ index: 0, start: 1201.3, end: 1231.7 }] })
  })

  it('offers existing techniques without video, validates input and adds a URL/range', async () => {
    const card = Object.values(CARD_BY_ID).filter((c) => c.kind === 'technique' && !CLIPS_BY_CARD[c.id])[1]!
    const onSaved = vi.fn()
    render(<ClipsEditor cardId={card.id} onSaved={onSaved} />)
    expect(screen.queryByRole('combobox', { name: 'Technique without video' })).not.toBeInTheDocument()
    const add = screen.getByRole('button', { name: 'Add video' })
    fireEvent.change(screen.getByLabelText('Video URL'), { target: { value: 'https://evil.test/x' } })
    expect(add).toBeDisabled()
    expect(calls.filter((c) => c.init?.method === 'POST')).toHaveLength(0)
    fireEvent.change(screen.getByLabelText('Video URL'), { target: { value: 'https://youtu.be/azqXl4ys3WY' } })
    fireEvent.change(screen.getByLabelText('New clip start'), { target: { value: '2.3' } })
    fireEvent.change(screen.getByLabelText('New clip end'), { target: { value: '1' } })
    expect(add).toBeDisabled()
    fireEvent.change(screen.getByLabelText('New clip end'), { target: { value: '5.6' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'Automatically regenerate frames' }))
    fireEvent.click(add)
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce())
    expect(JSON.parse(String(calls.find((c) => c.url === '/api/clips/add')?.init?.body))).toEqual({ cardId: card.id, url: 'https://youtu.be/azqXl4ys3WY', start: 2.3, end: 5.6 })
  })

  it('offers server AI translations only when configured and never saves suggestions automatically', async () => {
    vi.stubGlobal('fetch', vi.fn(async (input: string, init?: RequestInit) => {
      calls.push({ url: String(input), init })
      return { ok: true, json: async () => String(input) === '/api/health'
        ? { ok: true, editor: true, ai: { enabled: true } }
        : { ok: true, translations: { en: 'front kick', es: 'patada frontal' } } }
    }))
    render(<ClipsEditor cardId="ap-chagi" onSaved={() => {}} />)
    fireEvent.change(screen.getByLabelText('Source language'), { target: { value: 'de' } })
    fireEvent.change(screen.getByLabelText('Source text'), { target: { value: 'Vorwärtstritt' } })
    fireEvent.click(await screen.findByRole('button', { name: 'Translate source text' }))
    expect(await screen.findByDisplayValue('front kick')).toBeInTheDocument()
    expect(screen.getByDisplayValue('patada frontal')).toBeInTheDocument()
    const call = calls.find((c) => c.url === '/api/ai/translate')!
    expect(JSON.parse(String(call.init?.body))).toEqual({ from: 'de', targets: ['en', 'es'], text: 'Vorwärtstritt' })
    expect(calls.filter((c) => c.init?.method === 'PUT')).toHaveLength(0)
  })

  it('shows the range of each clip with a preview of its first and last frame', () => {
    render(<ClipsEditor cardId="ap-chagi" onSaved={() => {}} />)
    expect(screen.getByRole('spinbutton', { name: /Start .*course/i })).toHaveValue(1200)
    expect(screen.getByRole('spinbutton', { name: /End .*course/i })).toHaveValue(1235)
    const imgs = screen.getAllByRole('img')
    expect(imgs[0].getAttribute('src')).toContain('/api/frame?id=dnYQ1Y0acrE&t=1200.0')
  })

  it('plays the existing course video when its local original is unavailable', () => {
    render(<ClipsEditor cardId="momtong-packat-macki" onSaved={() => {}} />)
    fireEvent.error(screen.getByLabelText('Source playback'))
    const remote = screen.getByTitle('Source video preview')
    expect(remote).toHaveAttribute('src', expect.stringContaining('youtube-nocookie.com/embed/dnYQ1Y0acrE'))
    expect(remote.getAttribute('src')).toContain('start=2279')
    expect(remote.getAttribute('src')).toContain('end=2295')
    expect(remote.getAttribute('src')).toContain('controls=1')
    expect(screen.getByRole('button', { name: 'Mark start' })).toBeDisabled()
  })

  it('removes a built-in video without regenerating frames or deleting shared sources', async () => {
    const onSaved = vi.fn()
    render(<ClipsEditor cardId="momtong-packat-macki" onSaved={onSaved} />)
    fireEvent.click(screen.getByRole('button', { name: 'Remove video' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce())
    const writes = calls.filter((c) => c.init?.method === 'PUT')
    expect(writes).toHaveLength(1)
    expect(writes[0].url).toBe('/api/clips/momtong-packat-macki')
    expect(JSON.parse(String(writes[0].init?.body))).toEqual({ clips: [{ index: 0, removed: true }] })
    expect(calls.some((c) => c.url === '/api/clips/frames' || c.init?.method === 'DELETE')).toBe(false)
  })

  it('moves the start and end with the second buttons', () => {
    render(<ClipsEditor cardId="ap-chagi" onSaved={() => {}} />)
    fireEvent.click(screen.getAllByRole('button', { name: '+3 s' })[0])
    expect(screen.getByRole('spinbutton', { name: /Start .*course/i })).toHaveValue(1203)
    fireEvent.click(screen.getAllByRole('button', { name: '−1 s' })[1])
    expect(screen.getByRole('spinbutton', { name: /End .*course/i })).toHaveValue(1234)
  })

  it('refuses an end that is not after the start', () => {
    render(<ClipsEditor cardId="ap-chagi" onSaved={() => {}} />)
    fireEvent.change(screen.getByRole('spinbutton', { name: /End .*course/i }), {
      target: { value: '1100' },
    })
    expect(screen.getByRole('button', { name: 'Save clips' })).toBeDisabled()
  })

  it('saves only the changed clip and regenerates its frames', async () => {
    const onSaved = vi.fn()
    render(<ClipsEditor cardId="ap-chagi" onSaved={onSaved} />)
    fireEvent.change(screen.getByRole('spinbutton', { name: /Start .*course/i }), {
      target: { value: '1203.5' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Save clips' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    const put = calls.find((c) => c.init?.method === 'PUT')!
    expect(put.url).toBe('/api/clips/ap-chagi')
    expect(JSON.parse(String(put.init?.body))).toEqual({
      clips: [{ index: 0, start: 1203.5, end: 1235 }],
    })
    const frames = calls.find((c) => c.url === '/api/clips/frames')!
    expect(JSON.parse(String(frames.init?.body))).toEqual({
      cardId: 'ap-chagi',
      key: 'course',
      videoId: 'dnYQ1Y0acrE',
      start: 1203.5,
      end: 1235,
    })
  })
})
