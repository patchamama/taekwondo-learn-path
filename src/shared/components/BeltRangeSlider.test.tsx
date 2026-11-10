import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../store/useAppStore'
import { BeltBadge } from './BeltBadge'
import { BeltRangeSlider } from './BeltRangeSlider'

describe('belt filter', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'en', maxBelt: 10, onlyBelt: null })
  })

  it('picking a belt button shows only that belt; the slider goes back to cumulative', () => {
    render(<BeltRangeSlider />)
    fireEvent.click(screen.getByRole('button', { name: '8 Kup' }))
    expect(useAppStore.getState().onlyBelt).toBe(2)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '4' } })
    expect(useAppStore.getState().onlyBelt).toBeNull()
    expect(useAppStore.getState().maxBelt).toBe(4)
  })

  it('badge names the belt where a form first appears', () => {
    render(<BeltBadge index={3} />)
    expect(screen.getByText('7 Kup')).toBeInTheDocument()
  })
})
