import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { ClipsEditor } from './ClipsEditor'

const calls: { url: string; init?: RequestInit }[] = []

beforeEach(() => {
  calls.length = 0
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
  it('shows the range of each clip with a preview of its first and last frame', () => {
    render(<ClipsEditor cardId="ap-chagi" onSaved={() => {}} />)
    expect(screen.getByRole('spinbutton', { name: /Start .*course/i })).toHaveValue(1200)
    expect(screen.getByRole('spinbutton', { name: /End .*course/i })).toHaveValue(1235)
    const imgs = screen.getAllByRole('img')
    expect(imgs[0].getAttribute('src')).toContain('/api/frame?id=dnYQ1Y0acrE&t=1200.0')
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
