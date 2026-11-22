import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../store/useAppStore'
import { BookSynonym } from './BookSynonym'

describe('BookSynonym', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'es' })
  })

  it('shows the book spelling and German meaning as a synonym', () => {
    render(<BookSynonym cardId="arae-macki" />)
    expect(screen.getByText(/Sinónimo \(libro\):/)).toBeInTheDocument()
    expect(screen.getByText(/Arae-Makki/)).toBeInTheDocument()
    expect(screen.getByText(/Tiefblock/)).toBeInTheDocument()
  })

  it('renders nothing for an id the book adds nothing to', () => {
    const { container } = render(<BookSynonym cardId="sambo-taeryon" />)
    expect(container).toBeEmptyDOMElement()
  })
})
