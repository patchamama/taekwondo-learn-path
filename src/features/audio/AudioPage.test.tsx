import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { AudioPage } from './AudioPage'

const open = () =>
  render(
    <MemoryRouter>
      <AudioPage />
    </MemoryRouter>,
  )

describe('AudioPage', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'es', maxBelt: 10, onlyBelt: null })
  })

  it('counts only the chosen belt when a single level is selected', () => {
    open()
    const all = Number(screen.getByText(/elementos en este audio/).textContent!.split(' ')[0])
    useAppStore.setState({ onlyBelt: 0 })
    const { container } = open()
    const one = Number(container.querySelector('[aria-live]')!.textContent!.split(' ')[0])
    expect(one).toBeGreaterThan(0)
    expect(one).toBeLessThan(all)
  })

  it('offers descriptions and the Japanese term as options and disables creation when nothing is selected', () => {
    open()
    expect(screen.getByLabelText(/descripción hablada/)).not.toBeChecked()
    expect(screen.getByLabelText(/término japonés/)).not.toBeChecked()
    fireEvent.click(screen.getByLabelText(/Vocabulario/))
    fireEvent.click(screen.getByLabelText(/Técnicas y formas/))
    expect(screen.getByRole('button', { name: 'Crear audio' })).toBeDisabled()
    expect(screen.getByText(/No hay nada seleccionado/)).toBeInTheDocument()
  })
})
