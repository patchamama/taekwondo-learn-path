import { act, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../store/useAppStore'
import { AudioSourceBadge } from './AudioSourceBadge'

describe('AudioSourceBadge', () => {
  beforeEach(() => {
    useAppStore.setState({ lang: 'en' })
    vi.stubGlobal('Audio', class { playbackRate = 1; onerror = null; constructor(public src: string) {} play() { return Promise.resolve() } pause() {} })
  })

  it('shows nothing until something is spoken, then says it was the mp3 and offers the download', async () => {
    const { speakKorean } = await import('../lib/speech')
    const { AUDIO_ITEMS } = await import('../../data/audioManifest')
    const { container } = render(<AudioSourceBadge />)
    expect(container.textContent).not.toMatch(/mp3/i)
    act(() => {
      speakKorean(AUDIO_ITEMS[0].hangul)
    })
    expect(screen.getByText(/Recorded voice \(mp3\)/)).toBeInTheDocument()
    const link = screen.getByRole('link', { name: /Download/ })
    expect(link.getAttribute('href')).toMatch(/audio\/ko\/.+\.mp3$/)
    expect(link).toHaveAttribute('download')
  })

  it('says it was the browser voice when there is no recording', async () => {
    vi.stubGlobal('SpeechSynthesisUtterance', class { lang = ''; rate = 1; voice = null; constructor(public text: string) {} })
    vi.stubGlobal('speechSynthesis', { getVoices: () => [], cancel: () => {}, speak: () => {} })
    const { speakKorean } = await import('../lib/speech')
    render(<AudioSourceBadge />)
    act(() => {
      speakKorean('아무도없는말')
    })
    expect(screen.getByText(/Browser voice/)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /Download/ })).not.toBeInTheDocument()
  })
})
