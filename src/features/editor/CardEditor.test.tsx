import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { CARD_BY_ID } from '../../data/cards'
import { useAppStore } from '../../shared/store/useAppStore'
import { resetEditorCache } from './api'
import { CardEditor } from './CardEditor'
import { EditButton } from './EditButton'

const calls: { url: string; init?: RequestInit }[] = []
const dialogMethods = ['showModal', 'close'] as const
const originalDialogMethods = dialogMethods.map((key) => Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, key))
beforeAll(() => {
  for (const key of dialogMethods) {
    if (!HTMLDialogElement.prototype[key]) {
      Object.defineProperty(HTMLDialogElement.prototype, key, { configurable: true, value() {} })
    }
  }
})
afterAll(() => {
  dialogMethods.forEach((key, i) => {
    const original = originalDialogMethods[i]
    if (original) Object.defineProperty(HTMLDialogElement.prototype, key, original)
    else Reflect.deleteProperty(HTMLDialogElement.prototype, key)
  })
})

beforeEach(() => {
  calls.length = 0
  // JSDOM does not implement native dialog lifecycle or keyboard handling.
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function (this: HTMLDialogElement) {
    this.setAttribute('open', '')
  })
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function (this: HTMLDialogElement) {
    this.removeAttribute('open')
  })
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
afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('CardEditor', () => {
  it('confirms soft hiding and writes visibility only, never overrides or deletion', async () => {
    const onSaved = vi.fn()
    render(<CardEditor cardId="basic-dojang" onClose={() => {}} onSaved={onSaved} />)
    fireEvent.change(screen.getByRole('textbox', { name: 'Meaning (EN)' }), { target: { value: 'Unsaved draft' } })
    fireEvent.click(screen.getByRole('button', { name: 'Hide card' }))
    expect(calls.filter((c) => c.init?.method === 'PUT')).toHaveLength(0)
    expect(screen.getByText(/Hiding is not deletion/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Keep visible' }))
    expect(calls.filter((c) => c.init?.method === 'PUT')).toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: 'Hide card' }))
    fireEvent.click(screen.getByRole('button', { name: 'Confirm hide' }))
    await waitFor(() => expect(onSaved).toHaveBeenCalledOnce())
    const writes = calls.filter((c) => c.init?.method === 'PUT')
    expect(writes).toHaveLength(1)
    expect(writes[0].url).toBe('/api/cards/basic-dojang/visibility')
    expect(JSON.parse(String(writes[0].init?.body))).toEqual({ hidden: true })
    expect(calls.some((c) => c.init?.method === 'DELETE')).toBe(false)
  })

  it('opens a viewport dialog with a scrolling body, persistent actions and focus restoration', () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    const onClose = vi.fn()
    const { unmount } = render(<CardEditor cardId="basic-dojang" onClose={onClose} />)
    const dialog = screen.getByRole('dialog', { name: 'Edit card: dojang' })
    expect(dialog.tagName).toBe('DIALOG')
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledOnce()
    expect(dialog).toHaveClass('h-[100dvh]', 'w-screen', 'max-w-none', 'max-h-none')
    expect(dialog.querySelector('[data-editor-body]')).toHaveClass('min-w-0', 'overflow-x-hidden')
    expect(screen.getByRole('textbox', { name: 'Meaning (EN)' })).toHaveClass('min-w-0', 'w-full')
    const close = screen.getByRole('button', { name: 'Close' })
    expect(close).toHaveFocus()
    const body = screen.getByRole('textbox', { name: 'Meaning (EN)' }).closest('[data-editor-body]')!
    expect(body).toHaveClass('min-h-0', 'overflow-y-auto')
    expect(body).not.toContainElement(screen.getByRole('button', { name: 'Save' }))
    expect(body).not.toContainElement(close)
    fireEvent.click(close)
    expect(onClose).toHaveBeenCalledOnce()
    unmount()
    expect(trigger).toHaveFocus()
    trigger.remove()
  })

  it('handles native Escape cancellation without saving and preserves the editor behind the image picker', () => {
    const onClose = vi.fn()
    render(<CardEditor cardId="ap-chagi" onClose={onClose} />)
    const editor = screen.getByRole('dialog')
    fireEvent.change(screen.getByRole('textbox', { name: 'Meaning (EN)' }), { target: { value: 'Draft kick' } })
    fireEvent.click(screen.getByRole('button', { name: 'Add image…' }))
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getAllByRole('dialog')).toHaveLength(1)
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: 'Meaning (EN)' })).toHaveValue('Draft kick')
    fireEvent(editor, new Event('cancel', { bubbles: false, cancelable: true }))
    expect(onClose).toHaveBeenCalledOnce()
    expect(calls.some((c) => c.init?.method === 'PUT')).toBe(false)
  })

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

describe('CardEditor language-model helper', () => {
  const withHealth = (
    ai: unknown,
    translations: unknown = { de: 'Übungshalle', es: 'sala de entrenamiento' },
  ) =>
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string, init?: RequestInit) => {
        calls.push({ url: String(input), init })
        if (String(input) === '/api/health')
          return { ok: true, json: async () => ({ ok: true, editor: true, ai }) } as Response
        if (String(input) === '/api/ai/translate')
          return { ok: true, json: async () => ({ ok: true, translations }) } as Response
        return { ok: true, json: async () => ({ ok: true, override: {} }) } as Response
      }),
    )

  it('has no suggest button when no model is defined', async () => {
    resetEditorCache()
    withHealth({ enabled: false })
    render(
      <MemoryRouter>
        <CardEditor cardId="basic-dojang" onClose={() => {}} onSaved={() => {}} />
      </MemoryRouter>,
    )
    await new Promise((r) => setTimeout(r, 20))
    expect(screen.queryByRole('button', { name: /Suggest translations/ })).not.toBeInTheDocument()
  })

  it('fills the other languages from the chosen one when a model is defined', async () => {
    resetEditorCache()
    withHealth({ enabled: true, provider: 'ollama', model: 'llama3.1' })
    render(
      <MemoryRouter>
        <CardEditor cardId="basic-dojang" onClose={() => {}} onSaved={() => {}} />
      </MemoryRouter>,
    )
    fireEvent.change(screen.getByRole('textbox', { name: 'Meaning (EN)' }), {
      target: { value: 'training hall' },
    })
    fireEvent.click(await screen.findByRole('button', { name: /Suggest translations/ }))
    await waitFor(() =>
      expect(
        (screen.getByRole('textbox', { name: 'Meaning (DE)' }) as HTMLInputElement).value,
      ).toBe('Übungshalle'),
    )
    expect((screen.getByRole('textbox', { name: 'Meaning (ES)' }) as HTMLInputElement).value).toBe(
      'sala de entrenamiento',
    )
    const call = calls.find((c) => c.url === '/api/ai/translate')!
    expect(call.init?.method).toBe('POST')
    expect((call.init?.headers as Record<string, string>)['X-Editor']).toBe('1')
    const body = JSON.parse(String(call.init?.body))
    expect(body).toMatchObject({
      from: 'en',
      targets: ['de', 'es'],
      text: 'training hall',
      context: { ko: 'dojang' },
    })
    expect(screen.getByText(/Review them before saving/)).toBeInTheDocument()
  })
})
