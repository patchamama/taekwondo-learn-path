import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { CardDetail } from './CardDetail'

describe('CardDetail Japanese parts', () => {
  beforeEach(() => {
    useAppStore.getState().reset()
    useAppStore.setState({ lang: 'en' })
  })

  it('shows the Japanese equivalent of each word part in the breakdown', () => {
    render(
      <MemoryRouter>
        <ul>
          <CardDetail cardId="momtong-chirugi" defaultOpen />
        </ul>
      </MemoryRouter>,
    )
    const line = screen.getByText(/Breakdown/i).closest('p')!
    expect(line.textContent).toMatch(/momtong \(.*JP chūdan\)/)
    expect(line.textContent).toMatch(/chirugi \(.*JP tsuki\)/)
  })
})

it('opens compact media from a header video action and keeps Kup at the far right', async () => {
  const { fireEvent, within } = await import('@testing-library/react')
  useAppStore.setState({ lang: 'en', cardView: 'compact' })
  const { container } = render(<MemoryRouter><ul><CardDetail cardId="ap-chagi" /></ul></MemoryRouter>)
  expect(container.querySelector('iframe')).toBeNull()
  const watch = screen.getByRole('button', { name: /Watch/ })
  fireEvent.click(watch)
  expect(watch).toHaveAttribute('aria-expanded', 'true')
  expect(screen.getByLabelText('Clip: ap-chagi')).toBeInTheDocument()
  const toolbar = watch.closest('[data-card-media-toolbar]')!
  expect(within(toolbar as HTMLElement).getByText(/Kup/)).toBeInTheDocument()
  expect(toolbar.lastElementChild?.textContent).toMatch(/Kup/)
  expect(toolbar.parentElement?.lastElementChild).toBe(toolbar)
})
