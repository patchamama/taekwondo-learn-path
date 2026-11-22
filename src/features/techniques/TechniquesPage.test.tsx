import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { TechniquesPage } from './TechniquesPage'
import { useAppStore } from '../../shared/store/useAppStore'

vi.mock('../../shared/hooks/useBeltFilter', () => ({ useBeltFilter: () => ({ visibleCard: () => true }) }))
vi.mock('../videos/ClipViewer', () => ({ ClipViewer: ({ cardId, autoplay = true }: { cardId: string; autoplay?: boolean }) => <div data-testid="video" data-autoplay={String(autoplay)}>{cardId}</div> }))
vi.mock('../editor/EditButton', () => ({ EditButton: () => null }))
vi.mock('../../shared/components/SpeakButton', () => ({ SpeakButton: () => null }))
beforeEach(() => useAppStore.setState({ lang: 'en', cardView: 'compact' }))
it('keeps technique media in the upper-right header and expands only the selected card', () => {
  render(<TechniquesPage />)
  const card = screen.getByRole('heading', { name: 'ap-chagi' }).closest('li')!
  const area = within(card)
  expect(area.queryByRole('img')).not.toBeInTheDocument()
  expect(area.queryByTestId('video')).not.toBeInTheDocument()
  const toolbar = card.querySelector('[data-card-media-toolbar]')!
  expect(toolbar.lastElementChild).toHaveAttribute('title', expect.stringContaining('Kup'))
  fireEvent.click(area.getByRole('button', { name: 'Watch' }))
  expect(screen.getAllByTestId('video')).toHaveLength(1)
  expect(area.getByTestId('video')).toHaveAttribute('data-autoplay', 'true')
  expect(area.getAllByRole('img').length).toBeGreaterThan(0)
  fireEvent.click(area.getByRole('button', { name: 'Hide' }))
  expect(area.queryByTestId('video')).not.toBeInTheDocument()
})
it('details mode keeps its images and video starts only after the header action', () => {
  useAppStore.setState({ cardView: 'details' })
  render(<TechniquesPage />)
  const card = screen.getByRole('heading', { name: 'ap-chagi' }).closest('li')!
  expect(within(card).getAllByRole('img').length).toBeGreaterThan(0)
  expect(within(card).queryByTestId('video')).not.toBeInTheDocument()
  fireEvent.click(within(card).getByRole('button', { name: 'Watch' }))
  expect(within(card).getByTestId('video')).toHaveAttribute('data-autoplay', 'true')
})
