import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
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
