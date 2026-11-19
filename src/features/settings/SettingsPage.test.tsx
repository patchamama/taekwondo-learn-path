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

beforeEach(() => {
  useAppStore.getState().reset()
  useAppStore.setState({ lang: 'en', strictOrder: false, listening: true, beltScheme: 'club', videoLang: 'auto' })
})

describe('lesson order setting', () => {
  it('is off by default so any lesson can be opened', () => {
    expect(useAppStore.getState().strictOrder).toBe(false)
    openLesson()
    expect(screen.getByRole('button', { name: 'Start' })).toBeInTheDocument()
  })

  it('locks a later lesson when the checkbox is ticked', () => {
    render(<SettingsPage />)
    fireEvent.click(screen.getByRole('checkbox', { name: /Lock lessons/ }))
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

it('appends a real site QR after every existing settings control', () => {
  const { container } = render(<SettingsPage />)
  const qr = screen.getByRole('region', { name: 'Open this site on another device' })
  expect(container.querySelector('section')?.lastElementChild).toBe(qr)
  expect(screen.getByRole('img', { name: 'QR code for this site' }).tagName.toLowerCase()).toBe('svg')
})

it('preserves strict lesson locks, listening, belt scheme and video language controls', () => {
  render(<SettingsPage />)
  const [strict, listening] = screen.getAllByRole('checkbox')
  fireEvent.click(strict)
  expect(useAppStore.getState().strictOrder).toBe(true)
  fireEvent.click(strict)
  expect(useAppStore.getState().strictOrder).toBe(false)
  fireEvent.click(listening)
  expect(useAppStore.getState().listening).toBe(false)
  const radios = screen.getAllByRole('radio')
  fireEvent.click(radios[1])
  expect(useAppStore.getState().beltScheme).toBe('traditional')
  fireEvent.click(radios[4])
  expect(useAppStore.getState().videoLang).toBe('de')
})
