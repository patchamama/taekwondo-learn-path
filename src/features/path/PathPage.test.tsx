import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { BELTS } from '../../data/belts'
import { lessonsOfUnit } from '../../data/lessons'
import { useAppStore } from '../../shared/store/useAppStore'
import { PathPage } from './PathPage'

const open = () =>
  render(
    <MemoryRouter>
      <PathPage />
    </MemoryRouter>,
  )

describe('PathPage', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'en', pathView: 'list' })
  })

  it('lists every belt as a numbered section with a progress bar', () => {
    open()
    expect(screen.getAllByRole('progressbar').length).toBeGreaterThanOrEqual(BELTS.length)
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0)
  })

  it('types the rows as lesson or quiz and links each belt to its reading view', () => {
    open()
    expect(screen.getAllByText('Lesson').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Quiz').length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: /Read everything/ })[0]).toHaveAttribute(
      'href',
      '/study/0',
    )
  })

  it('switches between the list and the path view', () => {
    open()
    expect(screen.queryByTestId('roadmap')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Path' }))
    expect(screen.getByTestId('roadmap')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Map' }))
    expect(screen.queryByTestId('roadmap')).toBeNull()
    expect(screen.getByRole('button', { name: /8 Kup/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'List' }))
    expect(screen.queryByTestId('roadmap')).toBeNull()
  })

  it('shows 100% for a belt once all its lessons are complete', () => {
    lessonsOfUnit('kup10').forEach((l) => useAppStore.getState().completeLesson(l.id, 3, 0))
    open()
    expect(
      screen.getAllByRole('progressbar').some((b) => b.getAttribute('aria-valuenow') === '100'),
    ).toBe(true)
  })
})
