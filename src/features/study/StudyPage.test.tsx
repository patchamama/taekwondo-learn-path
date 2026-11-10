import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { StudyPage } from './StudyPage'

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
