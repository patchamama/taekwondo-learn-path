import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { resetEditorCache } from '../editor/api'
import { ChatBot } from './ChatBot'

const calls: { url: string; init?: RequestInit }[] = []

function stubBackend(ai: unknown, answer = 'Front kick is a kick.') {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (input: string, init?: RequestInit) => {
      calls.push({ url: String(input), init })
      if (String(input) === '/api/health')
        return { ok: true, json: async () => ({ ok: true, editor: true, ai }) } as Response
      if (String(input) === '/api/ai/chat')
        return { ok: true, json: async () => ({ ok: true, answer }) } as Response
      return { ok: false, json: async () => ({}) } as Response
    }),
  )
}

const open = () =>
  render(
    <MemoryRouter>
      <ChatBot />
    </MemoryRouter>,
  )

const ask = async (q: string) => {
  fireEvent.click(screen.getByRole('button', { name: 'Ask the assistant' }))
  fireEvent.change(screen.getByRole('textbox', { name: 'Your question' }), { target: { value: q } })
  fireEvent.click(screen.getByRole('button', { name: 'Send' }))
}

beforeEach(() => {
  calls.length = 0
  resetEditorCache()
  useAppStore.setState({ lang: 'en' })
})
afterEach(() => vi.unstubAllGlobals())

describe('ChatBot (no language model: search mode)', () => {
  beforeEach(() => vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline'))))

  it('starts closed and opens a panel with a short introduction', () => {
    open()
    expect(screen.queryByRole('dialog', { name: 'Assistant' })).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ask the assistant' }))
    const dialog = screen.getByRole('dialog', { name: 'Assistant' })
    expect(within(dialog).getByText(/English, German or Spanish/)).toBeInTheDocument()
  })

  it('answers from the site content with links to the pages and the videos', async () => {
    open()
    await ask('front kick')
    const dialog = screen.getByRole('dialog', { name: 'Assistant' })
    expect(await within(dialog).findByText(/This is what I found on the site/)).toBeInTheDocument()
    const links = within(dialog).getAllByRole('link')
    expect(links.some((l) => /\/study\/\d+/.test(l.getAttribute('href') ?? ''))).toBe(true)
    expect(
      links.some((l) => (l.getAttribute('href') ?? '').startsWith('https://www.youtube.com/watch')),
    ).toBe(true)
  })

  it('answers a question written in German', async () => {
    open()
    await ask('Was ist ein Vorwärtsfußstoß?')
    expect((await screen.findAllByText(/ap-chagi/)).length).toBeGreaterThan(0)
  })

  it('says so when nothing matches', async () => {
    open()
    await ask('zzqxqxzz')
    expect(await screen.findByText(/could not find that/)).toBeInTheDocument()
  })

  it('offers the NotebookLM notebook', () => {
    open()
    fireEvent.click(screen.getByRole('button', { name: 'Ask the assistant' }))
    const link = screen.getByRole('link', { name: /NotebookLM/ })
    expect(link.getAttribute('href')).toContain('notebook.google.com')
    expect(link).toHaveAttribute('target', '_blank')
  })

  it('closes with the close button', () => {
    open()
    fireEvent.click(screen.getByRole('button', { name: 'Ask the assistant' }))
    fireEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.queryByRole('dialog', { name: 'Assistant' })).not.toBeInTheDocument()
  })
})

describe('ChatBot (language model defined in the local backend)', () => {
  it('sends the best site passages to the model and shows its answer with the sources', async () => {
    stubBackend({ enabled: true, provider: 'ollama', model: 'llama3.1' })
    open()
    await ask('What is a front kick?')
    expect(await screen.findByText('Front kick is a kick.')).toBeInTheDocument()
    const call = calls.find((c) => c.url === '/api/ai/chat')!
    expect((call.init?.headers as Record<string, string>)['X-Editor']).toBe('1')
    const body = JSON.parse(String(call.init?.body))
    expect(body.question).toBe('What is a front kick?')
    expect(body.lang).toBe('en')
    expect(body.contexts.length).toBeGreaterThan(0)
    expect(body.contexts[0]).toHaveProperty('title')
    expect(body.contexts[0]).toHaveProperty('text')
    expect(screen.getByText(/ollama/)).toBeInTheDocument()
  })

  it('falls back to the site search when the model fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string) => {
        if (String(input) === '/api/health')
          return {
            ok: true,
            json: async () => ({
              ok: true,
              editor: true,
              ai: { enabled: true, provider: 'ollama' },
            }),
          } as Response
        return {
          ok: false,
          status: 500,
          json: async () => ({ ok: false, error: 'boom' }),
        } as Response
      }),
    )
    open()
    await ask('front kick')
    await waitFor(() =>
      expect(screen.getByText(/This is what I found on the site/)).toBeInTheDocument(),
    )
  })
})
