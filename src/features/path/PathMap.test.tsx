import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { PathMap } from './PathMap'
import { BELTS } from '../../data/belts'

describe('PathMap', () => {
  it('renders every belt node and selects on click', () => {
    const onSelect = vi.fn()
    render(<PathMap currentIndex={0} selectedIndex={0} onSelect={onSelect} youAreHere="here" />)
    expect(screen.getAllByRole('button')).toHaveLength(BELTS.length)
    fireEvent.click(screen.getByRole('button', { name: /8 Kup/ }))
    expect(onSelect).toHaveBeenCalledWith(2)
  })

  it('shows progress road only after advancing', () => {
    const { rerender } = render(
      <PathMap currentIndex={0} selectedIndex={0} onSelect={() => {}} youAreHere="here" />,
    )
    expect(screen.queryByTestId('done-road')).toBeNull()
    rerender(<PathMap currentIndex={3} selectedIndex={0} onSelect={() => {}} youAreHere="here" />)
    expect(screen.getByTestId('done-road')).toBeInTheDocument()
  })
})
