import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CARD_BY_ID } from '../../data/cards'
import { LessonPlayer } from './LessonPlayer'
import type { Exercise } from './exercises'

const ex: Exercise = {
  type: 'meaning',
  cardId: 'macki',
  options: ['macki', 'chagi', 'sogi', 'gubi'],
}

describe('LessonPlayer', () => {
  it('gives feedback, requeues a wrong answer once and finishes', () => {
    const onFinish = vi.fn()
    render(<LessonPlayer exercises={[ex]} beltColor="#fff" onFinish={onFinish} onExit={() => {}} />)

    // wrong answer
    fireEvent.click(screen.getByRole('button', { name: CARD_BY_ID.chagi.meaning.en }))
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByText(/Correct answer/)).toBeInTheDocument()
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
