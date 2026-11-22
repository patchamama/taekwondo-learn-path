import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { audioFile } from '../../data/audioFiles'
import { CARD_BY_ID } from '../../data/cards'
import { AUDIO_ITEMS } from '../../data/audioManifest'
import { useAppStore } from '../../shared/store/useAppStore'
import { buildPlayback, type PlaybackStep } from './audioPlan'
import { VocabularyPlayer } from './VocabularyPlayer'

vi.mock('./images', () => ({ framesFor: () => ['/technique.jpg'] }))

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

  it('shows the selected item ordinal and total alongside progress, including seeking and completion', async () => {
    render(<VocabularyPlayer steps={MORE} base="/" />)
    expect(screen.getByLabelText('audio-position')).toHaveTextContent('0/2')
    fireEvent.click(screen.getByRole('button', { name: /Reproducir/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(screen.getByLabelText('audio-position')).toHaveTextContent('1/2')
    fireEvent.click(screen.getByRole('button', { name: /^Descripciones \(/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(screen.getByLabelText('audio-position')).toHaveTextContent('2/2')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    expect(screen.getByLabelText('audio-position')).toHaveTextContent('2/2')
    fireEvent.change(screen.getByRole('slider'), { target: { value: '0' } })
    expect(screen.getByLabelText('audio-position')).toHaveTextContent('1/2')
  })

  it('resets and silences playback when a different selection has the same step count', async () => {
    const onRunningChange = vi.fn()
    const { rerender } = render(
      <VocabularyPlayer steps={STEPS} base="/" onRunningChange={onRunningChange} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /Reproducir/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    const replacement: PlaybackStep[] = [MORE[4], MORE[5], MORE[6], MORE[7]]
    rerender(<VocabularyPlayer steps={replacement} base="/" onRunningChange={onRunningChange} />)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(10000)
    })
    expect(played).toEqual(['/' + audioFile('ko', 'dojang')])
    expect(screen.getByRole('button', { name: /Reproducir/ })).toBeInTheDocument()
    expect(screen.queryByText('도장')).not.toBeInTheDocument()
    expect(screen.getByLabelText('audio-position')).toHaveTextContent('0/1')
    expect(onRunningChange).toHaveBeenLastCalledWith(false)
    fireEvent.click(screen.getByRole('button', { name: /Reproducir/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(played.at(-1)).toBe('/' + audioFile('ko', 'm2'))
  })

  it('keeps the technique card and image visible during and after a description, even when jumping directly there', async () => {
    let finish: (() => void) | undefined
    vi.stubGlobal(
      'Audio',
      class extends FakeAudio {
        play() {
          if (!this.src.includes('/info-')) return super.play()
          played.push(this.src)
          finish = () => this.onended?.()
          return Promise.resolve()
        }
      },
    )
    const technique = AUDIO_ITEMS.find((item) => item.kind === 'technique' && item.info)!
    const descriptionSteps: PlaybackStep[] = [
      ...STEPS,
      { file: audioFile('info-es', technique.id), role: 'info', id: technique.id },
      { silence: 2 },
    ]
    render(<VocabularyPlayer steps={descriptionSteps} base="/" />)
    fireEvent.click(screen.getByRole('button', { name: /^Descripciones \(/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(screen.getByText(technique.hangul)).toBeInTheDocument()
    expect(screen.getByRole('listitem')).toHaveTextContent(technique.meaning.es)
    expect(screen.getByRole('listitem')).toHaveTextContent(technique.info!.es)
    expect(screen.getByRole('img', { name: CARD_BY_ID[technique.id].ko })).toHaveAttribute(
      'src',
      '/technique.jpg',
    )
    await act(async () => {
      finish?.()
      await vi.advanceTimersByTimeAsync(2000)
    })
    expect(screen.getByRole('button', { name: /Reproducir/ })).toBeInTheDocument()
    expect(screen.getByText(technique.hangul)).toBeInTheDocument()
    expect(screen.getByRole('img', { name: CARD_BY_ID[technique.id].ko })).toHaveAttribute(
      'src',
      '/technique.jpg',
    )
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

  it('starts the generated descriptions chapter with the existing Korean mp3, then meaning and description', async () => {
    const technique = AUDIO_ITEMS.find((item) => item.kind === 'technique' && item.info)!
    const steps = buildPlayback([technique], {
      lang: 'es',
      maxBelt: 10,
      onlyBelt: null,
      vocabulary: true,
      techniques: true,
      descriptions: true,
      japanese: false,
    })
    render(<VocabularyPlayer steps={steps} base="/" />)
    fireEvent.click(screen.getByRole('button', { name: /^Descripciones \(/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(played).toEqual(['/' + audioFile('ko', technique.id)])
    expect(screen.getByText(technique.hangul)).toBeInTheDocument()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    expect(played).toEqual([
      '/' + audioFile('ko', technique.id),
      '/' + audioFile('es', technique.id),
      '/' + audioFile('info-es', technique.id),
    ])
    expect(screen.getByRole('listitem')).toHaveTextContent(technique.info!.es)
    fireEvent.click(screen.getByRole('button', { name: technique.info!.es }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(played.at(-1)).toBe('/' + audioFile('info-es', technique.id))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    expect(screen.getByRole('img', { name: CARD_BY_ID[technique.id].ko })).toBeInTheDocument()
  })

  it('jumps to a chapter and to the descriptions', async () => {
    render(<VocabularyPlayer steps={MORE} base="/" />)
    fireEvent.click(screen.getByRole('button', { name: /^Descripciones \(/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(played).toEqual(['/' + audioFile('info-es', 'm2')])
    expect(
      screen.getByRole('button', { name: /^Ladrillos de las palabras \(/ }),
    ).toBeInTheDocument()
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

describe('VocabularyPlayer reverse pass', () => {
  const REVERSE: PlaybackStep[] = [
    { file: audioFile('ko', 'dojang'), role: 'ko', id: 'basic-dojang' },
    { silence: 2 },
    { file: audioFile('es', 'dojang'), role: 'meaning', id: 'basic-dojang' },
    { silence: 1.5 },
    { file: audioFile('es', 'dojang'), role: 'meaning', id: 'basic-dojang', pass: 'reverse' },
    { silence: 2 },
    { file: audioFile('ko', 'dojang'), role: 'ko', id: 'basic-dojang', pass: 'reverse' },
    { silence: 1.5 },
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

  it('hides the Korean word again when the meaning is asked first, and writes it after it is said', async () => {
    render(<VocabularyPlayer steps={REVERSE} base="/" />)
    fireEvent.click(screen.getByRole('button', { name: /Reproducir/ }))
    // forward pass: ko, 2 s, meaning, 1.5 s → then the reverse meaning clip
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
      await vi.advanceTimersByTimeAsync(2000)
      await vi.advanceTimersByTimeAsync(1500)
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(played).toHaveLength(3) // ko, meaning, meaning (reverse)
    expect(screen.getByText('sala de entrenamiento')).toBeInTheDocument()
    expect(screen.queryByText('도장')).not.toBeInTheDocument() // hidden until said again
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    expect(played).toHaveLength(4)
    expect(screen.getByText('도장')).toBeInTheDocument()
  })
})

describe('clickable transcript', () => {
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

  it('replays the chosen Korean and Japanese transcript parts', async () => {
    const item = AUDIO_ITEMS.find((item) => item.ja)!
    const selected: PlaybackStep[] = [
      { file: 'word-ko', role: 'ko', id: item.id },
      { file: 'word-ja', role: 'ja', id: item.id },
    ]
    render(<VocabularyPlayer steps={selected} base="/" />)
    fireEvent.click(screen.getByRole('button', { name: /Reproducir/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    fireEvent.click(
      screen.getByRole('button', {
        name: `${item.ja}${item.jaRomaji ? ` (${item.jaRomaji})` : ''}`,
      }),
    )
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(played.at(-1)).toBe('/word-ja')
    fireEvent.click(
      screen.getByRole('button', { name: `${item.hangul} ${CARD_BY_ID[item.id].ko}` }),
    )
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(played.slice(-2)).toEqual(['/word-ko', '/word-ja'])
  })

  it('replays the selected meaning rather than the first Korean recording and shows section and Kup', async () => {
    render(<VocabularyPlayer steps={STEPS} base="/" />)
    fireEvent.click(screen.getByRole('button', { name: /Reproducir/ }))
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000)
    })
    const meaning = screen.getByRole('button', { name: 'sala de entrenamiento' })
    played.length = 0
    fireEvent.click(meaning)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(0)
    })
    expect(played[0]).toBe('/' + audioFile('es', 'dojang'))
    expect(screen.getByRole('listitem')).toHaveTextContent('10 Kup')
    expect(screen.getByRole('listitem')).toHaveTextContent('Términos')
  })
})

it('matches chapter button colors to every repeated timeline segment', () => {
  useAppStore.setState({ lang: 'es' })
  const steps: PlaybackStep[] = [
    { file: 'a', role: 'ko', id: 'macki' }, { silence: 2 },
    { file: 'b', role: 'ko', id: 'ap-chagi' },
    { file: 'c', role: 'ko', id: 'macki' },
    { file: 'd', role: 'info', id: 'macki', pass: 'description' },
  ]
  const { container } = render(<VocabularyPlayer steps={steps} base="/" />)
  const segments = container.querySelectorAll<HTMLElement>('[data-audio-segment]')
  expect(Array.from(segments, (node) => node.dataset.audioSegment)).toEqual(['words', 'foot', 'words', 'descriptions'])
  const buttons = container.querySelectorAll<HTMLElement>('[data-audio-chapter]')
  for (const segment of segments) {
    const button = Array.from(buttons).find((node) => node.dataset.audioChapter === segment.dataset.audioSegment)
    expect(segment.style.backgroundColor).toBe(button?.style.backgroundColor)
  }
  expect(segments[0].style.width).toBe('15%')
  expect(screen.getByRole('slider')).toBeEnabled()
})
