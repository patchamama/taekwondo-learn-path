import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { CONCEPTS } from '../../data/concepts'
import { LESSON_BY_ID } from '../../data/lessons'
import { STRINGS } from '../../shared/i18n/strings'
import { useAppStore } from '../../shared/store/useAppStore'
import { LessonPage } from './LessonPage'

beforeEach(() => {
  useAppStore.getState().reset()
  useAppStore.setState({ lang: 'en', strictOrder: false })
})

function open(id: string) {
  return render(<MemoryRouter initialEntries={[`/lesson/${id}`]}>
    <Routes><Route path="/lesson/:id" element={<LessonPage />} /></Routes>
  </MemoryRouter>)
}

describe('Lesson reading integration', () => {
  it.each(['en', 'de', 'es'] as const)('offers relevant readings before starting in %s without awarding progress', (lang) => {
    useAppStore.setState({ lang })
    const before = useAppStore.getState()
    open('u1-actions')
    for (const id of ['technique-purpose', 'blocks']) {
      expect(screen.getByRole('link', { name: CONCEPTS.find((c) => c.id === id)!.title[lang] }))
        .toHaveAttribute('href', `/concepts#${id}`)
    }
    expect(screen.getByRole('heading', { name: LESSON_BY_ID['u1-actions'].title[lang] })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: STRINGS.start[lang] }))
    expect(screen.queryByRole('heading', { name: LESSON_BY_ID['u1-actions'].title[lang] })).not.toBeInTheDocument()
    expect(useAppStore.getState().completed).toEqual(before.completed)
    expect(useAppStore.getState().xp).toBe(before.xp)
  })

  it.each([
    ['u2-stances', 'movement'],
    ['b-taeguk-a', 'patterns'],
    ['u1-theory', 'principles'],
  ])('connects %s to %s without replacing the intro', (lesson, topic) => {
    open(lesson)
    expect(screen.getByRole('link', { name: CONCEPTS.find((c) => c.id === topic)!.title.en }))
      .toHaveAttribute('href', `/concepts#${topic}`)
    expect(screen.getByText(LESSON_BY_ID[lesson].tip.en)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: STRINGS.readingPreparation.en }))
      .toHaveAttribute('href', '/concepts#meditation')
  })

  it('keeps locked lessons locked', () => {
    useAppStore.setState({ strictOrder: true })
    open('u1-actions')
    expect(screen.getByText(STRINGS.locked.en)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: CONCEPTS[1].title.en })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: STRINGS.backToPath.en })).toHaveAttribute('href', '/')
  })
})
