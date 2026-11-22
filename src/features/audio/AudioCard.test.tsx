import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { AudioCard } from './AudioCard'

vi.mock('./backend', () => ({
  backendStatus: async () => true,
  buildMp3: vi.fn(),
  generateMissing: vi.fn(),
}))

const openCard = () => fireEvent.click(screen.getByRole('button', { name: 'Configurar audio' }))
const openOptions = () => fireEvent.click(screen.getByText('Opciones de audio'))
const count = () => Number(screen.getByLabelText('audio-count').textContent!.split(' ')[0])

describe('AudioCard', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'es' })
  })

  it('keeps configuration options collapsed until requested', () => {
    render(<AudioCard maxBelt={0} onlyBelt={0} />)
    openCard()
    const toggle = screen.getByText('Opciones de audio')
    const details = toggle.closest('details')!
    expect(details).not.toHaveAttribute('open')
    expect(details).toContainElement(screen.getByLabelText(/Vocabulario/))
    fireEvent.click(toggle)
    expect(details).toHaveAttribute('open')
    expect(screen.getByLabelText(/Vocabulario/)).toBeChecked()
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
    openOptions()
    expect(screen.getByLabelText(/descripción hablada/)).toBeChecked()
    expect(screen.getByLabelText(/término japonés/)).not.toBeChecked()
    expect(screen.getByLabelText('Narrar técnicas en orden aleatorio')).not.toBeChecked()
    fireEvent.click(screen.getByLabelText(/Vocabulario/))
    fireEvent.click(screen.getByLabelText(/Técnicas y formas/))
    expect(screen.getByRole('button', { name: 'Crear audio' })).toBeDisabled()
    expect(screen.getByText(/No hay nada seleccionado/)).toBeInTheDocument()
  })

  it('updates the position total when filtering without counting repeated passes or descriptions twice', () => {
    render(<AudioCard maxBelt={2} onlyBelt={null} />)
    openCard()
    expect(screen.getByLabelText('audio-position')).toHaveTextContent(`0/${count()}`)
    openOptions()
    fireEvent.click(screen.getByLabelText(/Preguntar también en la otra dirección/))
    fireEvent.click(screen.getByLabelText(/descripción hablada/))
    expect(screen.getByLabelText('audio-position')).toHaveTextContent(`0/${count()}`)
    fireEvent.click(screen.getByLabelText(/Vocabulario/))
    expect(screen.getByLabelText('audio-position')).toHaveTextContent(`0/${count()}`)
    fireEvent.click(screen.getByLabelText(/Técnicas y formas/))
    expect(screen.getByLabelText('audio-position')).toHaveTextContent('0/0')
  })

  it('shows generation for new terms immediately after creation and offers random narration', async () => {
    render(<AudioCard maxBelt={0} onlyBelt={0} />)
    openCard()
    const generate = await screen.findByRole('button', { name: 'Generar audio de términos nuevos' })
    const create = screen.getByRole('button', { name: 'Crear audio' })
    expect(create.nextElementSibling).toBe(generate)
    openOptions()
    const random = screen.getByLabelText('Narrar técnicas en orden aleatorio')
    const total = count()
    fireEvent.click(random)
    expect(random).toBeChecked()
    await waitFor(() => expect(count()).toBe(total))
  })

  it('makes the audio longer when it also asks the other way round', () => {
    render(<AudioCard maxBelt={0} onlyBelt={0} />)
    openCard()
    const total = () => screen.getAllByText(/^\d+:\d\d$/).at(-1)!.textContent!
    const seconds = (v: string) => Number(v.split(':')[0]) * 60 + Number(v.split(':')[1])
    const before = seconds(total())
    openOptions()
    fireEvent.click(screen.getByLabelText(/Preguntar también en la otra dirección/))
    expect(seconds(total())).toBeGreaterThan(before * 1.5)
  })
})
