import { act } from '@testing-library/react'
import { vi } from 'vitest'

/** Minimal public YouTube IFrame API double for consuming-component contracts. */
export function mockYouTube() {
  const players: PlatformPlayer[] = []
  class PlatformPlayer {
    seekTo = vi.fn()
    playVideo = vi.fn()
    pauseVideo = vi.fn()
    mute = vi.fn()
    unMute = vi.fn()
    destroy = vi.fn()
    getCurrentTime = () => 0
    constructor(_iframe: HTMLIFrameElement, readonly options: {
      events: { onReady: () => void; onStateChange: (event: { data: number }) => void }
    }) { players.push(this) }
  }
  vi.stubGlobal('YT', { Player: PlatformPlayer })
  return {
    players,
    ready: () => act(() => players.forEach((player) => player.options.events.onReady())),
  }
}

export function teardownYouTube() {
  act(() => window.dispatchEvent(new Event('pagehide')))
  vi.unstubAllGlobals()
}
