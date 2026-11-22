import { render, screen } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { TechniquesPage } from './TechniquesPage'
import { TermsPage } from '../terms/TermsPage'
import { useAppStore } from '../../shared/store/useAppStore'

vi.mock('../../shared/hooks/useBeltFilter', () => ({ useBeltFilter: () => ({ visibleCard: () => true }) }))
vi.mock('../../data/cardImages', () => ({ imagesFor: () => [{ src: '/image.jpg', kind: 'custom' }] }))
vi.mock('../editor/EditButton', () => ({ EditButton: () => <button>Edit</button> }))
vi.mock('../../shared/components/SpeakButton', () => ({ SpeakButton: () => <button>Speak</button> }))

beforeEach(() => useAppStore.setState({ lang: 'en', cardView: 'compact' }))
for (const [name, Page] of [['terms', TermsPage], ['techniques', TechniquesPage]] as const) {
  it(`${name}: compact image icon is immediately before Kup in the upper-right header`, () => {
    render(<Page />)
    const icon = screen.getAllByRole('button', { name: 'Show image' })[0]
    const wrapper = icon.parentElement!
    expect(wrapper.nextElementSibling).toHaveAttribute('title', expect.stringContaining('Kup'))
    expect(wrapper.parentElement).toHaveClass('flex', 'items-center')
  })
  it(`${name}: details retains images outside the header`, () => {
    useAppStore.setState({ cardView: 'details' })
    render(<Page />)
    expect(screen.getAllByRole('img').length).toBeGreaterThan(0)
    expect(screen.queryByRole('button', { name: 'Show image' })).not.toBeInTheDocument()
  })
}
