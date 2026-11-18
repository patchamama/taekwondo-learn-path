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
  it('preserves the existing Wikimedia image and its real attribution', () => {
    useAppStore.setState({ lang: 'en' })
    render(<FormDiagram cardId="taeguk-1" />)
    expect(screen.getByAltText('Floor pattern: Taegeuk Il Jang.png')).toHaveAttribute('src', '/diagrams/taeguk-1.png')
    expect(screen.getByRole('link', { name: 'CC BY-SA 4.0' })).toHaveAttribute('href', 'https://creativecommons.org/licenses/by-sa/4.0')
    expect(screen.getByText(/Jim Northrup/)).toHaveTextContent('Wikimedia Commons')
  })

  for (const lang of ['en', 'de', 'es'] as const) {
    for (let number = 1; number <= 8; number++) {
      it(`renders accessible Taegeuk ${number} with separate permission in ${lang}`, () => {
        useAppStore.setState({ lang })
        render(<FormDiagram cardId={`taeguk-${number}`} />)
        expect(screen.getAllByRole('img')).toHaveLength(2)
        const alt = labels[lang].alt.replace('Taegeuk 1:', `Taegeuk ${number}:`)
        expect(screen.getByAltText(alt)).toHaveAttribute(
          'src', `/diagrams/books/woo-taegeuk-${number}-sequence.jpg`,
        )
        expect(screen.getByText(labels[lang].permission, { exact: false })).toHaveTextContent('Sung Woo')
        expect(screen.queryByRole('link', { name: labels[lang].permission })).not.toBeInTheDocument()
        expect(screen.getByRole('link', { name: 'CC BY-SA 4.0' })).toBeInTheDocument()
      })
    }
  }

  it('keeps both images and separate attributions in the maximize view', () => {
    useAppStore.setState({ lang: 'en' })
    render(<FormDiagram cardId="taeguk-8" />)
    fireEvent.click(screen.getByRole('button'))
    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(screen.getByRole('link', { name: 'CC BY-SA 4.0' })).toBeInTheDocument()
    expect(screen.getByText(/Used with owner-confirmed permission/)).toHaveTextContent('Sung Woo')
  })

  it('does not conflate classic forms with Taegeuk or invent unknown references', () => {
    expect(hasDiagram('taeguk-1')).toBe(true)
    expect(hasDiagram('kuk-mu-1')).toBe(false)
    const { container } = render(<FormDiagram cardId="unknown-form" />)
    expect(container).toBeEmptyDOMElement()
  })
})
