import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { BACKGROUND } from '../../data/background'
import { useAppStore } from '../../shared/store/useAppStore'
import { BackgroundPage } from './BackgroundPage'

describe('BackgroundPage', () => {
  beforeEach(() => useAppStore.setState({ lang: 'en' }))
  it('lists facts with a link to their Wikipedia source', () => {
    render(<BackgroundPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Background/ })).toBeInTheDocument()
    expect(document.querySelectorAll('a[href*="wikipedia.org"]').length).toBeGreaterThan(20)
  })
  it('has all three languages and at least one source per fact', () => {
    for (const f of BACKGROUND) {
      expect(f.text.en && f.text.de && f.text.es, f.id).toBeTruthy()
      expect(f.sources.length, f.id).toBeGreaterThan(0)
    }
  })
})
