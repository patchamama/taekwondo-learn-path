import { act, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CONCEPTS } from '../../data/concepts'
import { LANGS } from '../../shared/i18n/types'
import { useAppStore } from '../../shared/store/useAppStore'
import { ConceptsPage } from './ConceptsPage'

describe('ConceptsPage', () => {
  beforeEach(() => useAppStore.setState({ lang: 'en' }))
  it.each(LANGS)('renders all reading paragraphs and topic anchors in %s', (lang) => {
    useAppStore.setState({ lang })
    render(<ConceptsPage />)
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    const nav = screen.getByRole('navigation')
    for (const concept of CONCEPTS) {
      expect(within(nav).getByRole('link', { name: concept.title[lang] })).toHaveAttribute('href', `#${concept.id}`)
      const region = screen.getByRole('region', { name: concept.title[lang] })
      expect(region).toHaveAttribute('id', concept.id)
      for (const paragraph of concept.paragraphs) expect(within(region).getByText(paragraph[lang])).toBeInTheDocument()
    }
  })
  it('reacts to selected language changes without remounting', () => {
    render(<ConceptsPage />)
    act(() => useAppStore.getState().setLang('es'))
    expect(screen.getByRole('heading', { level: 2, name: CONCEPTS[0].title.es })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: CONCEPTS[0].title.en })).not.toBeInTheDocument()
  })
})
