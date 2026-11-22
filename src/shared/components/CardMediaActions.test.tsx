import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { CLIPS_BY_CARD } from '../../data/clips'
import { useAppStore } from '../store/useAppStore'
import { CardMediaActions } from './CardMediaActions'

beforeEach(() => useAppStore.setState({ lang: 'en', cardView: 'compact' }))
afterEach(() => vi.useRealTimers())
it('shows only header icons until hover, cycles clip stills and opens media on click', () => {
  vi.useFakeTimers()
  const open = vi.fn()
  const { container } = render(<CardMediaActions cardId="ap-chagi" onOpen={open} expanded={false} />)
  expect(container.querySelector('img')).toBeNull()
  const frames = screen.getByRole('button', { name: /frames/i })
  fireEvent.mouseEnter(frames)
  const first = screen.getByRole('img').getAttribute('src')
  act(() => vi.advanceTimersByTime(800))
  expect(screen.getByRole('img').getAttribute('src')).not.toBe(first)
  fireEvent.click(frames)
  expect(open).toHaveBeenCalledTimes(1)
  fireEvent.keyDown(frames, { key: 'Escape' })
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: /Watch/ }))
  expect(open).toHaveBeenCalledTimes(2)
  expect(CLIPS_BY_CARD['ap-chagi']).toBeDefined()
})
it('keeps video actions in details view, without inline clips or pictures', () => {
  useAppStore.setState({ cardView: 'details' })
  const open = vi.fn()
  const { container } = render(<CardMediaActions cardId="ap-chagi" expanded onOpen={open} />)
  expect(container.querySelector('img, iframe')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: /Watch/ }))
  expect(open).toHaveBeenCalledOnce()
})
it('does not offer clip actions for cards without video', () => {
  render(<CardMediaActions cardId="basic-dojang" expanded={false} onOpen={vi.fn()} />)
  expect(screen.queryByRole('button', { name: /Watch/ })).not.toBeInTheDocument()
})
it('maximizes the displayed preview frame and keeps it stable', () => {
  vi.useFakeTimers()
  render(<CardMediaActions cardId="ap-chagi" onOpen={vi.fn()} expanded={false} />)
  fireEvent.mouseEnter(screen.getByRole('button', { name: /frames/i }))
  const image = screen.getByRole('img')
  const src = image.getAttribute('src')
  fireEvent.click(image)
  fireEvent.mouseLeave(screen.getByRole('button', { name: /frames/i }).parentElement!)
  act(() => vi.advanceTimersByTime(1600))
  expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', src)
})
