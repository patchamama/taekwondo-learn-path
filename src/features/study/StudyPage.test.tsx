import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { StudyPage } from './StudyPage'
import { CONCEPTS } from '../../data/concepts'
import { STRINGS } from '../../shared/i18n/strings'
import { levelContent, levelContentUpTo } from '../../data/levelContent'

const open = (path: string) =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/study/:level?" element={<StudyPage />} />
      </Routes>
    </MemoryRouter>,
  )

describe('StudyPage', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'en' })
  })

  it('shows every belt as a link and the 9 Kup content in reading form', () => {
    open('/study/1')
    expect(screen.getByRole('link', { name: '10 Kup' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '1 Dan' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /olgul-macki/ })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Theory' })).toBeInTheDocument()
  })

  it.each(['en', 'de', 'es'] as const)('connects belt study to concepts and exercises in %s', (lang) => {
    useAppStore.setState({ lang })
    const before = useAppStore.getState()
    open('/study/1')
    for (const concept of CONCEPTS) {
      expect(screen.getByRole('link', { name: concept.title[lang] }))
        .toHaveAttribute('href', `/concepts#${concept.id}`)
    }
    expect(screen.getByRole('link', { name: new RegExp(STRINGS.studyPractice[lang]) }))
      .toHaveAttribute('href', expect.stringContaining('/lesson/'))
    fireEvent.click(screen.getByRole('checkbox', { name: STRINGS.studyCumulative[lang] }))
    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(screen.getByRole('link', { name: '10 Kup' })).toHaveAttribute('href', '/study/0')
    expect(useAppStore.getState().completed).toEqual(before.completed)
    expect(useAppStore.getState().xp).toBe(before.xp)
  })

  it.each(['en', 'de', 'es'] as const)('keeps the local bar, range marks, URL links and reading content consistent in %s', (lang) => {
    useAppStore.setState({ lang, maxBelt: 7, onlyBelt: 6 })
    const { container } = open('/study/2')
    const cards = () => [...container.querySelectorAll('article[id^="card-"]')].map((a) => a.id.slice(5)).sort()
    expect(screen.getByRole('slider', { name: STRINGS.levelFilter[lang] })).toHaveValue('0')
    expect(cards()).toEqual([...levelContent(2).cardIds].sort())
    fireEvent.click(screen.getByRole('checkbox', { name: STRINGS.studyCumulative[lang] }))
    expect(screen.getByRole('slider')).toHaveValue('2')
    expect(screen.getByRole('link', { name: '10 Kup' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: '9 Kup' })).toHaveAttribute('aria-current', 'true')
    expect(cards()).toEqual([...levelContentUpTo(2).cardIds].sort())
    fireEvent.change(screen.getByRole('slider'), { target: { value: '3' } })
    expect(screen.getByRole('checkbox')).toBeChecked()
    expect(screen.getByRole('link', { name: '7 Kup' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '6 Kup' })).not.toHaveAttribute('aria-current')
    expect(cards()).toEqual([...levelContentUpTo(3).cardIds].sort())
    const link = screen.getByRole('link', { name: '9 Kup' })
    expect(link).toHaveAttribute('href', '/study/1')
    fireEvent.click(link, { ctrlKey: true })
    expect(screen.getByRole('checkbox')).toBeChecked()
    fireEvent.click(link)
    expect(screen.getByRole('checkbox')).not.toBeChecked()
    expect(screen.getByRole('slider')).toHaveValue('0')
    expect(screen.getByRole('link', { name: '9 Kup' })).toHaveAttribute('aria-current', 'page')
    expect(cards()).toEqual([...levelContent(1).cardIds].sort())
    expect(useAppStore.getState().maxBelt).toBe(7)
    expect(useAppStore.getState().onlyBelt).toBe(6)
  })

  it('falls back to the first level for a bad parameter', () => {
    open('/study/99')
    expect(screen.getByRole('heading', { level: 2, name: /10 Kup/ })).toBeInTheDocument()
  })
})

describe('StudyPage export', () => {
  it('offers Markdown, Word and PDF for this level and for all levels', () => {
    open('/study/2')
    expect(screen.getAllByRole('button', { name: 'Markdown' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Word' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'PDF' })).toHaveLength(2)
  })
})

describe('StudyPage diagrams', () => {
  it('shows the Taegeuk floor pattern with its licence', () => {
    open('/study/3')
    expect(screen.getAllByText(/CC BY-SA 4.0/).length).toBeGreaterThan(0)
  })
})

describe('StudyPage clip frames', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'en' })
  })

  it('does not repeat the frame sequence when a technique is watched', () => {
    open('/study/1')
    const heading = screen.getByRole('heading', { name: /ap-chagi/ })
    const article = heading.closest('article') as HTMLElement
    expect(article.querySelectorAll('ol[aria-label]')).toHaveLength(1)
    fireEvent.click(article.querySelector('button[aria-expanded]') as HTMLElement)
    expect(article.querySelector('iframe')).not.toBeNull()
    expect(article.querySelectorAll('ol[aria-label]')).toHaveLength(1)
  })
})
