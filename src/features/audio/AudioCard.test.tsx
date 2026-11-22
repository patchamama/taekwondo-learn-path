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

  it('makes the audio longer when it also asks the other way round', () => {
    render(<AudioCard maxBelt={0} onlyBelt={0} />)
    openCard()
    const total = () => screen.getAllByText(/^\d+:\d\d$/).at(-1)!.textContent!
    const seconds = (v: string) => Number(v.split(':')[0]) * 60 + Number(v.split(':')[1])
    const before = seconds(total())
    fireEvent.click(screen.getByLabelText(/Preguntar también en la otra dirección/))
    expect(seconds(total())).toBeGreaterThan(before * 1.5)
  })
})
