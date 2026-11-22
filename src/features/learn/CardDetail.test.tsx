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
