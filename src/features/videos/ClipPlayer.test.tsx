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
  expect(player.seekTo).toHaveBeenLastCalledWith(10.25, true)
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

it('Play restarts at the beginning after reaching the clip boundary', () => {
  render(<ClipPlayer clip={clip} muted />)
  ready()
  const player = players[0]
  player.time = clip.start + 0.5
  act(() => vi.advanceTimersByTime(50))
  player.time = clip.end
  act(() => vi.advanceTimersByTime(50))
  player.seekTo.mockClear()
  player.playVideo.mockClear()
  fireEvent.click(screen.getByRole('button', { name: 'Play / Pause' }))
  expect(player.seekTo).toHaveBeenCalledWith(clip.start, true)
  expect(player.playVideo).toHaveBeenCalledTimes(1)
})

it('retains Play and Pause intentions while the platform is loading', () => {
  const view = render(<ClipPlayer clip={clip} autoplay={false} />)
  fireEvent.click(screen.getByRole('button', { name: 'Play / Pause' }))
  ready()
  expect(players[0].playVideo).toHaveBeenCalledTimes(1)
  view.rerender(<ClipPlayer clip={{ ...clip, videoId: 'two' }} autoplay />)
  fireEvent.click(screen.getByRole('button', { name: 'Play / Pause' }))
  ready()
  expect(players[1].playVideo).not.toHaveBeenCalled()
  expect(players[1].pauseVideo).toHaveBeenCalled()
})

it('resumes within the clip without resetting and toggles back to pause', () => {
  render(<ClipPlayer clip={clip} autoplay={false} />)
  ready()
  const player = players[0]
  player.time = 12
  player.seekTo.mockClear()
  fireEvent.click(screen.getByRole('button', { name: 'Play / Pause' }))
  expect(player.playVideo).toHaveBeenCalledTimes(1)
  expect(player.seekTo).not.toHaveBeenCalled()
  player.pauseVideo.mockClear()
  fireEvent.click(screen.getByRole('button', { name: 'Play / Pause' }))
  expect(player.pauseVideo).toHaveBeenCalledTimes(1)
})

it('allows an asynchronous restart seek to settle before enforcing the old end boundary', () => {
  render(<ClipPlayer clip={clip} muted />)
  ready()
  const player = players[0]
  player.time = clip.end
  act(() => vi.advanceTimersByTime(1600))
  player.pauseVideo.mockClear()
  fireEvent.click(screen.getByRole('button', { name: 'Play / Pause' }))
  act(() => {
    player.events.onStateChange({ data: 1 })
    vi.advanceTimersByTime(100)
  })
  expect(player.pauseVideo).not.toHaveBeenCalled()
  player.time = clip.start + 0.1
  act(() => vi.advanceTimersByTime(50))
  player.time = clip.end
  act(() => vi.advanceTimersByTime(50))
  expect(player.pauseVideo).toHaveBeenCalledTimes(1)
})

it('keeps multiple mounted clips of the same source visible and independently controllable', () => {
  render(<><ClipPlayer clip={clip} autoplay={false} /><ClipPlayer clip={{ ...clip, start: 30, end: 35 }} autoplay={false} /></>)
  expect(players).toHaveLength(2)
  act(() => players.forEach((player) => player.events.onReady()))
  const hosts = document.querySelectorAll('[data-video-source="one"]')
  expect(hosts).toHaveLength(2)
  hosts.forEach((host) => expect(host).not.toHaveAttribute('hidden'))
  const buttons = screen.getAllByRole('button', { name: 'Play / Pause' })
  fireEvent.click(buttons[0])
  expect(players[0].playVideo).toHaveBeenCalledTimes(1)
  fireEvent.click(buttons[1])
  expect(players[1].playVideo).toHaveBeenCalledTimes(1)
  expect(players[0].pauseVideo).toHaveBeenCalled()
  fireEvent.click(buttons[0])
  expect(players[0].playVideo).toHaveBeenCalledTimes(2)
})

it('shows the excerpt start when paused and after reaching the end', () => {
  render(<ClipPlayer clip={clip} autoplay={false} />)
  ready()
  const player = players[0]
  expect(player.seekTo).toHaveBeenLastCalledWith(10.25, true)
  player.time = 10.75
  act(() => vi.advanceTimersByTime(50))
  fireEvent.click(screen.getByRole('button', { name: 'Play / Pause' }))
  player.time = clip.end
  act(() => vi.advanceTimersByTime(100))
  expect(player.seekTo).toHaveBeenLastCalledWith(10.25, true)
  expect(screen.getByRole('progressbar')).toHaveAttribute('value', '4.5')
  fireEvent.click(screen.getByRole('button', { name: 'Play / Pause' }))
  expect(player.seekTo).toHaveBeenLastCalledWith(10.25, true)
})

it('waits for the player constructor when the YouTube global exists before the API is ready', () => {
  Object.assign(window, { YT: {} })
  render(<ClipPlayer clip={clip} autoplay={false} />)
  expect(players).toHaveLength(0)
  expect(screen.getByLabelText('Clip: ap-chagi')).toBeInTheDocument()
  Object.assign(window, { YT: { Player: MockPlayer } })
  act(() => window.onYouTubeIframeAPIReady?.())
  expect(players).toHaveLength(1)
  ready()
  expect(players[0].seekTo).toHaveBeenCalledWith(10.25, true)
})

it('can switch clips before the constructed YouTube player exposes its methods', () => {
  class PendingPlayer { constructor(_iframe: unknown, _options: unknown) {} }
  Object.assign(window, { YT: { Player: PendingPlayer } })
  const view = render(<ClipPlayer clip={clip} autoplay={false} />)
  expect(() => view.rerender(<ClipPlayer clip={{ ...clip, videoId: 'other' }} autoplay={false} />)).not.toThrow()
  expect(() => view.unmount()).not.toThrow()
})

it('previews a zero-start video at one second, bounded by the excerpt', () => {
  render(<ClipPlayer clip={{ ...clip, start: 0, end: 5 }} autoplay={false} />)
  ready()
  expect(players[0].seekTo).toHaveBeenLastCalledWith(1, true)
})

it('keeps a short zero-start preview inside the excerpt', () => {
  render(<ClipPlayer clip={{ ...clip, start: 0, end: 0.4 }} autoplay={false} />)
  ready()
  expect(players[0].seekTo).toHaveBeenLastCalledWith(0.399, true)
})

const poster = (source = 'one') => document.querySelector(`[data-video-source="${source}"] img[data-poster]`) as HTMLImageElement | null

it('covers a paused, never-played video with the first still of its clip (YouTube paints nothing in that state)', () => {
  render(<ClipPlayer clip={clip} autoplay={false} />)
  ready()
  const img = poster()
  expect(img).not.toBeNull()
  expect(img!.getAttribute('src')).toBe('/frames/ext-one/ap-chagi/1.jpg')
  expect(img!.hidden).toBe(false)
  expect(getComputedStyle(img!).pointerEvents).toBe('none')
})

it('hides the poster when the user plays the video and shows it again for the next paused preview', () => {
  const view = render(<ClipPlayer clip={clip} autoplay={false} />)
  ready()
  expect(poster()!.hidden).toBe(false)
  fireEvent.click(screen.getByRole('button', { name: 'Play / Pause' }))
  expect(poster()!.hidden).toBe(true)
  view.rerender(<ClipPlayer clip={{ ...clip, start: 30, end: 35 }} autoplay={false} />)
  expect(poster()!.hidden).toBe(false)
})

it('keeps the poster when the platform reports playback of a paused preview', () => {
  render(<ClipPlayer clip={clip} autoplay={false} />)
  ready()
  act(() => { players[0].events.onStateChange({ data: 1 }) })
  expect(poster()!.hidden).toBe(false)
})

it('shows no poster when the video autoplays, and removes a poster whose image does not exist', () => {
  const view = render(<ClipPlayer clip={clip} autoplay />)
  ready()
  expect(poster()!.hidden).toBe(true)
  view.unmount()
  render(<ClipPlayer clip={{ ...clip, videoId: 'two' }} autoplay={false} />)
  ready()
  const img = poster('two')!
  act(() => { img.dispatchEvent(new Event('error')) })
  expect(poster('two')).toBeNull()
})
