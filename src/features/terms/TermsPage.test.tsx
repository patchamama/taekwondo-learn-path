import { render, screen } from '@testing-library/react'
import { it, expect } from 'vitest'
import { TermsPage } from './TermsPage'

it('places the term and media controls in the same responsive header', () => {
  const { container } = render(<TermsPage />)
  const card = container.querySelector('[data-card-media-toolbar]')!.closest('li')!
  const header = card.querySelector('[data-card-header]')!
  expect(header).toContainElement(card.querySelector('[data-card-media-toolbar]'))
  expect(header).toContainElement(card.querySelector('[lang="ko"]'))
  expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
})
