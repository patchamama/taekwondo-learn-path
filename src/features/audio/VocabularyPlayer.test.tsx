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
  currentTime = 0
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

describe('VocabularyPlayer seeking and chapters', () => {
  const MORE: PlaybackStep[] = [
    { file: audioFile('ko', 'm1'), role: 'ko', id: 'macki' },
    { silence: 2 },
    { file: audioFile('es', 'm1'), role: 'meaning', id: 'macki' },
    { silence: 1.5 },
    { file: audioFile('ko', 'm2'), role: 'ko', id: 'ap-chagi' },
    { silence: 2 },
    { file: audioFile('es', 'm2'), role: 'meaning', id: 'ap-chagi' },
    { silence: 1.5 },
    { file: audioFile('info-es', 'm2'), role: 'info', id: 'ap-chagi' },
    { silence: 2 },
  ]

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

  it('shows a progress bar that can be moved to any position', async () => {
    render(<VocabularyPlayer steps={MORE} base="/" />)
    const bar = screen.getByRole('slider', { name: 'Posición' })
    expect(Number(bar.getAttribute('max'))).toBeGreaterThan(10)
    fireEvent.click(screen.getByRole('button', { name: /Reproducir/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(played[0]).toBe('/' + audioFile('ko', 'm1'))
    // jump to the second word: the player restarts there instead of finishing the first
    const target = Number(bar.getAttribute('max')) * 0.5
    fireEvent.change(bar, { target: { value: String(target) } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(played.some((f) => f.includes('/m2-'))).toBe(true)
    expect(played.filter((f) => f.includes('/m1-'))).toHaveLength(1)
  })

  it('jumps to a chapter and to the descriptions', async () => {
    render(<VocabularyPlayer steps={MORE} base="/" />)
    fireEvent.click(screen.getByRole('button', { name: 'Descripciones' }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(played).toEqual(['/' + audioFile('info-es', 'm2')])
    expect(screen.getByRole('button', { name: 'Ladrillos de las palabras' })).toBeInTheDocument()
  })

  it('repeats a single word from the transcript', async () => {
    render(<VocabularyPlayer steps={MORE} base="/" />)
    fireEvent.click(screen.getByRole('button', { name: /Reproducir/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    played.length = 0
    fireEvent.click(screen.getAllByRole('button', { name: /Repetir esta palabra/ })[0])
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(played[0]).toBe('/' + audioFile('ko', 'm1'))
  })
})
