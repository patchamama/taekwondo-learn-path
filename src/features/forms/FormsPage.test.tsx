import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { FormsPage } from './FormsPage'

vi.mock('../editor/EditButton', () => ({ EditButton: ({ cardId }: { cardId: string }) => <button>Edit {cardId}</button> }))
vi.mock('../../shared/hooks/useBeltFilter', () => ({ useBeltFilter: () => ({ visibleIndex: () => true }) }))
vi.mock('../../data/forms', () => ({
  FORMS: [{ id: 'multi', ko: 'Multi form', hangul: '폼', kukkiwon: 'Multi', moves: 20, symbol: { en: 'Sky' }, meaning: { en: 'Sky meaning' } }],
  YUDANJA: [{ id: 'single', ko: 'Single form', hangul: '폼', moves: 20, symbol: { en: 'Earth' }, meaning: { en: 'Earth meaning' } }],
  HYONG: [{ id: 'empty', ko: 'Empty form', hangul: '폼', moves: 20, symbol: { en: 'Water' }, meaning: { en: 'Water meaning' } }],
  formBeltIndex: () => 0,
}))
vi.mock('../../data/clips', () => ({
  CLIPS_BY_CARD: { multi: [{ cardId: 'multi', videoId: 'one', source: 'course', start: 1, end: 3 }, { cardId: 'multi', videoId: 'two', source: 'external', label: 'Second video', start: 2, end: 4 }] },
  clipKey: (c: { videoId: string }) => c.videoId,
}))
vi.mock('../../data/cardImages', () => ({ imagesFor: (id: string) => id === 'multi' ? [{ src: '/custom.jpg', kind: 'custom', source: 'Image owner' }] : [] }))
vi.mock('../../shared/components/FormDiagram', () => ({
  hasDiagram: (id: string) => id !== 'empty',
  FormDiagram: () => <figure>Diagram with attribution</figure>,
}))
vi.mock('../videos/ClipPlayer', () => ({ ClipPlayer: ({ clip, autoplay }: { clip: { videoId: string }; autoplay: boolean }) => <div data-testid="player" data-autoplay={String(autoplay)}>{clip.videoId}</div> }))
vi.mock('../videos/FrameStrip', () => ({ FrameStrip: () => <div>Frames</div> }))
vi.mock('../videos/ClipViewer', () => ({ useSourceLabel: () => (c: { label?: string }) => c.label ?? 'Course video' }))
vi.mock('../../shared/components/SpeakButton', () => ({ SpeakButton: () => <button>Speak</button> }))

beforeEach(() => useAppStore.setState({ lang: 'en', cardView: 'details' }))
const card = (name: string) => screen.getByText(name).closest('li')!

describe('forms media S12', () => {
  it('uses tabs within multi-media cards, showing just the selected material', () => {
    render(<FormsPage />)
    const multi = within(card('Multi form'))
    expect(multi.getByRole('tablist')).toBeInTheDocument()
    expect(multi.getAllByRole('tab')).toHaveLength(4)
    expect(multi.getByText('Diagram with attribution')).toBeInTheDocument()
    expect(multi.queryByTestId('player')).not.toBeInTheDocument()
    fireEvent.click(multi.getByRole('tab', { name: 'Second video' }))
    expect(multi.getByRole('tab', { name: 'Second video' })).toHaveAttribute('aria-selected', 'true')
    expect(multi.getByRole('tabpanel')).toHaveTextContent('two')
    expect(multi.queryByText('Diagram with attribution')).not.toBeInTheDocument()
    const tabs = multi.getAllByRole('tab')
    fireEvent.keyDown(tabs[3], { key: 'Home' })
    expect(tabs[0]).toHaveFocus()
    expect(multi.getByText('Diagram with attribution')).toBeInTheDocument()
  })

  it('maximizes all media together without autoplay and closes with Escape', () => {
    render(<FormsPage />)
    const trigger = within(card('Multi form')).getByRole('button', { name: /Maximize/ })
    trigger.focus()
    fireEvent.click(trigger)
    const dialog = within(screen.getByRole('dialog'))
    expect(dialog.getByText('Diagram with attribution')).toBeInTheDocument()
    expect(dialog.getByRole('img')).toHaveAttribute('src', '/custom.jpg')
    expect(dialog.getByText('Image owner')).toBeInTheDocument()
    expect(dialog.getAllByTestId('player')).toHaveLength(2)
    dialog.getAllByTestId('player').forEach(p => expect(p).toHaveAttribute('data-autoplay', 'false'))
    expect(dialog.queryByRole('tablist')).not.toBeInTheDocument()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(within(card('Multi form')).getByRole('button', { name: /Maximize/ })).toHaveFocus()
  })

  it('single media has no tabs, retains the diagram and no-media cards stay empty', () => {
    render(<FormsPage />)
    const single = within(card('Single form'))
    expect(single.queryByRole('tablist')).not.toBeInTheDocument()
    expect(single.getByText('Diagram with attribution')).toBeInTheDocument()
    expect(single.getByRole('button', { name: /Maximize/ })).toBeInTheDocument()
    expect(within(card('Empty form')).queryByRole('button', { name: /Maximize/ })).not.toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: 'Speak' })).toHaveLength(5)
  })
})

it('compact forms hide all inline media until a header video action expands and plays it', () => {
  useAppStore.setState({ cardView: 'compact' })
  render(<FormsPage />)
  const multi = within(card('Multi form'))
  expect(multi.queryByRole('tablist')).not.toBeInTheDocument()
  expect(multi.queryByTestId('player')).not.toBeInTheDocument()
  fireEvent.click(multi.getByRole('button', { name: 'Watch' }))
  expect(multi.getByRole('tablist')).toBeInTheDocument()
  expect(multi.getByTestId('player')).toHaveAttribute('data-autoplay', 'true')
})

it('keeps diagram-only forms accessible from the compact header', () => {
  useAppStore.setState({ cardView: 'compact' })
  render(<FormsPage />)
  const single = within(card('Single form'))
  expect(single.queryByText('Diagram with attribution')).not.toBeInTheDocument()
  fireEvent.click(single.getByRole('button', { name: 'Floor pattern (top view)' }))
  expect(single.getByText('Diagram with attribution')).toBeInTheDocument()
})

it('provides editing for every form category', () => {
  render(<FormsPage />)
  for (const id of ['multi', 'single', 'empty']) expect(screen.getByRole('button', { name: `Edit ${id}` })).toBeInTheDocument()
})

it('opens the selected custom form image in its own modal', () => {
  render(<FormsPage />)
  const multi = within(card('Multi form'))
  fireEvent.click(multi.getByRole('tab', { name: 'Show image 1' }))
  fireEvent.click(multi.getByRole('img'))
  expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', '/custom.jpg')
  expect(screen.getByRole('dialog')).toHaveTextContent('Image owner')
})
