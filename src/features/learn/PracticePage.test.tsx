import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LESSONS } from '../../data/lessons'
import { cardBeltIndex } from '../../data/levels'
import { useAppStore } from '../../shared/store/useAppStore'
import { BeltRangeSlider } from '../../shared/components/BeltRangeSlider'
import * as exercises from './exercises'
import { learnedCardIds } from './progress'
import { PracticePage } from './LessonPage'

const build = vi.spyOn(exercises, 'buildPractice')
const curriculum = [...new Set(LESSONS.flatMap((lesson) => lesson.cardIds))]
const open = () => render(<MemoryRouter><BeltRangeSlider /><PracticePage /></MemoryRouter>)

beforeEach(() => {
  build.mockClear()
  useAppStore.getState().reset()
  useAppStore.setState({ lang: 'en', maxBelt: 2, onlyBelt: null, listening: false, strictOrder: true })
})

describe('Public free practice', () => {
  it('starts real questions without completed lessons while keeping progress helpers unchanged', () => {
    open()
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument()
    expect(build).toHaveBeenCalled()
    expect(build.mock.calls[0][0]).toEqual(curriculum.filter((id) => cardBeltIndex(id) <= 2))
    expect(build.mock.results[0].value.length).toBeGreaterThan(0)
    expect(learnedCardIds({})).toEqual([])
    expect(useAppStore.getState().completed).toEqual({})
  })

  it('updates the practice questions for single Kup and cumulative ranges, without navigation', () => {
    open()
    fireEvent.click(screen.getByRole('button', { name: '8 Kup' }))
    expect(screen.getByRole('slider')).toHaveValue('0')
    expect(build.mock.lastCall![0]).toEqual(curriculum.filter((id) => cardBeltIndex(id) === 2))
    expect(build.mock.results.at(-1)!.value.every((ex: exercises.Exercise) => 'cardId' in ex && cardBeltIndex(ex.cardId) === 2)).toBe(true)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } })
    expect(build.mock.lastCall![0]).toEqual(curriculum.filter((id) => cardBeltIndex(id) <= 1))
    expect(build.mock.results.at(-1)!.value.every((ex: exercises.Exercise) => 'cardId' in ex && cardBeltIndex(ex.cardId) <= 1)).toBe(true)
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument()
    expect(useAppStore.getState().completed).toEqual({})
  })

  it('keeps the current session when mastery, completion or unrelated settings change', () => {
    useAppStore.setState({ mastery: { arae: 5 } })
    open()
    expect(build.mock.calls[0][1]).toEqual({ arae: 5 })
    const calls = build.mock.calls.length
    const question = screen.getByRole('button', { name: 'Check' })
    act(() => {
      useAppStore.getState().recordAnswer('arae', true)
      useAppStore.setState({ completed: { 'u1-actions': 3 }, strictOrder: false })
    })
    expect(build).toHaveBeenCalledTimes(calls)
    expect(screen.getByRole('button', { name: 'Check' })).toBe(question)
  })
})
