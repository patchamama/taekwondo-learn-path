import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import * as api from './api'
import { CreateCard } from './CreateCard'

vi.mock('./api', async (original) => ({ ...await original<typeof api>(), createCard: vi.fn(), addClip: vi.fn(), saveCard: vi.fn() }))
vi.mock('./ImagePicker', () => ({ ImagePicker: ({ onPick }: { onPick: (i: { src: string }) => void }) => <button onClick={() => onPick({ src: 'images/cards/picked.jpg' })}>Pick test image</button> }))
const create = vi.mocked(api.createCard)
const clip = vi.mocked(api.addClip)
const change = (label: string, value: string) => fireEvent.change(screen.getByLabelText(label), { target: { value } })
function fill() {
  change('Stable ID', 'my-card'); change('Romanization', 'test'); change('Hangul', '테스트')
  for (const l of ['EN', 'DE', 'ES']) change(`Name (${l})`, `name ${l}`)
}
function save() { fireEvent.click(screen.getByRole('button', { name: 'Create card' })) }
beforeEach(() => {
  useAppStore.setState({ lang: 'en' })
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', '') }) })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: vi.fn() })
  create.mockImplementation(async (entry) => ({ ok: true, entry }))
  clip.mockResolvedValue({ ok: true, clip: { cardId: 'my-card', videoId: 'azqXl4ys3WY', start: 0, end: 5 } })
  vi.mocked(api.saveCard).mockResolvedValue({ ok: true, override: {} })
})
afterEach(() => vi.clearAllMocks())
describe('CreateCard', () => {
  it('maximizes a native modal, focuses close and restores the opener without writes on Escape', () => {
    const trigger = document.createElement('button'); document.body.append(trigger); trigger.focus()
    const close = vi.fn()
    const { unmount } = render(<CreateCard onClose={close} />)
    const dialog = screen.getByRole('dialog', { name: 'New card' })
    expect(dialog.tagName).toBe('DIALOG')
    expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalledOnce()
    expect(dialog).toHaveClass('h-[100dvh]', 'w-screen', 'max-w-none')
    expect(screen.getByRole('button', { name: 'Close' })).toHaveFocus()
    expect(screen.getByLabelText('Stable ID').closest('[data-editor-body]')).toHaveClass('overflow-y-auto')
    fireEvent(dialog, new Event('cancel', { cancelable: true }))
    expect(close).toHaveBeenCalledOnce(); expect(create).not.toHaveBeenCalled()
    unmount(); expect(trigger).toHaveFocus(); trigger.remove()
  })
  it.each(['hand', 'foot', 'stance', 'combo'])('creates %s with exact schema, languages, parts and exam Kup', async (category) => {
    render(<CreateCard onClose={() => {}} />); fill()
    change('Type', category); change('Word brick IDs (in order, repeats allowed)', 'ap ap chagi'); change('Exam level', '8')
    save()
    await screen.findByText(/Card saved: my-card/)
    expect(create).toHaveBeenCalledExactlyOnceWith({ id: 'my-card', kind: 'technique', category, ko: 'test', hangul: '테스트', kup: 8, parts: ['ap', 'ap', 'chagi'], names: { en: 'name EN', de: 'name DE', es: 'name ES' }, karate: '—' })
    expect(clip).not.toHaveBeenCalled(); expect(screen.getByRole('button', { name: 'Reload catalogue' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Create card' })).not.toBeInTheDocument()
  })
  it.each(['morpheme', 'term', 'taegeuk', 'hyong', 'yudanja'])('preserves type-specific %s fields, never sends fields from another type', async (type) => {
    render(<CreateCard onClose={() => {}} />); fill(); change('Type', type)
    for (const l of ['EN', 'DE', 'ES']) change(`Meaning (${l})`, `meaning ${l}`)
    if (['taegeuk', 'hyong', 'yudanja'].includes(type)) {
      change('Moves', '24')
      for (const l of ['EN', 'DE', 'ES']) change(`Symbol (${l})`, `symbol ${l}`)
      if (type === 'taegeuk') { change('Kukkiwon romanization', 'Taegeuk'); change('Course Keup (optional)', '7') }
      else { change('Exam level', '0'); change('Exam Dan (optional)', '2'); change('Source (optional)', 'Manual') }
    } else change('Group', type === 'term' ? 'training' : 'direction')
    if (type === 'morpheme') change('Family', 'in-out')
    save(); await screen.findByText(/Card saved: my-card/)
    const entry = create.mock.calls[0][0]
    expect(entry).not.toHaveProperty('names'); expect(entry).not.toHaveProperty('parts'); expect(entry).not.toHaveProperty('category')
    expect(entry).toMatchObject({ kind: ['morpheme', 'term'].includes(type) ? type : 'form', meaning: { en: 'meaning EN', de: 'meaning DE', es: 'meaning ES' } })
    if (type === 'morpheme') expect(entry).toMatchObject({ family: 'in-out', group: 'direction' })
    else if (type === 'term') expect(entry).toMatchObject({ group: 'training' })
    else expect(entry).toMatchObject({ system: type, moves: 24, symbol: { en: 'symbol EN', de: 'symbol DE', es: 'symbol ES' }, ...(type === 'taegeuk' ? { kukkiwon: 'Taegeuk', courseKeup: 7 } : { kup: 0, examDan: 2, source: 'Manual' }) })
  })
  it.each(['Card id already exists', 'Invalid parts', 'Invalid names', 'Invalid kup'])('retains draft and does not attach media after server rejection: %s', async (error) => {
    create.mockRejectedValueOnce(new Error(error))
    render(<CreateCard onClose={() => {}} />); fill(); save()
    expect(await screen.findByRole('alert')).toHaveTextContent(error)
    expect(screen.getByLabelText('Stable ID')).toHaveValue('my-card')
    expect(screen.queryByText(/Card saved:/)).not.toBeInTheDocument(); expect(clip).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: 'Create card' })).toBeEnabled()
  })
  it('keeps a single create in flight and saves optional technique descriptions without losing languages', async () => {
    let finish!: () => void
    create.mockImplementationOnce((entry) => new Promise((resolve) => { finish = () => resolve({ ok: true, entry }) }))
    render(<CreateCard onClose={() => {}} />); fill()
    for (const l of ['EN', 'DE', 'ES']) change(`Description (optional; all languages if provided) (${l})`, `description ${l}`)
    save()
    expect(screen.getByRole('button', { name: 'Saving…' })).toBeDisabled()
    fireEvent.submit(screen.getByRole('button', { name: 'Saving…' }).closest('form')!)
    expect(create).toHaveBeenCalledOnce()
    finish(); await screen.findByText(/Card saved: my-card/)
    expect(create.mock.calls[0][0]).toMatchObject({ info: { en: 'description EN', de: 'description DE', es: 'description ES' } })
  })
  it.each([
    ['de', 'Neue Karte', 'Typ', 'Stabile ID', 'Prüfungsgrad', 'Karte erstellen'],
    ['es', 'Nueva tarjeta', 'Tipo', 'ID estable', 'Nivel de examen', 'Crear tarjeta'],
  ])('localizes primary creation controls in %s', (lang, title, type, id, level, action) => {
    useAppStore.setState({ lang: lang as 'de' | 'es' })
    render(<CreateCard onClose={() => {}} />)
    expect(screen.getByRole('dialog', { name: title })).toBeInTheDocument()
    expect(screen.getByLabelText(type)).toBeInTheDocument()
    expect(screen.getByLabelText(id)).toBeRequired()
    expect(screen.getByLabelText(level)).toHaveValue('10')
    expect(screen.getByRole('button', { name: action })).toBeInTheDocument()
  })
  it('validates media before creation and retries only media against returned stable ID on partial failure', async () => {
    clip.mockRejectedValueOnce(new Error('Clip rejected'))
    create.mockImplementationOnce(async (entry) => ({ ok: true, entry: { ...entry, id: 'returned-id' } }))
    render(<CreateCard onClose={() => {}} />); fill()
    change('Video URL (optional)', 'https://evil.test/x'); save()
    expect(await screen.findByRole('alert')).toHaveTextContent(/Invalid video/); expect(create).not.toHaveBeenCalled()
    change('Video URL (optional)', 'https://youtu.be/azqXl4ys3WY'); change('Clip end', '0'); save()
    expect(screen.getByRole('alert')).toHaveTextContent(/Invalid video/); expect(create).not.toHaveBeenCalled()
    change('Clip end', '5'); save()
    expect(await screen.findByRole('alert')).toHaveTextContent('Card saved; video was not saved. Clip rejected')
    expect(create).toHaveBeenCalledOnce(); expect(clip).toHaveBeenCalledExactlyOnceWith({ cardId: 'returned-id', url: 'https://youtu.be/azqXl4ys3WY', start: 0, end: 5 })
    fireEvent.click(screen.getByRole('button', { name: 'Retry video only' }))
    await waitFor(() => expect(clip).toHaveBeenCalledTimes(2))
    await screen.findByText('Video saved.')
    expect(create).toHaveBeenCalledOnce(); expect(screen.queryByRole('button', { name: 'Retry video only' })).not.toBeInTheDocument()
  })
  it('permits image picking only after record creation; image failure can retry without another create', async () => {
    vi.mocked(api.saveCard).mockRejectedValueOnce(new Error('Image rejected'))
    render(<CreateCard onClose={() => {}} />); fill()
    expect(screen.queryByRole('button', { name: 'Add image…' })).not.toBeInTheDocument()
    save(); await screen.findByText(/Card saved: my-card/)
    fireEvent.click(screen.getByRole('button', { name: 'Add image…' })); fireEvent.click(screen.getByRole('button', { name: 'Pick test image' }))
    fireEvent.click(screen.getByRole('button', { name: 'Save images' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Card saved; images were not saved. Image rejected')
    fireEvent.click(screen.getByRole('button', { name: 'Save images' }))
    await screen.findByText('Images saved.')
    expect(create).toHaveBeenCalledOnce(); expect(api.saveCard).toHaveBeenLastCalledWith('my-card', { images: [{ src: 'images/cards/picked.jpg' }] })
  })
})
