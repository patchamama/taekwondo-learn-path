import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { imagesFor } from '../../data/cardImages'
import { CARD_BY_ID } from '../../data/cards'

vi.mock('../../data/cardImages', async (original) => {
  const actual = await original<typeof import('../../data/cardImages')>()
  return { ...actual, imagesFor: vi.fn(actual.imagesFor) }
})
import { useAppStore } from '../store/useAppStore'
import { CardImages } from './CardImages'
import { CardViewToggle } from './CardViewToggle'

describe('CardImages', () => {
  beforeEach(() => {
    useAppStore.setState({ lang: 'en', cardView: 'compact' })
  })

  it('compact: no picture, only an icon that previews it on hover', () => {
    const { container } = render(<CardImages cardId="ap-chagi" />)
    expect(container.querySelector('img')).toBeNull()
    const icon = screen.getByRole('button', { name: 'Show image' })
    fireEvent.mouseEnter(icon)
    expect(container.querySelector('img')).not.toBeNull()
    fireEvent.mouseLeave(icon)
    expect(container.querySelector('img')).toBeNull()
  })

  afterEach(() => { vi.useRealTimers(); vi.mocked(imagesFor).mockReset() })

  it('cycles previews, keeps the current attribution and localized technique title', () => {
    vi.useFakeTimers()
    vi.mocked(imagesFor).mockReturnValue([
      { src: '/first.jpg', kind: 'custom', source: 'First author' },
      { src: '/second.jpg', kind: 'custom', source: 'Second author' },
    ])
    useAppStore.setState({ lang: 'es' })
    render(<CardImages cardId="ap-chagi" />)
    fireEvent.focus(screen.getByRole('button'))
    const title = `${CARD_BY_ID['ap-chagi'].ko} — ${CARD_BY_ID['ap-chagi'].meaning.es}`
    expect(screen.getByRole('img')).toHaveAttribute('title', title)
    expect(screen.getByText('First author')).toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(1500) })
    expect(screen.getByRole('img')).toHaveAttribute('src', '/second.jpg')
    expect(screen.getByText('Second author')).toBeInTheDocument()
    expect(screen.queryByText('First author')).not.toBeInTheDocument()
    act(() => { vi.advanceTimersByTime(1500) })
    expect(screen.getByRole('img')).toHaveAttribute('src', '/first.jpg')
    fireEvent.blur(screen.getByRole('button', { name: 'Ver imagen' }))
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('skips broken images and preserves click-to-open on touch', () => {
    vi.mocked(imagesFor).mockReturnValue([
      { src: '/broken.jpg', kind: 'custom' }, { src: '/good.jpg', kind: 'custom' },
    ])
    render(<CardImages cardId="ap-chagi" />)
    fireEvent.click(screen.getByRole('button'))
    fireEvent.error(screen.getByRole('img'))
    expect(screen.getByRole('img')).toHaveAttribute('src', '/good.jpg')
  })

  it('details: shows the existing images', () => {
    useAppStore.setState({ cardView: 'details' })
    const { container } = render(<CardImages cardId="ap-chagi" />)
    expect(container.querySelectorAll('img').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Show image' })).not.toBeInTheDocument()
  })

  it('shows nothing for a card without images', () => {
    const { container } = render(<CardImages cardId="basic-dojang" />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('CardViewToggle', () => {
  it('switches between compact and details', () => {
    useAppStore.setState({ lang: 'en', cardView: 'compact' })
    render(<CardViewToggle />)
    fireEvent.click(screen.getByRole('radio', { name: 'With images' }))
    expect(useAppStore.getState().cardView).toBe('details')
    fireEvent.click(screen.getByRole('radio', { name: 'Compact' }))
    expect(useAppStore.getState().cardView).toBe('compact')
  })
})

it('expands one card without changing the global compact preference', () => {
  vi.mocked(imagesFor).mockReturnValue([{ src: '/expanded.jpg', kind: 'custom' }])
  useAppStore.setState({ cardView: 'compact' })
  render(<CardImages cardId="ap-chagi" display="details" expanded />)
  expect(screen.getByRole('img')).toHaveAttribute('src', '/expanded.jpg')
  expect(useAppStore.getState().cardView).toBe('compact')
})

it('opens the exact clicked detail image in a modal and restores focus on close', () => {
  vi.mocked(imagesFor).mockReturnValue([{ src: '/one.jpg', kind: 'custom' }, { src: '/two.jpg', kind: 'custom', source: 'Second author' }])
  useAppStore.setState({ lang: 'en', cardView: 'details' })
  render(<CardImages cardId="ap-chagi" />)
  const second = screen.getAllByRole('img')[1]
  const opener = second.closest('button')!
  opener.focus()
  fireEvent.click(second)
  const dialog = screen.getByRole('dialog')
  expect(dialog.querySelector('img')).toHaveAttribute('src', '/two.jpg')
  expect(dialog).toHaveTextContent('Second author')
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(opener).toHaveFocus()
})

it('opens the compact preview image when clicked', () => {
  vi.mocked(imagesFor).mockReturnValue([{ src: '/preview.jpg', kind: 'custom' }])
  useAppStore.setState({ lang: 'en', cardView: 'compact' })
  render(<CardImages cardId="ap-chagi" />)
  fireEvent.click(screen.getByRole('button', { name: 'Show image' }))
  const preview = screen.getByRole('img')
  fireEvent.click(preview)
  fireEvent.mouseLeave(screen.getByRole('button', { name: 'Show image' }).parentElement!)
  expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', '/preview.jpg')
})
