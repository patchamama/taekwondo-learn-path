import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../store/useAppStore'
import { BeltBadge } from './BeltBadge'
import { BeltRangeSlider } from './BeltRangeSlider'
import { useBeltFilter } from '../hooks/useBeltFilter'
import { CARDS } from '../../data/cards'
import { cardBeltIndex } from '../../data/levels'
import { STRINGS } from '../i18n/strings'

function FilteredContent() {
  const { visibleCard } = useBeltFilter()
  return <ul>{CARDS.filter((c) => visibleCard(c.id)).map((c, index) => <li key={`${c.id}-${index}`}>{c.id}</li>)}</ul>
}

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

  it('marks every cumulative belt while dragging and filters actual content', () => {
    render(<><BeltRangeSlider /><FilteredContent /></>)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '3' } })
    for (let i = 0; i < 11; i++) {
      const rank = i === 10 ? '1 Dan' : `${10 - i} Kup`
      expect(screen.getByRole('button', { name: rank })).toHaveAttribute('aria-pressed', String(i <= 3))
    }
    expect(screen.getAllByRole('listitem').map((li) => li.textContent))
      .toEqual(CARDS.filter((c) => cardBeltIndex(c.id) <= 3).map((c) => c.id))
  })

  it('resets the visual bar for a single belt, preserving the previous range toggle', () => {
    render(<><BeltRangeSlider /><FilteredContent /></>)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '4' } })
    fireEvent.click(screen.getByRole('button', { name: '8 Kup' }))
    expect(screen.getByRole('slider')).toHaveValue('0')
    expect(screen.getAllByRole('button', { pressed: true }).map((b) => b.textContent)).toEqual(['8 Kup'])
    expect(screen.getAllByRole('listitem').map((li) => li.textContent))
      .toEqual(CARDS.filter((c) => cardBeltIndex(c.id) === 2).map((c) => c.id))
    expect(useAppStore.getState().maxBelt).toBe(4)
    fireEvent.click(screen.getByRole('button', { name: '8 Kup' }))
    expect(screen.getByRole('slider')).toHaveValue('4')
    expect(screen.getByRole('button', { name: '6 Kup' })).toHaveAttribute('aria-pressed', 'true')
    fireEvent.click(screen.getByRole('button', { name: '9 Kup' }))
    fireEvent.click(screen.getByRole('button', { name: STRINGS.beltAll.en }))
    expect(screen.getByRole('slider')).toHaveValue('1')
  })

  it('uses the selected 8 Kup as the cumulative endpoint, not the old persisted limit', () => {
    useAppStore.setState({ lang: 'es', maxBelt: 10, onlyBelt: null })
    render(<><BeltRangeSlider /><FilteredContent /></>)
    fireEvent.click(screen.getByRole('button', { name: '8 Kup' }))
    fireEvent.click(screen.getByRole('button', { name: 'Todo hasta el control' }))
    expect(screen.getByRole('slider')).toHaveValue('2')
    expect(screen.getAllByRole('listitem').map((li) => li.textContent))
      .toEqual(CARDS.filter((c) => cardBeltIndex(c.id) <= 2).map((c) => c.id))
    expect(screen.getAllByRole('button', { pressed: true }).map((b) => b.textContent))
      .toEqual(['Todo hasta el control', '10 Kup', '9 Kup', '8 Kup'])
  })

  it.each([
    ['en', 'Show content up to'], ['de', 'Inhalte bis'], ['es', 'Mostrar contenido hasta'],
  ] as const)('uses the requested caption in %s', (lang, caption) => {
    useAppStore.setState({ lang })
    render(<BeltRangeSlider />)
    expect(screen.getByRole('slider', { name: caption })).toBeInTheDocument()
  })

  it('badge names the belt where a form first appears', () => {
    render(<BeltBadge index={3} />)
    expect(screen.getByText('7 Kup')).toBeInTheDocument()
  })
})
