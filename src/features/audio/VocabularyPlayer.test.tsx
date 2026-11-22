import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { audioFile } from '../../data/audioFiles'
import { useAppStore } from '../../shared/store/useAppStore'
import type { PlaybackStep } from './audioPlan'
import { VocabularyPlayer } from './VocabularyPlayer'

const played: string[] = []

class FakeAudio {
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  constructor(public src: string) {}
  play() {
    played.push(this.src)
    queueMicrotask(() => this.onended?.())
    return Promise.resolve()
  }
  pause() {}
}

const STEPS: PlaybackStep[] = [
  { file: audioFile('ko', 'dojang'), role: 'ko', id: 'basic-dojang' },
  { silence: 2 },
  { file: audioFile('es', 'dojang'), role: 'meaning', id: 'basic-dojang' },
  { silence: 1.5 },
]

describe('VocabularyPlayer', () => {
  beforeEach(() => {
    played.length = 0
    vi.useFakeTimers()
    vi.stubGlobal('Audio', FakeAudio)
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'es' })
  })
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('writes the Korean word only after it was said, and the meaning after its pause', async () => {
    render(<VocabularyPlayer steps={STEPS} base="/" />)
    expect(screen.queryByText('도장')).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Reproducir/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(played).toEqual(['/' + audioFile('ko', 'dojang')])
    expect(screen.getByText('도장')).toBeInTheDocument()
    expect(screen.queryByText('sala de entrenamiento')).not.toBeInTheDocument()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1999)
    })
    expect(played).toHaveLength(1)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(played).toHaveLength(2)
    expect(screen.getByText('sala de entrenamiento')).toBeInTheDocument()
  })

  it('stops playing when asked', async () => {
    render(<VocabularyPlayer steps={STEPS} base="/" />)
    fireEvent.click(screen.getByRole('button', { name: /Reproducir/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    fireEvent.click(screen.getByRole('button', { name: /Detener/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })
    expect(played).toHaveLength(1)
    expect(screen.getByRole('button', { name: /Reproducir/ })).toBeInTheDocument()
  })
})
