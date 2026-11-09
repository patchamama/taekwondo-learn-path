import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { LessonPage } from '../learn/LessonPage'
import { useAppStore } from '../../shared/store/useAppStore'
import { SettingsPage } from './SettingsPage'

const lastLesson = 'u3-check'

function openLesson() {
  render(
    <MemoryRouter initialEntries={[`/lesson/${lastLesson}`]}>
      <Routes>
        <Route path="/lesson/:id" element={<LessonPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('lesson order setting', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ strictOrder: false, lang: 'en' })
  })

  it('is off by default so any lesson can be opened', () => {
    expect(useAppStore.getState().strictOrder).toBe(false)
    openLesson()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('locks a later lesson when the checkbox is ticked', () => {
    render(<SettingsPage />)
    fireEvent.click(screen.getByRole('checkbox'))
    expect(useAppStore.getState().strictOrder).toBe(true)
    openLesson()
    expect(screen.getByText('Locked')).toBeInTheDocument()
  })

  it('stores the preferred video language', () => {
    render(<SettingsPage />)
    fireEvent.click(screen.getByLabelText('German'))
    expect(useAppStore.getState().videoLang).toBe('de')
  })
})
