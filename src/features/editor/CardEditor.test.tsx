import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CARD_BY_ID } from '../../data/cards'
import { useAppStore } from '../../shared/store/useAppStore'
import { resetEditorCache } from './api'
import { CardEditor } from './CardEditor'
import { EditButton } from './EditButton'

const calls: { url: string; init?: RequestInit }[] = []

beforeEach(() => {
  calls.length = 0
  resetEditorCache()
  useAppStore.setState({ lang: 'en' })
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init?: RequestInit) => {
      calls.push({ url: String(input), init })
      if (String(input) === '/api/health')
        return { ok: true, json: async () => ({ ok: true, editor: true }) } as Response
      return { ok: true, json: async () => ({ ok: true, override: {} }) } as Response
    }),
  )
})
afterEach(() => vi.unstubAllGlobals())

describe('CardEditor', () => {
  it('starts from the current card, saves only what changed and lets the Kup be moved with a listbox', async () => {
    const onSaved = vi.fn()
    render(
      <MemoryRouter>
        <CardEditor cardId="basic-dojang" onClose={() => {}} onSaved={onSaved} />
      </MemoryRouter>,
    )
    const meaningEn = screen.getByRole('textbox', { name: 'Meaning (EN)' }) as HTMLInputElement
    expect(meaningEn.value).toBe(CARD_BY_ID['basic-dojang'].meaning.en)
    fireEvent.change(meaningEn, { target: { value: 'martial arts hall' } })
    const kup = screen.getByRole('combobox', { name: 'Kup (belt)' })
    fireEvent.change(kup, { target: { value: '3' } })
    fireEvent.click(screen.getByRole('button', { name: 'Save' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    const put = calls.find((c) => c.init?.method === 'PUT')!
    expect(put.url).toBe('/api/cards/basic-dojang')
    const body = JSON.parse(String(put.init?.body))
    expect(body.meaning.en).toBe('martial arts hall')
    expect(body.meaning.es).toBe(CARD_BY_ID['basic-dojang'].meaning.es)
    expect(body.kup).toBe(3)
    expect(body.hangul).toBeUndefined() // unchanged fields are not stored
  })

  it('adds an image from the picker and can remove it again', async () => {
    render(
      <MemoryRouter>
        <CardEditor cardId="ap-chagi" onClose={() => {}} onSaved={() => {}} />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Add image…' }))
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'ap-chagi' } })
    fireEvent.click(screen.getAllByRole('button', { name: /ap-chagi .* 1$/ })[0])
    expect(screen.getAllByRole('button', { name: 'Remove image' })).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Remove image' }))
    expect(screen.queryByRole('button', { name: 'Remove image' })).not.toBeInTheDocument()
  })

  it('can discard the edits of a card (stores an empty override)', async () => {
    const onSaved = vi.fn()
    render(
      <MemoryRouter>
        <CardEditor cardId="basic-dojang" onClose={() => {}} onSaved={onSaved} />
      </MemoryRouter>,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Discard my edits of this card' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalled())
    const put = calls.find((c) => c.init?.method === 'PUT')!
    expect(JSON.parse(String(put.init?.body))).toEqual({})
  })
})

describe('EditButton', () => {
  it('shows the edit button only when the local editor backend answers', async () => {
    render(<EditButton cardId="basic-dojang" />)
    expect(await screen.findByRole('button', { name: 'Edit card' })).toBeInTheDocument()
  })

  it('stays hidden on the deployed site (no backend)', async () => {
    resetEditorCache()
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')))
    const { container } = render(<EditButton cardId="basic-dojang" />)
    await new Promise((r) => setTimeout(r, 20))
    expect(container).toBeEmptyDOMElement()
  })
})
