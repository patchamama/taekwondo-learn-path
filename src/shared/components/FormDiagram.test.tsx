import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../store/useAppStore'
import { FormDiagram, hasDiagram } from './FormDiagram'

const labels = {
  en: { alt: 'Taegeuk 1: complete photographic sequence and floor directions. Embedded text: English and Korean.', permission: 'Used with owner-confirmed permission' },
  de: { alt: 'Taegeuk 1: vollständige Fotosequenz und Laufrichtungen. Bildtext: Englisch und Koreanisch.', permission: 'Mit vom Eigentümer bestätigter Erlaubnis verwendet' },
  es: { alt: 'Taegeuk 1: secuencia fotográfica completa y direcciones de desplazamiento. Texto en la imagen: inglés y coreano.', permission: 'Utilizado con permiso confirmado por el propietario' },
}

afterEach(cleanup)

describe('form diagrams and supplemental book references', () => {
  it('does not display floor patterns while retaining the book reference', () => {
    useAppStore.setState({ lang: 'en' })
    render(<FormDiagram cardId="taeguk-1" />)
    expect(screen.queryByAltText('Floor pattern: Taegeuk Il Jang.png')).not.toBeInTheDocument()
    expect(screen.getByText('Supplemental book reference')).toBeInTheDocument()
  })

  for (const lang of ['en', 'de', 'es'] as const) {
    for (let number = 1; number <= 8; number++) {
      it(`renders accessible Taegeuk ${number} with separate permission in ${lang}`, () => {
        useAppStore.setState({ lang })
        render(<FormDiagram cardId={`taeguk-${number}`} />)
        expect(screen.getAllByRole('img')).toHaveLength(1)
        const alt = labels[lang].alt.replace('Taegeuk 1:', `Taegeuk ${number}:`)
        expect(screen.getByAltText(alt)).toHaveAttribute(
          'src', `/diagrams/books/woo-taegeuk-${number}-sequence.jpg`,
        )
        expect(screen.getByText(labels[lang].permission, { exact: false })).toHaveTextContent('Sung Woo')
        expect(screen.queryByRole('link', { name: labels[lang].permission })).not.toBeInTheDocument()
        expect(screen.queryByRole('link', { name: 'CC BY-SA 4.0' })).not.toBeInTheDocument()
      })
    }
  }

  it('keeps the book reference in the maximize view', () => {
    useAppStore.setState({ lang: 'en' })
    render(<FormDiagram cardId="taeguk-8" />)
    fireEvent.click(screen.getByRole('button', { name: '⛶ Maximize' }))
    expect(screen.getAllByRole('img')).toHaveLength(1)
    expect(screen.queryByRole('link', { name: 'CC BY-SA 4.0' })).not.toBeInTheDocument()
    expect(screen.getByText(/Used with owner-confirmed permission/)).toHaveTextContent('Sung Woo')
  })

  it('does not conflate classic forms with Taegeuk or invent unknown references', () => {
    expect(hasDiagram('taeguk-1')).toBe(true)
    expect(hasDiagram('kuk-mu-1')).toBe(false)
    const { container } = render(<FormDiagram cardId="unknown-form" />)
    expect(container).toBeEmptyDOMElement()
  })
})

it('opens the book image itself in a modal', () => {
  useAppStore.setState({ lang: 'en' })
  render(<FormDiagram cardId="taeguk-1" />)
  fireEvent.click(screen.getByRole('img'))
  expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', '/diagrams/books/woo-taegeuk-1-sequence.jpg')
})
