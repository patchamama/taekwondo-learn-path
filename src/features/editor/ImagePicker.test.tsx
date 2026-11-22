import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { ImagePicker } from './ImagePicker'

const routes: Record<string, unknown> = {}
const calls: { url: string; init?: RequestInit }[] = []

beforeEach(() => {
  calls.length = 0
  useAppStore.setState({ lang: 'en' })
  Object.assign(routes, {
    '/api/library/epub': {
      total: 2,
      items: [
        { book: 'b1', bookTitle: 'Poomsae Book', name: 'OEBPS/img1.jpg', bytes: 50000 },
        { book: 'b1', bookTitle: 'Poomsae Book', name: 'OEBPS/img2.jpg', bytes: 60000 },
      ],
    },
    '/api/library/epub/import': {
      ok: true,
      src: 'images/cards/abc.jpg',
      source: 'Poomsae Book — OEBPS/img1.jpg',
    },
    '/api/videos': [
      { id: 'vid1', label: 'Course (German dub)', cards: [], local: true },
      { id: 'vid2', label: 'No copy', cards: ['ap-chagi'], local: false },
    ],
    '/api/video/info': { ok: true, duration: 100 },
    '/api/videos/search': [
      { t: 822, text: 'Les positions · moa', videoId: 'vid1', source: 'chapters' },
    ],
    '/api/frame/save': { ok: true, src: 'images/cards/frame.jpg', source: 'Video vid1 @ 20.0s' },
  })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init?: RequestInit) => {
      const url = String(input)
      calls.push({ url, init })
      const key = Object.keys(routes).find((k) => url.startsWith(k + '?') || url === k)
      return {
        ok: Boolean(key),
        json: async () => (key ? routes[key] : { ok: false, error: 'nope' }),
      } as Response
    }),
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('ImagePicker', () => {
  it('clips tab: finds a technique by name and picks one of its frames', () => {
    const onPick = vi.fn()
    render(<ImagePicker onPick={onPick} onClose={() => {}} />)
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ap-chagi' } })
    const group = screen.getByRole('group', { name: 'ap-chagi' })
    expect(within(group).getAllByRole('button').length).toBeGreaterThan(0)
    fireEvent.click(within(group).getAllByRole('button')[0])
    expect(onPick).toHaveBeenCalledTimes(1)
    expect(onPick.mock.calls[0][0].src).toMatch(/^frames\/.+\/ap-chagi\/\d\.jpg$/)
  })

  it('library tab: lists the book images and imports the chosen one', async () => {
    const onPick = vi.fn()
    render(<ImagePicker onPick={onPick} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Book images' }))
    const buttons = await screen.findAllByRole('button', { name: /Poomsae Book/ })
    expect(buttons).toHaveLength(2)
    fireEvent.click(buttons[0])
    await waitFor(() =>
      expect(onPick).toHaveBeenCalledWith({
        src: 'images/cards/abc.jpg',
        source: 'Poomsae Book — OEBPS/img1.jpg',
      }),
    )
  })

  it('videos tab: moves the position by 3, 5 and 10 seconds and captures the frame', async () => {
    const onPick = vi.fn()
    render(<ImagePicker onPick={onPick} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Videos' }))
    fireEvent.click(await screen.findByRole('button', { name: /Course \(German dub\)/ }))
    const frame = await screen.findByRole('img', { name: 'Frame at 0:00' })
    expect(frame.getAttribute('src')).toContain('id=vid1')
    for (const [label, at] of [
      ['+10 s', '0:10'],
      ['+5 s', '0:15'],
      ['+3 s', '0:18'],
      ['−3 s', '0:15'],
    ] as const) {
      fireEvent.click(screen.getByRole('button', { name: label }))
      expect(screen.getByRole('img', { name: `Frame at ${at}` })).toBeInTheDocument()
    }
    fireEvent.click(screen.getByRole('button', { name: /Use this frame/ }))
    await waitFor(() =>
      expect(onPick).toHaveBeenCalledWith({
        src: 'images/cards/frame.jpg',
        source: 'Video vid1 @ 20.0s',
      }),
    )
    const save = calls.find((c) => c.url === '/api/frame/save')!
    expect(JSON.parse(String(save.init?.body))).toEqual({ id: 'vid1', t: 15 })
  })

  it('videos tab: searching the index jumps to that position', async () => {
    render(<ImagePicker onPick={() => {}} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Videos' }))
    await screen.findByRole('button', { name: /Course \(German dub\)/ })
    fireEvent.change(screen.getByRole('searchbox', { name: 'Search the index and subtitles' }), {
      target: { value: 'positions' },
    })
    fireEvent.click(await screen.findByRole('button', { name: /13:42/ }))
    expect(await screen.findByRole('img', { name: 'Frame at 13:42' })).toBeInTheDocument()
  })

  it('videos tab: says when the video has no local copy', async () => {
    render(<ImagePicker onPick={() => {}} onClose={() => {}} />)
    fireEvent.click(screen.getByRole('tab', { name: 'Videos' }))
    fireEvent.click(await screen.findByRole('button', { name: /No copy/ }))
    expect(await screen.findByText(/no local copy/i)).toBeInTheDocument()
  })
})
