import { fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StudyPage } from '../../features/study/StudyPage'
import { PracticePage } from '../../features/learn/LessonPage'
import { SettingsPage } from '../../features/settings/SettingsPage'
import { useAppStore } from '../store/useAppStore'
import { Layout } from './Layout'

function open(path: string) {
  return render(<MemoryRouter initialEntries={[path]}><Routes>
    <Route element={<Layout />}>
      <Route path="study/:level?" element={<StudyPage />} />
      <Route path="practice" element={<PracticePage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="techniques" element={<p>Techniques content</p>} />
      <Route index element={<p>Path content</p>} />
      <Route path="*" element={<p>Existing filtered page</p>} />
    </Route>
  </Routes></MemoryRouter>)
}

beforeEach(() => {
  useAppStore.getState().reset()
  useAppStore.setState({ lang: 'en', maxBelt: 2, onlyBelt: null, listening: false })
})

describe('Persistent layout navigation', () => {
  it('keeps Study selected through actual Kup links without replacing the shell or duplicating its local slider', () => {
    open('/study')
    const main = screen.getByRole('main')
    const banner = screen.getByTestId('version-banner')
    const study = screen.getByRole('link', { name: 'Study' })
    expect(study).toHaveAttribute('aria-current', 'page')
    fireEvent.click(screen.getByRole('link', { name: '8 Kup' }))
    expect(study).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Path' })).not.toHaveAttribute('aria-current')
    expect(screen.getByRole('main')).toBe(main)
    expect(screen.getByTestId('version-banner')).toBe(banner)
    expect(screen.getAllByRole('slider')).toHaveLength(1)
  })

  it('selects a directly opened Study child URL and not the root', () => {
    open('/study/2')
    expect(screen.getByRole('link', { name: 'Study' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Path' })).not.toHaveAttribute('aria-current')
  })

  it('retains Practice navigation and in-progress answers during ordinary UI changes; only filters restart the session', () => {
    const clock = vi.spyOn(Date, 'now').mockReturnValue(123456)
    try {
      open('/practice')
      const main = screen.getByRole('main')
      const practice = screen.getByRole('link', { name: 'Practice' })
      expect(practice).toHaveAttribute('aria-current', 'page')
      const option = within(main).getAllByRole('button', { pressed: false })[0]
      fireEvent.click(option)
      fireEvent.click(screen.getByRole('button', { name: 'Check' }))
      const next = screen.getByRole('button', { name: 'Continue' })
      fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), { target: { value: 'es' } })
      expect(screen.getByRole('main')).toBe(main)
      expect(screen.getByRole('button', { name: 'Continuar' })).toBe(next)
      expect(practice).toHaveAttribute('aria-current', 'page')
      expect(screen.getAllByRole('slider')).toHaveLength(1)
      fireEvent.click(screen.getByRole('button', { name: '8 Kup' }))
      expect(screen.getByRole('main')).toBe(main)
      expect(practice).toHaveAttribute('aria-current', 'page')
      expect(screen.queryByRole('button', { name: 'Continuar' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Comprobar' })).toBeInTheDocument()
      fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } })
      expect(useAppStore.getState().onlyBelt).toBeNull()
      expect(useAppStore.getState().maxBelt).toBe(1)
      expect(practice).toHaveAttribute('aria-current', 'page')
      expect(screen.getByRole('main')).toBe(main)
    } finally {
      clock.mockRestore()
    }
  })

  it('moves Settings outside primary navigation into an accessible gear while preserving language and progress', () => {
    open('/techniques')
    const gear = screen.getByRole('link', { name: 'Settings' })
    expect(within(screen.getByRole('navigation')).queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
    expect(gear).toHaveAttribute('href', '/settings')
    expect(gear).toHaveClass('focus-visible:outline-2')
    expect(screen.getByLabelText('progress')).toBeInTheDocument()
    fireEvent.click(gear)
    expect(screen.getByRole('heading', { name: 'Settings', level: 1 })).toBeInTheDocument()
    expect(gear).toHaveAttribute('aria-current', 'page')
    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), { target: { value: 'es' } })
    expect(screen.getByRole('link', { name: 'Ajustes' })).toBe(gear)
    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), { target: { value: 'de' } })
    expect(screen.getByRole('link', { name: 'Einstellungen' })).toBe(gear)
  })

  it.each(['/techniques', '/videos', '/video-quiz', '/terms', '/forms', '/kukkiwon'])('preserves the existing global filter on %s', (path) => {
    open(path)
    const main = screen.getByRole('main')
    const active = screen.getAllByRole('link').find((link) => link.getAttribute('aria-current') === 'page')
    expect(screen.getAllByRole('slider')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: '8 Kup' }))
    expect(screen.getByRole('main')).toBe(main)
    if (active) expect(active).toHaveAttribute('aria-current', 'page')
    expect(useAppStore.getState().onlyBelt).toBe(2)
  })

  it('marks only Path active at the root', () => {
    open('/')
    expect(screen.getByRole('link', { name: 'Path' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Study' })).not.toHaveAttribute('aria-current')
  })
})
