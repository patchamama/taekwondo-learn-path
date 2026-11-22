import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { SelfDefensePage } from './SelfDefensePage'
import { useAppStore } from '../../shared/store/useAppStore'

vi.mock('../videos/ClipViewer', () => ({ ClipViewer: ({ autoplay }: { autoplay?: boolean }) => <div data-testid="video" data-autoplay={String(autoplay)} /> }))
vi.mock('../../shared/components/SpeakButton', () => ({ SpeakButton: () => null }))
it('opens self-defense clips from the header and keeps the belt badge rightmost', () => {
  useAppStore.setState({ lang: 'en', cardView: 'compact' })
  render(<SelfDefensePage />)
  expect(screen.queryByTestId('video')).not.toBeInTheDocument()
  const watch = screen.getAllByRole('button', { name: 'Watch' })[0]
  const card = watch.closest('li')!
  const toolbar = watch.closest('[data-card-media-toolbar]')!
  expect(toolbar.lastElementChild).toHaveAttribute('title', expect.stringContaining('Kup'))
  expect(within(card).queryByRole('img')).not.toBeInTheDocument()
  fireEvent.click(watch)
  expect(within(card).getByTestId('video')).toHaveAttribute('data-autoplay', 'true')
})
