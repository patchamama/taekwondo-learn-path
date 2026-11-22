import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import type { PlaybackStep } from './audioPlan'
import { VocabularyPlayer } from './VocabularyPlayer'

vi.mock('./durations', () => ({ loadDurations: async () => ({}) }))
vi.mock('./images', () => ({ framesFor: () => [] }))
const clips: Clip[] = []
class Clip {
  currentTime = 0
  playbackRate = 1
  onended: (() => void) | null = null
  onerror: (() => void) | null = null
  pause = vi.fn()
  constructor(public src: string) {
    clips.push(this)
  }
  play = vi.fn(() => Promise.resolve())
}
// Timeline: A ko 0, silence 1, A meaning 3, B ko 5, silence 6,
// B meaning 8, reverse A meaning 10, reverse B meaning 12, description A 14–29.
const steps: PlaybackStep[] = [
  { id: 'basic-dojang', file: 'a-ko', role: 'ko' },
  { silence: 2 },
  { id: 'basic-dojang', file: 'a-es', role: 'meaning' },
  { id: 'ap-chagi', file: 'b-ko', role: 'ko' },
  { silence: 2 },
  { id: 'ap-chagi', file: 'b-es', role: 'meaning' },
  { id: 'basic-dojang', file: 'a-es', role: 'meaning', pass: 'reverse' },
  { id: 'ap-chagi', file: 'b-es', role: 'meaning', pass: 'reverse' },
  { id: 'basic-dojang', file: 'a-info', role: 'info', pass: 'description' },
]
const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
const flush = async () => {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(0)
  })
}
const position = () => Number((screen.getByRole('slider') as HTMLInputElement).value)

beforeEach(() => {
  vi.useFakeTimers()
  clips.length = 0
  vi.stubGlobal('Audio', Clip)
  useAppStore.getState().reset()
  useAppStore.setState({ lang: 'en' })
})
afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('accessible transport', () => {
  it.each([
    [
      'en',
      'Play',
      'Stop',
      'Previous term / technique',
      'Next term / technique',
      'Playback speed',
      'Back',
      'Forward',
    ],
    [
      'de',
      'Abspielen',
      'Stopp',
      'Vorheriger Begriff / Technik',
      'Nächster Begriff / Technik',
      'Wiedergabegeschwindigkeit',
      'Zurück',
      'Vorwärts',
    ],
    [
      'es',
      'Reproducir',
      'Detener',
      'Término / técnica anterior',
      'Término / técnica siguiente',
      'Velocidad de reproducción',
      'Retroceder',
      'Adelantar',
    ],
  ] as const)(
    'labels and disables empty controls in %s',
    (lang, play, stop, previous, next, speed, back, forward) => {
      useAppStore.setState({ lang })
      render(<VocabularyPlayer steps={[]} base="/" />)
      for (const name of [play, stop, previous, next, `${back} 5 s`, `${forward} 5 s`]) {
        const button = screen.getByRole('button', { name })
        expect(button).toBeDisabled()
        expect(button).toHaveAttribute('title', name)
      }
      expect(screen.getByRole('combobox', { name: speed })).toBeDisabled()
      expect(screen.getByRole('slider')).toBeDisabled()
    },
  )

  it('navigates unique items, not their silence, meaning or repeated passes; clamps endpoints', async () => {
    render(<VocabularyPlayer steps={steps} base="/" />)
    expect(screen.getByRole('button', { name: 'Previous term / technique' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Stop' })).toBeDisabled()
    click('Play')
    await flush()
    click('Next term / technique')
    await flush()
    expect(clips.at(-1)?.src).toBe('/b-ko')
    expect(position()).toBe(5)
    expect(clips[0].pause).toHaveBeenCalled()
    expect(screen.getByLabelText('audio-position')).toHaveTextContent('2/2')
    expect(screen.getByRole('button', { name: 'Next term / technique' })).toBeDisabled()
    fireEvent.change(screen.getByRole('slider'), { target: { value: '14' } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })
    click('Next term / technique')
    await flush()
    expect(clips.at(-1)?.src).toBe('/b-ko')
    click('Previous term / technique')
    await flush()
    expect(clips.at(-1)?.src).toBe('/a-ko')
    expect(position()).toBe(0)
    expect(screen.getByRole('button', { name: 'Previous term / technique' })).toBeDisabled()
    click('Stop')
    await flush()
    expect(screen.getByRole('button', { name: 'Stop' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled()
  })

  it.each([2, 5, 10, 15])(
    'jumps ±%s seconds across the timeline while stopped and clamps',
    async (n) => {
      render(<VocabularyPlayer steps={steps} base="/" />)
      fireEvent.change(screen.getByRole('combobox', { name: 'Seek seconds' }), {
        target: { value: String(n) },
      })
      click(`Forward ${n} s`)
      expect(position()).toBe(n)
      expect(clips).toHaveLength(0)
      click(`Back ${n} s`)
      expect(position()).toBe(0)
      expect(screen.getByRole('button', { name: `Back ${n} s` })).toBeDisabled()
      fireEvent.change(screen.getByRole('slider'), { target: { value: '28' } })
      click(`Forward ${n} s`)
      expect(position()).toBe(29)
      expect(screen.getByRole('button', { name: `Forward ${n} s` })).toBeDisabled()
      click('Play')
      await flush()
      expect(clips.at(-1)?.src).toBe('/a-ko')
    },
  )

  it('seeks into a clip and silence while running, cancels pending seeks on stop', async () => {
    render(<VocabularyPlayer steps={steps} base="/" />)
    click('Play')
    await flush()
    fireEvent.change(screen.getByRole('combobox', { name: 'Seek seconds' }), {
      target: { value: '10' },
    })
    click('Forward 10 s')
    await flush()
    expect(clips.at(-1)?.src).toBe('/a-es')
    expect(clips[0].pause).toHaveBeenCalled()
    fireEvent.change(screen.getByRole('combobox', { name: 'Seek seconds' }), {
      target: { value: '2' },
    })
    click('Back 2 s')
    await flush()
    expect(clips.at(-1)?.src).toBe('/b-es')
    click('Back 2 s')
    await flush() // silence at 6, next clip at 8
    const count = clips.length
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1999)
    })
    expect(clips).toHaveLength(count)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(clips.at(-1)?.src).toBe('/b-es')
    fireEvent.change(screen.getByRole('slider'), { target: { value: '13' } })
    click('Stop')
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000)
    })
    expect(clips).toHaveLength(count)
    expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled()
  })

  it('applies speed to current and subsequent recordings without moving the timeline', async () => {
    render(<VocabularyPlayer steps={steps} base="/" />)
    click('Play')
    await flush()
    fireEvent.change(screen.getByRole('combobox', { name: 'Playback speed' }), {
      target: { value: '1.5' },
    })
    expect(clips.at(-1)?.playbackRate).toBe(1.5)
    expect(position()).toBe(0)
    fireEvent.change(screen.getByRole('combobox', { name: 'Seek seconds' }), {
      target: { value: '2' },
    })
    click('Forward 2 s')
    await flush() // one second into the pause
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000 / 1.5 + 1)
    })
    expect(clips.at(-1)?.src).toBe('/a-es')
    expect(clips.at(-1)?.playbackRate).toBe(1.5)
    click('Forward 2 s')
    await flush()
    expect(clips.at(-1)?.src).toBe('/b-ko')
    expect(clips.at(-1)?.currentTime).toBeGreaterThanOrEqual(0)
  })

  it('preserves revealed cards across transport jumps and resumes at a clip offset', async () => {
    render(<VocabularyPlayer steps={steps} base="/" />)
    click('Play')
    await flush()
    await act(async () => {
      clips[0].onended?.()
    })
    expect(screen.getByText('도장')).toBeInTheDocument()
    click('Next term / technique')
    await flush()
    expect(screen.getByText('도장')).toBeInTheDocument()
    fireEvent.change(screen.getByRole('slider'), { target: { value: '9' } })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200)
    })
    expect(clips.at(-1)?.src).toBe('/b-es')
    expect(clips.at(-1)?.currentTime).toBe(1)
    expect(position()).toBe(9)
  })

  it('rescales the remaining silence when changing speed midway', async () => {
    render(<VocabularyPlayer steps={steps} base="/" />)
    click('Play')
    await flush()
    await act(async () => {
      clips[0].onended?.()
      await vi.advanceTimersByTimeAsync(1000)
    })
    fireEvent.change(screen.getByRole('combobox', { name: 'Playback speed' }), {
      target: { value: '2' },
    })
    await act(async () => {
      await vi.advanceTimersByTimeAsync(499)
    })
    expect(clips).toHaveLength(1)
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1)
    })
    expect(clips.at(-1)?.src).toBe('/a-es')
    expect(clips.at(-1)?.playbackRate).toBe(2)
  })

  it('does not replace an autoplay-blocked recording with synthesized speech', async () => {
    const speak = vi.fn()
    vi.stubGlobal('speechSynthesis', { getVoices: () => [], cancel: vi.fn(), speak })
    vi.stubGlobal(
      'Audio',
      class extends Clip {
        play = vi.fn(() => Promise.reject({ name: 'NotAllowedError' }))
      },
    )
    render(<VocabularyPlayer steps={steps} base="/" />)
    click('Play')
    await flush()
    expect(speak).not.toHaveBeenCalled()
    click('Stop')
    await flush()
    expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled()
  })

  it('uses the selected rate for browser speech on missing clips and cancels it on stop', async () => {
    const utterances: { text: string; lang: string; rate: number; onend?: () => void }[] = []
    const cancel = vi.fn()
    vi.stubGlobal(
      'SpeechSynthesisUtterance',
      class {
        constructor(public text: string) {}
      },
    )
    vi.stubGlobal('speechSynthesis', {
      getVoices: () => [],
      cancel,
      speak: (u: (typeof utterances)[number]) => utterances.push(u),
    })
    render(<VocabularyPlayer steps={steps} base="/" />)
    fireEvent.change(screen.getByRole('combobox', { name: 'Playback speed' }), {
      target: { value: '1.5' },
    })
    click('Play')
    await flush()
    await act(async () => {
      clips.at(-1)?.onerror?.()
    })
    expect(utterances).toHaveLength(1)
    expect(utterances[0]).toMatchObject({ text: '도장', lang: 'ko-KR', rate: 1.5 })
    fireEvent.change(screen.getByRole('combobox', { name: 'Playback speed' }), {
      target: { value: '0.75' },
    })
    expect(utterances.at(-1)?.rate).toBe(0.75)
    click('Stop')
    await flush()
    expect(cancel).toHaveBeenCalled()
    await act(async () => {
      utterances.at(-1)?.onend?.()
      await vi.advanceTimersByTimeAsync(10000)
    })
    expect(clips).toHaveLength(1)
  })
})

it('groups two seek buttons and the speed selector below progress without a visible speed label', () => {
  render(<VocabularyPlayer steps={steps} base="/" />)
  const transport = screen.getByRole('group', { name: 'Audio controls' })
  expect(transport.querySelectorAll('button')).toHaveLength(6)
  expect(
    screen.getByRole('slider').compareDocumentPosition(transport) &
      Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy()
  expect(screen.queryByText('Playback speed')).not.toBeInTheDocument()
  expect(screen.getByRole('combobox', { name: 'Seek seconds' })).toHaveValue('5')
})

it('selects the actual section across reverse and description passes and reports aggregate durations', async () => {
  render(<VocabularyPlayer steps={steps} base="/" />)
  click('Play')
  await flush()
  expect(screen.getByRole('button', { name: /^Korean terms \(/ })).toHaveAttribute(
    'aria-current',
    'true',
  )
  fireEvent.change(screen.getByRole('slider'), { target: { value: '12' } })
  await act(async () => {
    await vi.advanceTimersByTimeAsync(200)
  })
  expect(screen.getByRole('button', { name: /^Foot \(/ })).toHaveAttribute('aria-current', 'true')
  expect(screen.getByRole('button', { name: /^Korean terms \(/ })).toHaveTextContent('(0:07)')
  click(
    screen.getByRole('button', { name: /^Descriptions \(/ }).getAttribute('aria-label') ??
      'Descriptions (0:15)',
  )
  await flush()
  expect(screen.getByRole('button', { name: /^Descriptions \(/ })).toHaveAttribute(
    'aria-current',
    'true',
  )
})

it('reuses the user-initiated audio element for sequential recordings', async () => {
  render(<VocabularyPlayer steps={steps} base="/" />)
  click('Play')
  await flush()
  await act(async () => { clips[0].onended?.(); await vi.advanceTimersByTimeAsync(2000) })
  expect(clips).toHaveLength(1)
  expect(clips[0].src).toBe('/a-es')
})

it('stops on blocked playback without silently advancing past the failed recording', async () => {
  vi.stubGlobal('Audio', class extends Clip {
    play = vi.fn(() => Promise.reject({ name: 'NotAllowedError' }))
  })
  render(<VocabularyPlayer steps={steps} base="/" />)
  click('Play')
  await flush()
  await act(async () => { await vi.advanceTimersByTimeAsync(10000) })
  expect(position()).toBe(0)
  expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled()
  expect(clips).toHaveLength(1)
})


it('stops a stalled recording instead of running the timeline silently', async () => {
  render(<VocabularyPlayer steps={steps} base="/" />)
  click('Play')
  await flush()
  await act(async () => { await vi.advanceTimersByTimeAsync(16000) })
  expect(screen.getByRole('alert')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Play' })).toBeEnabled()
  expect(position()).toBe(0)
})

it('retains the same audio element across seeking and restarting', async () => {
  render(<VocabularyPlayer steps={steps} base="/" />)
  click('Play')
  await flush()
  click('Next term / technique')
  await flush()
  expect(clips).toHaveLength(1)
  expect(clips[0].src).toBe('/b-ko')
  click('Stop')
  click('Play')
  await flush()
  expect(clips).toHaveLength(1)
})

it('creates the reusable audio element during the play gesture even when the plan starts with silence', async () => {
  render(<VocabularyPlayer steps={[{ silence: 2 }, steps[0]]} base="/" />)
  click('Play')
  expect(clips).toHaveLength(1)
  await act(async () => { await vi.advanceTimersByTimeAsync(2000) })
  expect(clips).toHaveLength(1)
  expect(clips[0].src).toBe('/a-ko')
})
