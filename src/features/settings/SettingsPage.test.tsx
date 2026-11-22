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
    render(<MemoryRouter><SettingsPage /></MemoryRouter>)
    fireEvent.click(screen.getByRole('checkbox', { name: /Lock lessons/ }))
    expect(useAppStore.getState().strictOrder).toBe(true)
    openLesson()
    expect(screen.getByText('Locked')).toBeInTheDocument()
  })

  it('stores the preferred video language', () => {
    render(<MemoryRouter><SettingsPage /></MemoryRouter>)
    fireEvent.click(screen.getByLabelText('German'))
    expect(useAppStore.getState().videoLang).toBe('de')
  })
})

it('appends a real site QR after every existing settings control', () => {
  const { container } = render(<MemoryRouter><SettingsPage /></MemoryRouter>)
  const qr = screen.getByRole('region', { name: 'Open this site on another device' })
  expect(container.querySelector('section')?.lastElementChild).toBe(qr)
  expect(screen.getByRole('img', { name: 'QR code for this site' }).tagName.toLowerCase()).toBe('svg')
})

it('preserves strict lesson locks, listening, belt scheme and video language controls', () => {
  render(<MemoryRouter><SettingsPage /></MemoryRouter>)
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

describe('SettingsPage audio', () => {
  it('no longer links to the vocabulary audio', () => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'en' })
    render(<MemoryRouter><SettingsPage /></MemoryRouter>)
    expect(screen.queryByRole('link', { name: /Vocabulary audio/ })).not.toBeInTheDocument()
  })
})

describe('SettingsPage quiz options', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'en', quizAutoCheck: true, quizResultMode: 'button', quizAutoContinue: false, quizMaxQuestions: 14 })
  })
  const show = () => render(<MemoryRouter><SettingsPage /></MemoryRouter>)

  it('switches between checking on choice and the Check button', () => {
    show()
    const box = screen.getByRole('checkbox', { name: /Check the answer as soon as I choose it/ })
    expect(box).toBeChecked()
    fireEvent.click(box)
    expect(useAppStore.getState().quizAutoCheck).toBe(false)
  })

  it('chooses how long the result stays and whether to continue automatically', () => {
    show()
    fireEvent.change(screen.getByRole('combobox', { name: 'Result window' }), { target: { value: '5s' } })
    expect(useAppStore.getState().quizResultMode).toBe('5s')
    fireEvent.click(screen.getByRole('checkbox', { name: /continue automatically/ }))
    expect(useAppStore.getState().quizAutoContinue).toBe(true)
  })

  it('sets the maximum number of questions per quiz section', () => {
    show()
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Maximum questions per quiz section' }), { target: { value: '20' } })
    expect(useAppStore.getState().quizMaxQuestions).toBe(20)
  })
})
