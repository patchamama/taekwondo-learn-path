import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { AudioCard } from './AudioCard'

const openCard = () => fireEvent.click(screen.getByRole('button', { name: 'Configurar audio' }))
const count = () => Number(screen.getByLabelText('audio-count').textContent!.split(' ')[0])

describe('AudioCard', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'es' })
  })

  it('counts only the chosen belt when a single level is selected', () => {
    const { unmount } = render(<AudioCard maxBelt={2} onlyBelt={null} />)
    openCard()
    const upTo = count()
    unmount()
    render(<AudioCard maxBelt={2} onlyBelt={0} />)
    openCard()
    const one = count()
    expect(one).toBeGreaterThan(0)
    expect(one).toBeLessThan(upTo)
  })

  it('offers descriptions and the Japanese term as options and disables creation when nothing is selected', () => {
    render(<AudioCard maxBelt={10} onlyBelt={null} />)
    openCard()
    expect(screen.getByLabelText(/descripción hablada/)).not.toBeChecked()
    expect(screen.getByLabelText(/término japonés/)).not.toBeChecked()
    fireEvent.click(screen.getByLabelText(/Vocabulario/))
    fireEvent.click(screen.getByLabelText(/Técnicas y formas/))
    expect(screen.getByRole('button', { name: 'Crear audio' })).toBeDisabled()
    expect(screen.getByText(/No hay nada seleccionado/)).toBeInTheDocument()
  })
})
