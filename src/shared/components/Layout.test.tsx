import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StudyPage } from '../../features/study/StudyPage'
import { PracticePage } from '../../features/learn/LessonPage'
import { SettingsPage } from '../../features/settings/SettingsPage'
import { useAppStore } from '../store/useAppStore'
import { Layout } from './Layout'

function openLayout() {
  return render(<MemoryRouter><Routes><Route element={<Layout />}>
    <Route index element={<p>Home content</p>} />
    <Route path="settings" element={<p>Settings content</p>} />
    <Route path="study/:level" element={<p>Study content</p>} />
    <Route path="history" element={<p>History content</p>} />
  </Route></Routes></MemoryRouter>)
}

beforeEach(() => {
  useAppStore.getState().reset()
  useAppStore.setState({ lang: 'en', maxBelt: 2, onlyBelt: null, listening: false, quizAutoCheck: false })
})

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

  it('places progress and the language selector in the top row, before the Settings gear', () => {
    open('/')
    const progress = screen.getByLabelText('progress')
    const language = screen.getByRole('combobox', { name: 'Language' })
    const gear = screen.getByRole('link', { name: 'Settings' })
    const nav = screen.getByRole('navigation')
    const before = (a: Node, b: Node) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)
    expect(progress).toHaveTextContent(/🔥 \d+ .*⭐ \d+/)
    expect(before(progress, language)).toBe(true)
    expect(before(language, gear)).toBe(true)
    expect(before(gear, nav)).toBe(true)
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

describe('global search', () => {
  it('places the search action before settings and preserves navigation and settings', async () => {
    const user = userEvent.setup()
    openLayout()
    const search = screen.getByRole('button', { name: 'Search the site' })
    const settings = screen.getByRole('link', { name: 'Settings' })
    expect(search.compareDocumentPosition(settings) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(settings).toHaveAttribute('href', '/settings')
    expect(screen.getByRole('link', { name: 'History' })).toHaveAttribute('href', '/history')
    await user.click(settings)
    expect(screen.getByText('Settings content')).toBeInTheDocument()
    await user.click(screen.getByRole('link', { name: 'History' }))
    expect(screen.getByText('History content')).toBeInTheDocument()
  })

  it('opens by keyboard, contains focus, closes on Escape, and restores the trigger', async () => {
    const user = userEvent.setup()
    openLayout()
    const trigger = screen.getByRole('button', { name: 'Search the site' })
    trigger.focus()
    await user.keyboard('{Enter}')
    const dialog = screen.getByRole('dialog', { name: 'Search the site' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    const input = within(dialog).getByRole('textbox', { name: 'Search query' })
    expect(input).toHaveFocus()
    expect(within(dialog).getByText(/Enter a term/)).toBeInTheDocument()
    await user.tab({ shift: true })
    expect(within(dialog).getByRole('button', { name: 'Close search' })).toHaveFocus()
    await user.tab()
    expect(input).toHaveFocus()
    screen.getByRole('link', { name: 'Settings' }).focus()
    expect(dialog.contains(document.activeElement)).toBe(true)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('searches the real corpus locally, groups results, and navigates to existing study routes', async () => {
    const user = userEvent.setup()
    openLayout()
    await user.click(screen.getByRole('button', { name: 'Search the site' }))
    const dialog = screen.getByRole('dialog')
    const input = within(dialog).getByRole('textbox', { name: 'Search query' })
    fireEvent.change(input, { target: { value: 'taekwondo' } })
    expect(within(dialog).getByRole('heading', { name: 'History' })).toBeInTheDocument()
    expect(within(dialog).getByRole('heading', { name: 'Background' })).toBeInTheDocument()
    fireEvent.change(input, { target: { value: 'front kick' } })
    expect(within(dialog).getByRole('heading', { name: 'Vocabulary and techniques' })).toBeInTheDocument()
    const link = within(dialog).getAllByRole('link').find((node) => /ap-chagi/.test(node.textContent ?? ''))!
    expect(link).toHaveAttribute('href', expect.stringMatching(/^\/study\/\d+$/))
    await user.click(link)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByText('Study content')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Search the site' })).toHaveFocus()
  })

  it('retains unmatched queries, offers clear, and closes with its button', async () => {
    const user = userEvent.setup()
    openLayout()
    const trigger = screen.getByRole('button', { name: 'Search the site' })
    await user.click(trigger)
    const input = screen.getByRole('textbox', { name: 'Search query' })
    fireEvent.change(input, { target: { value: 'zzqxqxzz' } })
    expect(screen.getByRole('status')).toHaveTextContent('No results. Try another term or clear your search.')
    expect(input).toHaveValue('zzqxqxzz')
    await user.click(screen.getByRole('button', { name: 'Clear search' }))
    expect(input).toHaveValue('')
    expect(input).toHaveFocus()
    await user.click(screen.getByRole('button', { name: 'Close search' }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it.each([
    ['de', 'Website durchsuchen', 'Suchbegriff', 'Gib einen Begriff', 'Wortschatz und Techniken', 'Vorwärtsfußstoß'],
    ['es', 'Buscar en el sitio', 'Término de búsqueda', 'Escribe un término', 'Vocabulario y técnicas', 'patada frontal'],
  ] as const)('localizes search in %s and accepts translated terms', async (lang, title, label, empty, group, query) => {
    useAppStore.setState({ lang })
    const user = userEvent.setup()
    openLayout()
    await user.click(screen.getByRole('button', { name: title }))
    const dialog = screen.getByRole('dialog', { name: title })
    expect(within(dialog).getByText(new RegExp(empty))).toBeInTheDocument()
    fireEvent.change(within(dialog).getByRole('textbox', { name: label }), { target: { value: query } })
    expect(within(dialog).getByRole('heading', { name: group })).toBeInTheDocument()
    expect(within(dialog).getAllByRole('link').some((link) => /ap-chagi/.test(link.textContent ?? ''))).toBe(true)
  })
})
