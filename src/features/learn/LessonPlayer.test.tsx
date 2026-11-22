import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { CARD_BY_ID } from '../../data/cards'
import { LessonPlayer } from './LessonPlayer'
import type { Exercise } from './exercises'
import { mockYouTube, teardownYouTube } from '../videos/playerTestUtils'

afterEach(teardownYouTube)

const ex: Exercise = {
  type: 'meaning',
  cardId: 'macki',
  options: ['macki', 'chagi', 'sogi', 'gubi'],
}

describe('LessonPlayer', () => {
  beforeEach(() => {
    useAppStore.setState({ lang: 'en', quizAutoCheck: false, quizResultMode: 'button', quizAutoContinue: false })
  })

  it('gives feedback, requeues a wrong answer once and finishes', () => {
    const onFinish = vi.fn()
    render(<LessonPlayer exercises={[ex]} beltColor="#fff" onFinish={onFinish} onExit={() => {}} />)

    // wrong answer
    fireEvent.click(screen.getByRole('button', { name: CARD_BY_ID.chagi.meaning.en }))
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(within(screen.getByRole('dialog')).getByText(/Correct answer/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onFinish).not.toHaveBeenCalled() // the exercise comes back

    // right answer on retry
    fireEvent.click(screen.getByRole('button', { name: CARD_BY_ID.macki.meaning.en }))
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))

    expect(onFinish).toHaveBeenCalledTimes(1)
    const result = onFinish.mock.calls[0][0]
    expect(result.total).toBe(1)
    expect(result.correct).toBe(0) // first try was wrong
    expect(result.answers.map((a: { correct: boolean }) => a.correct)).toEqual([false, true])
  })

  it('builds a technique name from word blocks', () => {
    const build: Exercise = {
      type: 'build',
      cardId: 'olgul-macki',
      chips: ['macki', 'olgul', 'chagi'],
    }
    const onFinish = vi.fn()
    render(
      <LessonPlayer exercises={[build]} beltColor="#fff" onFinish={onFinish} onExit={() => {}} />,
    )
    const chip = (n: string) =>
      screen
        .getAllByRole('button')
        .find((b) => b.textContent?.startsWith(n) && !b.closest('[data-testid]'))!
    fireEvent.click(chip('olgul'))
    fireEvent.click(chip('macki'))
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(onFinish.mock.calls[0][0].correct).toBe(1)
  })
})

describe('LessonPlayer quiz behaviour', () => {
  const two: Exercise = { type: 'meaning', cardId: 'chagi', options: ['macki', 'chagi', 'sogi', 'gubi'] }
  const answer = (id: string) => fireEvent.click(screen.getByRole('button', { name: CARD_BY_ID[id].meaning.en }))
  const show = (list: Exercise[], onFinish = vi.fn()) =>
    render(<LessonPlayer exercises={list} beltColor="#fff" onFinish={onFinish} onExit={() => {}} />)

  beforeEach(() => {
    useAppStore.setState({ lang: 'en', quizAutoCheck: true, quizResultMode: 'button', quizAutoContinue: false })
  })
  afterEach(() => vi.useRealTimers())

  it('checks the answer as soon as it is chosen, with no Check button, and shows the result centred', () => {
    show([ex])
    expect(screen.queryByRole('button', { name: 'Check' })).not.toBeInTheDocument()
    answer('macki')
    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })

  it('keeps the Check button when auto-check is off', () => {
    useAppStore.setState({ quizAutoCheck: false })
    show([ex])
    answer('macki')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument()
  })

  it('shows the position as 1/1, paints a wrong answer red and asks it again at the end', () => {
    show([ex, two])
    expect(screen.getByLabelText('question-counter')).toHaveTextContent('1/2')
    answer('chagi') // wrong for ex (macki)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    const segments = [...document.querySelectorAll('[data-state]')].map((n) => n.getAttribute('data-state'))
    expect(segments).toEqual(['bad', 'current', 'pending']) // the wrong one is queued again at the end
    expect(screen.getByLabelText('question-counter')).toHaveTextContent('2/3')
  })

  it('logs the last evaluation at the bottom with the correct answer when it was wrong', () => {
    show([ex])
    answer('chagi')
    const log = screen.getByRole('region', { name: 'Quiz log' })
    expect(within(log).getByText(/Wrong/)).toBeInTheDocument()
    expect(within(log).getByText(CARD_BY_ID.macki.meaning.en)).toBeInTheDocument()
  })

  it('offers the clip of the card from the log in a modal', () => {
    const withClip: Exercise = { type: 'meaning', cardId: 'ap-chagi', options: ['ap-chagi', 'yop-chagi', 'dollyo-chagi', 'düt-chagi'] }
    show([withClip])
    fireEvent.click(screen.getByRole('button', { name: CARD_BY_ID['yop-chagi'].meaning.en }))
    fireEvent.click(within(screen.getByRole('region', { name: 'Quiz log' })).getByRole('button', { name: /See image/ }))
    expect(screen.getAllByRole('dialog').length).toBeGreaterThan(0)
  })

  it('closes the result after 3 seconds and continues by itself when asked to', () => {
    vi.useFakeTimers()
    useAppStore.setState({ quizResultMode: '3s', quizAutoContinue: true })
    const onFinish = vi.fn()
    show([ex], onFinish)
    answer('macki')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(2900)
    })
    expect(onFinish).not.toHaveBeenCalled()
    act(() => {
      vi.advanceTimersByTime(200)
    })
    expect(onFinish).toHaveBeenCalledTimes(1)
  })

  it('after the time it only closes the window when automatic continue is off', () => {
    vi.useFakeTimers()
    useAppStore.setState({ quizResultMode: '5s', quizAutoContinue: false })
    const onFinish = vi.fn()
    show([ex], onFinish)
    answer('macki')
    act(() => {
      vi.advanceTimersByTime(5100)
    })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(onFinish).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument()
  })
})

describe('LessonPlayer new formats and options', () => {
  const show = (list: Exercise[]) =>
    render(<LessonPlayer exercises={list} beltColor="#fff" onFinish={() => {}} onExit={() => {}} />)
  const recall: Exercise = { type: 'recall', cardId: 'macki', options: ['macki', 'chagi', 'sogi', 'gubi'] }

  beforeEach(() => {
    useAppStore.setState({ lang: 'en', quizAutoCheck: false, quizResultMode: 'button', quizAutoContinue: false, hangulOnly: false, clipLayout: 'row' })
  })

  it('puts a speaker icon on every Korean option that has a recorded voice', () => {
    show([recall])
    const buttons = screen.getAllByRole('button', { name: /Listen:|Escuchar:|Speak|Hear/i })
    expect(buttons.length).toBeGreaterThanOrEqual(4)
  })

  it('shows Korean terms in hangul only, with no Latin letters, when the option is on', () => {
    useAppStore.setState({ hangulOnly: true })
    show([recall])
    const labels = screen.getAllByRole('button', { pressed: false }).map((b) => b.textContent ?? '')
    expect(labels.some((l) => l.includes(CARD_BY_ID.macki.hangul) && !/[a-z]/i.test(l.replace(/Listen.*/i, '')))).toBe(true)
    expect(screen.queryByText(new RegExp(`${CARD_BY_ID.macki.ko} · `))).not.toBeInTheDocument()
  })

  it('shows a silent clip and asks which technique it is', () => {
    const video: Exercise = { type: 'video', cardId: 'ap-chagi', options: ['ap-chagi', 'yop-chagi', 'dollyo-chagi', 'düt-chagi'] }
    const platform = mockYouTube()
    show([video])
    platform.ready()
    expect(screen.getByText('Which technique is this? (silent clip)')).toBeInTheDocument()
    const host = document.querySelector('[data-video-source]:not([hidden])')
    expect(host?.querySelector('iframe')?.getAttribute('src')).toContain('mute=1')
    expect(platform.players).toHaveLength(1)
    expect(platform.players[0].mute).toHaveBeenCalled()
    expect(platform.players[0].playVideo).toHaveBeenCalled()
  })

  it('autoplays again for consecutive questions using the same clip', () => {
    useAppStore.setState({ quizAutoCheck: true })
    const video: Exercise = { type: 'video', cardId: 'ap-chagi', options: ['ap-chagi', 'yop-chagi'] }
    const platform = mockYouTube()
    show([video, video])
    platform.ready()
    const player = platform.players[0]
    player.playVideo.mockClear()
    fireEvent.click(screen.getByRole('button', { name: CARD_BY_ID['ap-chagi'].ko, pressed: false }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(platform.players).toHaveLength(1)
    expect(player.playVideo).toHaveBeenCalledTimes(1)
    expect(player.seekTo).toHaveBeenCalled()
    expect(player.mute).toHaveBeenCalled()
  })

  it('offers clips as the options, in one scrolling row by default and in rows when asked', () => {
    const pick: Exercise = { type: 'pickclip', cardId: 'ap-chagi', options: ['ap-chagi', 'yop-chagi', 'dollyo-chagi', 'düt-chagi'] }
    const { container, unmount } = show([pick])
    const tiles = container.querySelectorAll('[data-clip-option]')
    expect(tiles).toHaveLength(4)
    expect(container.querySelector('[data-clip-row]')?.className).toMatch(/overflow-x-auto/)
    unmount()
    useAppStore.setState({ clipLayout: 'grid' })
    const second = show([pick])
    expect(second.container.querySelector('[data-clip-row]')?.className).toMatch(/grid/)
  })

  it('plays the audio and asks for the meaning in the app language', () => {
    const lm: Exercise = { type: 'listenmeaning', cardId: 'macki', options: ['macki', 'chagi', 'sogi', 'gubi'] }
    show([lm])
    expect(screen.getByText('Listen and pick the meaning')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: CARD_BY_ID.macki.meaning.en })).toBeInTheDocument()
  })
})

describe('Korean-answer choices do not disclose translations', () => {
  const options = ['düt-chagi', 'ap-chagi', 'yop-chagi', 'dollyo-chagi']

  beforeEach(() => {
    useAppStore.setState({ quizAutoCheck: false, quizResultMode: 'button', quizAutoContinue: false })
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
  })
  afterEach(() => vi.restoreAllMocks())

  for (const lang of ['es', 'en', 'de'] as const) {
    for (const type of ['frames', 'video', 'recall', 'listen'] as const) {
      for (const hangulOnly of [false, true]) {
        it(`${lang} ${type} keeps choices Korean-only (hangulOnly=${hangulOnly}) and still scores the answer`, () => {
          useAppStore.setState({ lang, hangulOnly })
          const onFinish = vi.fn()
          render(<LessonPlayer exercises={[{ type, cardId: 'düt-chagi', options }]} beltColor="#fff" onFinish={onFinish} onExit={() => {}} />)

          if (lang === 'es' && type === 'frames') {
            expect(screen.getByRole('heading', { name: '¿Qué técnica muestran estos fotogramas?' })).toBeInTheDocument()
            expect(screen.queryByText('düt-chagi · Patada hacia atrás')).not.toBeInTheDocument()
          }
          const choices = screen.getAllByRole('button', { pressed: false })
          expect(choices).toHaveLength(options.length)
          for (const [index, id] of options.entries()) {
            const card = CARD_BY_ID[id]
            const label = hangulOnly ? card.hangul : type === 'recall' ? `${card.ko} · ${card.hangul}` : card.ko
            expect(choices[index]).toHaveTextContent(label)
            expect(choices[index].textContent).toBe(label)
            expect(choices[index]).toHaveAccessibleName(label)
            const row = choices[index].closest('li')!
            expect(within(row).getAllByRole('button')).toHaveLength(2)
            expect(within(row).getByRole('button', { name: new RegExp(`: ${card.hangul}$`) })).toHaveTextContent('🔊')
            for (const candidate of options) {
              const meaning = CARD_BY_ID[candidate].meaning[lang]
              expect(row).not.toHaveTextContent(meaning)
              for (const node of [row, ...row.querySelectorAll('*')]) {
                for (const attribute of ['title', 'aria-label', 'aria-description', 'alt']) {
                  expect(node.getAttribute(attribute) ?? '').not.toContain(meaning)
                }
              }
            }
          }
          expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
          fireEvent.click(choices[0])
          expect(choices[0]).toHaveAttribute('aria-pressed', 'true')
          // Manual checking, correct feedback and completion remain available.
          fireEvent.click(screen.getByRole('button', { name: { es: 'Comprobar', en: 'Check', de: 'Prüfen' }[lang] }))
          const dialog = screen.getByRole('dialog')
          fireEvent.click(within(dialog).getByRole('button', { name: { es: 'Continuar', en: 'Continue', de: 'Weiter' }[lang] }))
          expect(onFinish).toHaveBeenCalledWith({ correct: 1, total: 1, answers: [{ cardId: 'düt-chagi', correct: true }] })
        })
      }
    }
  }
})

describe('LessonPlayer countdown and review', () => {
  const two: Exercise = { type: 'meaning', cardId: 'chagi', options: ['macki', 'chagi', 'sogi', 'gubi'] }
  const answer = (id: string) => fireEvent.click(screen.getByRole('button', { name: CARD_BY_ID[id].meaning.en }))
  const show = (list: Exercise[]) => render(<LessonPlayer exercises={list} beltColor="#fff" onFinish={() => {}} onExit={() => {}} />)

  beforeEach(() => {
    useAppStore.setState({ lang: 'en', quizAutoCheck: true, quizResultMode: 'button', quizAutoContinue: false })
  })
  afterEach(() => vi.useRealTimers())

  it('counts down in the result window when it is timed', () => {
    vi.useFakeTimers()
    useAppStore.setState({ quizResultMode: '3s', quizAutoContinue: true })
    show([ex])
    answer('macki')
    expect(screen.getByText('Continuing in 3 s')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('Continuing in 2 s')).toBeInTheDocument()
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(screen.getByText('Continuing in 1 s')).toBeInTheDocument()
  })

  it('says it will only close when automatic continue is off', () => {
    vi.useFakeTimers()
    useAppStore.setState({ quizResultMode: '5s', quizAutoContinue: false })
    show([ex])
    answer('macki')
    expect(screen.getByText('Closing in 5 s')).toBeInTheDocument()
  })

  it('has no countdown when the result waits for Continue', () => {
    show([ex])
    answer('macki')
    expect(screen.queryByText(/in \d s/)).not.toBeInTheDocument()
  })

  it('shows the question again when an evaluated segment is pressed, and hints it on hover', () => {
    show([ex, two])
    answer('chagi') // wrong
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    const segment = document.querySelector('[data-state="bad"]') as HTMLElement
    expect(segment.getAttribute('title')).toBe('1. What does this mean?: macki · 막기')
    fireEvent.click(segment)
    const review = screen.getByRole('dialog', { name: 'Question review' })
    expect(within(review).getByText(/Your answer/)).toBeInTheDocument()
    expect(within(review).getByText(CARD_BY_ID.macki.meaning.en, { selector: 'b' })).toBeInTheDocument()
    expect(segment).toHaveAttribute('aria-current', 'true')
    fireEvent.click(within(review).getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog', { name: 'Question review' })).not.toBeInTheDocument()
  })

  it('does not make pending segments clickable', () => {
    show([ex, two])
    const pending = document.querySelector('[data-state="pending"]') as HTMLElement
    expect(pending.tagName).not.toBe('BUTTON')
  })

  it('opens the same review from an entry of the log', () => {
    show([ex])
    answer('chagi')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    // the wrong answer comes back; answer it right so the log has two entries
    answer('macki')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    const log = screen.queryByRole('region', { name: 'Quiz log' })
    if (log) {
      fireEvent.click(within(log).getAllByRole('button', { name: /Review/ })[0])
      expect(screen.getByRole('dialog', { name: 'Question review' })).toBeInTheDocument()
    }
  })
})
