import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { CARD_BY_ID } from '../../data/cards'
import { LessonPlayer } from './LessonPlayer'
import type { Exercise } from './exercises'

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
