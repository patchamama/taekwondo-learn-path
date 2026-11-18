import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { CONCEPTS } from './data/concepts'
import { useAppStore } from './shared/store/useAppStore'
import { App } from './App'
import pkg from '../package.json'

beforeEach(() => {
  window.location.hash = '#/'
  useAppStore.getState().reset()
  useAppStore.setState({ lang: 'en' })
})

describe('App reading navigation', () => {
  const labels = {
    en: ['Concepts & practice', 'Understanding Taekwondo practice', 'Path', 'Study', 'Techniques', 'History', 'Forms'],
    de: ['Konzepte & Praxis', 'Taekwondo-Praxis verstehen', 'Pfad', 'Lernen', 'Techniken', 'Geschichte', 'Formen'],
    es: ['Conceptos y práctica', 'Comprender la práctica de Taekwondo', 'Camino', 'Estudio', 'Técnicas', 'Historia', 'Formas'],
  }
  it.each(['en', 'de', 'es'] as const)('opens readings and router-safe topics in %s, preserving prior navigation', async (lang) => {
    useAppStore.setState({ lang })
    render(<App />)
    const [navigation, title, ...previous] = labels[lang]
    fireEvent.click(screen.getByRole('link', { name: navigation }))
    expect(await screen.findByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    for (const concept of CONCEPTS) {
      const link = screen.getByRole('link', { name: concept.title[lang] })
      expect(link).toHaveAttribute('href', `#/concepts#${concept.id}`)
      fireEvent.click(link)
      await waitFor(() => expect(window.location.hash).toBe(`#/concepts#${concept.id}`))
      expect(document.getElementById(concept.id)).toHaveTextContent(concept.title[lang])
      expect(screen.getByRole('heading', { level: 1, name: title })).toBeInTheDocument()
    }
    for (const name of previous) expect(screen.getByRole('link', { name })).toBeInTheDocument()
    for (const [index, route] of ['study', 'techniques', 'history', 'forms'].entries()) {
      fireEvent.click(screen.getByRole('link', { name: previous[index + 1] }))
      await waitFor(() => expect(window.location.hash).toBe(`#/${route}`))
      expect(screen.getAllByRole('heading').length).toBeGreaterThan(0)
    }
    fireEvent.click(screen.getByRole('link', { name: previous[0] }))
    await waitFor(() => expect(window.location.hash).toBe('#/'))
    expect(screen.queryByRole('heading', { name: title })).not.toBeInTheDocument()
  })

  it.each(['en', 'de', 'es'] as const)('follows a reading link from an actual lesson in %s', async (lang) => {
    useAppStore.setState({ lang, strictOrder: false })
    window.location.hash = '#/lesson/u1-actions'
    render(<App />)
    const blocks = CONCEPTS.find((c) => c.id === 'blocks')!
    fireEvent.click(await screen.findByRole('link', { name: blocks.title[lang] }))
    await waitFor(() => expect(window.location.hash).toBe('#/concepts#blocks'))
    expect(screen.getByRole('heading', { name: blocks.title[lang] })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('combobox', { name: 'Language' }), { target: { value: lang === 'es' ? 'de' : 'es' } })
    expect(screen.getByRole('heading', { name: blocks.title[lang === 'es' ? 'de' : 'es'] })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: blocks.title[lang === 'es' ? 'de' : 'es'] }))
      .toHaveAttribute('href', '#/concepts#blocks')
  })

  it('opens a direct topic URL and follows a link from actual belt study', async () => {
    window.location.hash = '#/concepts#meditation'
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Optional meditation and attention' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Study' }))
    expect(await screen.findByRole('heading', { name: 'Study by level' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('link', { name: 'Gentle stretching without forcing' }))
    await waitFor(() => expect(window.location.hash).toBe('#/concepts#stretching'))
    expect(screen.getByRole('heading', { name: 'Understanding Taekwondo practice' })).toBeInTheDocument()
  })
})

describe('App', () => {
  it('shows the version from package.json in the banner', () => {
    render(<App />)
    expect(screen.getByTestId('version-banner')).toHaveTextContent(`v${pkg.version}`)
  })
})
