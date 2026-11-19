import { act, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { HistoryPage } from './HistoryPage'

const topics = {
  en: ['Cultural memory, not a continuous syllabus', 'From kwans to a shared identity', 'Military training and teaching abroad', 'More than one American pioneer', 'From demonstration to Olympic medals'],
  de: ['Kulturelle Erinnerung, kein durchgehender Lehrplan', 'Von Kwans zu einer gemeinsamen Identität', 'Militärische Ausbildung und Unterricht im Ausland', 'Mehr als ein amerikanischer Pionier', 'Von der Vorführung zu olympischen Medaillen'],
  es: ['Memoria cultural, no un programa ininterrumpido', 'De los kwans a una identidad compartida', 'Instrucción militar y enseñanza en el extranjero', 'Más de un pionero en Estados Unidos', 'De la exhibición a las medallas olímpicas'],
}

describe('HistoryPage source-derived context', () => {
  beforeEach(() => useAppStore.setState({ lang: 'en' }))

  it.each(['en', 'de', 'es'] as const)('offers substantive historical reading with book attribution in %s', (lang) => {
    useAppStore.setState({ lang })
    render(<HistoryPage />)
    for (const title of topics[lang]) {
      const region = screen.getByRole('region', { name: title })
      expect(region.textContent!.length).toBeGreaterThan(220)
    }
    expect(screen.getByText(/Clint Sharp.*OEBPS\/c2A.xhtml/)).toBeInTheDocument()
    const diaspora = screen.getByRole('region', { name: topics[lang][3] })
    expect(within(diaspora).getByText(/Jhoon Goo Rhee/)).toBeInTheDocument()
    const olympics = screen.getByRole('region', { name: topics[lang][4] })
    expect(within(olympics).getByText(/1988.*1992.*2000.*Sydney/)).toBeInTheDocument()
  })

  it('updates the new reading when the language changes without remounting', () => {
    render(<HistoryPage />)
    act(() => useAppStore.getState().setLang('es'))
    expect(screen.getByRole('region', { name: topics.es[0] })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: topics.en[0] })).not.toBeInTheDocument()
  })
})
