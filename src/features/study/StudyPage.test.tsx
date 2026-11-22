import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { StudyPage } from './StudyPage'
import { AUDIO_ITEMS } from '../../data/audioManifest'
import { selectItems } from '../audio/audioPlan'
import { CONCEPTS } from '../../data/concepts'
import { STRINGS } from '../../shared/i18n/strings'
import { levelContent, levelContentUpTo } from '../../data/levelContent'
import { CLIPS_BY_CARD, videoIdFor } from '../../data/clips'
import { mockYouTube, teardownYouTube } from '../videos/playerTestUtils'
import { downloadMarkdown, downloadWord, printPdf } from '../export/download'
import { buildLevelDoc } from '../export/document'

vi.mock('../export/download', () => ({
  downloadMarkdown: vi.fn(), downloadWord: vi.fn(), printPdf: vi.fn(() => true),
}))

afterEach(teardownYouTube)

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

  it('includes the content of both 10 and 9 Kup when the existing range is set to 10–9', () => {
    useAppStore.setState({ maxBelt: 7, onlyBelt: 6 })
    const { container } = open('/study/1')
    const cards = () => [...container.querySelectorAll('article[id^="card-"]')].map((a) => a.id.slice(5)).sort()
    const single = [...levelContent(1).cardIds].sort()
    expect(single.length).toBeGreaterThan(0)
    expect(cards()).toEqual(single)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } })
    const first = levelContent(0).cardIds
    expect(first.length).toBeGreaterThan(0)
    expect(cards()).toEqual([...first, ...single].sort())
    expect(screen.getByRole('link', { name: '10 Kup' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: '9 Kup' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '8 Kup' })).not.toHaveAttribute('aria-current')
    expect(useAppStore.getState().maxBelt).toBe(7)
    expect(useAppStore.getState().onlyBelt).toBe(6)
  })

  it('falls back to the first level for a bad parameter', () => {
    open('/study/99')
    expect(screen.getByRole('heading', { level: 2, name: /10 Kup/ })).toBeInTheDocument()
  })
})

describe('StudyPage export', () => {
  it.each(['en', 'de', 'es'] as const)('uses one scoped icon row and exports the actual selected data in %s', (lang) => {
    vi.clearAllMocks()
    useAppStore.setState({ lang })
    open('/study/2')
    const scope = screen.getByRole('combobox', { name: STRINGS.exportLabel[lang] })
    expect(within(scope).getAllByRole('option').map((o) => o.textContent)).toEqual([
      STRINGS.exportThis[lang], STRINGS.exportAll[lang],
    ])
    const ctx = { lang, t: (key: keyof typeof STRINGS) => STRINGS[key][lang], loc: (text: { en: string; de: string; es: string }) => text[lang] }
    const current = buildLevelDoc(2, ctx)
    const all = buildLevelDoc(null, ctx)
    expect(all.blocks.length).toBeGreaterThan(current.blocks.length)
    const formats = [
      ['Markdown', downloadMarkdown], ['Word', downloadWord], ['PDF', printPdf],
    ] as const
    for (const [name, download] of formats) {
      const buttons = screen.getAllByRole('button', { name })
      expect(buttons).toHaveLength(1)
      expect(buttons[0]).toHaveAttribute('title', name)
      expect(buttons[0].querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
      fireEvent.click(buttons[0])
      expect(vi.mocked(download).mock.calls.at(-1)?.[0]).toEqual(current)
    }
    fireEvent.change(scope, { target: { value: 'all' } })
    for (const [name, download] of formats) {
      fireEvent.click(screen.getByRole('button', { name }))
      expect(vi.mocked(download).mock.calls.at(-1)?.[0]).toEqual(all)
    }
    fireEvent.change(scope, { target: { value: 'level' } })
    fireEvent.click(screen.getByRole('link', { name: '9 Kup' }))
    fireEvent.click(screen.getByRole('button', { name: 'Markdown' }))
    expect(vi.mocked(downloadMarkdown).mock.calls.at(-1)?.[0]).toEqual(buildLevelDoc(1, ctx))
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
    const platform = mockYouTube()
    useAppStore.setState({ videoLang: 'auto' })
    open('/study/1')
    const heading = screen.getByRole('heading', { name: /ap-chagi/ })
    const article = heading.closest('article') as HTMLElement
    expect(article.querySelectorAll('ol[aria-label]')).toHaveLength(1)
    fireEvent.click(within(article).getByRole('button', { name: /Watch/ }))
    platform.ready()
    const clip = CLIPS_BY_CARD['ap-chagi'][0]
    const host = document.querySelector(`[data-video-source="${videoIdFor(clip, 'es')}"]`)!
    expect(host).not.toHaveAttribute('hidden')
    expect(new URL(host.querySelector('iframe')!.src).pathname).toBe(`/embed/${videoIdFor(clip, 'es')}`)
    expect(platform.players[0].seekTo).toHaveBeenLastCalledWith(clip.start, true)
    expect(platform.players[0].playVideo).not.toHaveBeenCalled()
    expect(article.querySelectorAll('ol[aria-label]')).toHaveLength(1)
  })
})

describe('StudyPage general-knowledge notice', () => {
  it('no longer shows the "confirm with your club" notice', () => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'es' })
    open('/study/2')
    expect(screen.queryByText(/confirma con tu club/)).not.toBeInTheDocument()
  })
})

describe('StudyPage vocabulary audio card', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'en' })
  })

  const count = () => Number(screen.getByLabelText('audio-count').textContent!.split(' ')[0])

  it('shows the audio card inside Study', () => {
    open('/study/0')
    expect(screen.getByRole('heading', { name: /Vocabulary audio/ })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Set up audio' }))
    expect(screen.getByRole('button', { name: 'Create audio' })).toBeInTheDocument()
  })

  it('follows the belt chosen in Study', () => {
    open('/study/1')
    fireEvent.click(screen.getByRole('button', { name: 'Set up audio' }))
    const base = { lang: 'en', maxBelt: 1, vocabulary: true, techniques: true, descriptions: false, japanese: false } as const
    expect(count()).toBe(selectItems(AUDIO_ITEMS, { ...base, onlyBelt: 1 }).length)
  })
})

describe('StudyPage repetition focus', () => {
  class FakeAudio {
    onended: (() => void) | null = null
    onerror: (() => void) | null = null
    constructor(public src: string) {}
    play() {
      return new Promise<void>(() => {}) // never ends: the exercise stays running
    }
    pause() {}
  }
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'en' })
    vi.stubGlobal('Audio', FakeAudio)
  })
  afterEach(() => vi.unstubAllGlobals())

  it('blurs everything except the audio card while the repetition plays, then restores it', async () => {
    const { container } = open('/study/0')
    const root = container.querySelector('[data-study-root]') as HTMLElement
    expect(root.className).not.toMatch(/blur/)
    fireEvent.click(screen.getByRole('button', { name: 'Set up audio' }))
    fireEvent.click(screen.getByRole('button', { name: /Play/ }))
    expect(root.className).toMatch(/blur/)
    expect(root.querySelector('[data-audio-card]')).not.toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Stop/ }))
    await waitFor(() => expect(root.className).not.toMatch(/blur/))
  })
})
