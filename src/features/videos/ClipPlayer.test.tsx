import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import type { Clip } from '../../data/clips'
import { useAppStore } from '../../shared/store/useAppStore'
import { ClipPlayer } from './ClipPlayer'

const players: MockPlayer[] = []
class MockPlayer {
  seekTo = vi.fn()
  playVideo = vi.fn()
  pauseVideo = vi.fn()
  mute = vi.fn()
  unMute = vi.fn()
  destroy = vi.fn()
  time = 0
  getCurrentTime = () => this.time
  constructor(_host: unknown, options: { events: { onReady: () => void; onStateChange: (event: { data: number }) => void } }) {
    players.push(this)
    this.events = options.events
  }
  events: { onReady: () => void; onStateChange: (event: { data: number }) => void }
}
const clip: Clip = { cardId: 'ap-chagi', source: 'external', videoId: 'one', start: 10.25, end: 14.75 }
const ready = () => act(() => players.at(-1)!.events.onReady())
beforeEach(() => {
  vi.useFakeTimers()
  players.length = 0
  Object.assign(window, { YT: { Player: MockPlayer } })
  useAppStore.setState({ lang: 'en', videoLang: 'auto' })
})
afterEach(() => {
  act(() => window.dispatchEvent(new Event('pagehide')))
  vi.useRealTimers()
})

it('retains the same source across clips and remounts; hides and pauses inactive sources', () => {
  const view = render(<ClipPlayer clip={clip} muted />)
  ready()
  const first = players[0]
  expect(first.seekTo).toHaveBeenLastCalledWith(10.25, true)
  expect(first.mute).toHaveBeenCalled()
  expect(first.playVideo).toHaveBeenCalledTimes(1)
  view.rerender(<ClipPlayer clip={{ ...clip, start: 30, end: 35 }} muted />)
  expect(players).toHaveLength(1)
  expect(first.seekTo).toHaveBeenLastCalledWith(30, true)
  view.rerender(<ClipPlayer clip={{ ...clip, videoId: 'two' }} autoplay={false} />)
  ready()
  expect(first.pauseVideo).toHaveBeenCalled()
  expect(document.querySelector('[data-video-source="one"]')).toHaveAttribute('hidden')
  expect(players[1].playVideo).not.toHaveBeenCalled()
  view.unmount()
  expect(players[1].pauseVideo).toHaveBeenCalled()
  expect(first.destroy).not.toHaveBeenCalled()
  render(<ClipPlayer clip={clip} autoplay={false} />)
  expect(players).toHaveLength(2)
  expect(first.unMute).toHaveBeenCalled()
  expect(first.seekTo).toHaveBeenLastCalledWith(10.25, true)
})

it('shows duration/progress, clamps playback to fractional bounds and replays via seek', () => {
  render(<ClipPlayer clip={clip} muted />)
  ready()
  const player = players[0]
  expect(screen.getByRole('progressbar')).toHaveAttribute('max', '4.5')
  player.time = 12.25
  act(() => vi.advanceTimersByTime(100))
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '2')
  player.time = 15
  act(() => vi.advanceTimersByTime(100))
  expect(player.pauseVideo).toHaveBeenCalled()
  expect(player.seekTo).toHaveBeenLastCalledWith(14.75, true)
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '4.5')
  fireEvent.click(screen.getByRole('button', { name: /Replay/ }))
  expect(player.seekTo).toHaveBeenLastCalledWith(10.25, true)
  player.time = 3
  act(() => vi.advanceTimersByTime(100))
  expect(player.seekTo).toHaveBeenLastCalledWith(10.25, true)
  expect(player.mute).toHaveBeenCalled()
})

it('keeps iframe identity while maximizing and destroys all retained players on teardown', () => {
  const view = render(<ClipPlayer clip={clip} />)
  ready()
  const iframe = document.querySelector('iframe')
  fireEvent.click(screen.getByRole('button', { name: /Maximize/ }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(document.querySelector('iframe')).toBe(iframe)
  expect(players).toHaveLength(1)
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(players).toHaveLength(1)
  view.rerender(<ClipPlayer clip={{ ...clip, videoId: 'two' }} />)
  ready()
  act(() => window.dispatchEvent(new Event('pagehide')))
  for (const player of players) expect(player.destroy).toHaveBeenCalledTimes(1)
  expect(document.querySelector('[data-video-cache]')).toBeNull()
})

it('does not allow a late ready or play event to restart an inactive player', () => {
  const view = render(<ClipPlayer clip={clip} muted />)
  const old = players[0]
  view.rerender(<ClipPlayer clip={{ ...clip, videoId: 'two' }} muted />)
  ready()
  act(() => {
    old.events.onReady()
    old.events.onStateChange({ data: 1 })
  })
  expect(old.playVideo).not.toHaveBeenCalled()
  expect(old.pauseVideo).toHaveBeenCalled()
})
