import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { CatalogueEditor } from './CatalogueEditor'
import * as api from './api'
import { useAppStore } from '../../shared/store/useAppStore'
vi.mock('./api', async (original) => ({ ...await original<typeof api>(), editorAvailable: vi.fn(), customCatalogue: vi.fn(), setCardVisibility: vi.fn() }))
beforeEach(() => {
  useAppStore.setState({ lang: 'en' })
  vi.mocked(api.editorAvailable).mockResolvedValue(true)
  vi.mocked(api.customCatalogue).mockResolvedValue({ entries: [], hiddenIds: ['basic-dojang'] })
  vi.mocked(api.setCardVisibility).mockResolvedValue({ ok: true, id: 'basic-dojang', hidden: false })
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: vi.fn(function (this: HTMLDialogElement) { this.setAttribute('open', '') }) })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: vi.fn() })
})
afterEach(() => vi.clearAllMocks())
it('has no entry or catalogue requests without local backend', async () => {
  vi.mocked(api.editorAvailable).mockResolvedValue(false)
  const { container } = render(<CatalogueEditor />)
  await waitFor(() => expect(api.editorAvailable).toHaveBeenCalled())
  expect(container).toBeEmptyDOMElement(); expect(api.customCatalogue).not.toHaveBeenCalled()
})
it('opens creation from global entry and restores focus on close', async () => {
  render(<CatalogueEditor />)
  const trigger = await screen.findByRole('button', { name: 'New card' }); trigger.focus(); fireEvent.click(trigger)
  expect(screen.getByRole('dialog', { name: 'New card' })).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument(); expect(trigger).toHaveFocus()
})
it('manages hidden records deliberately and unhides without touching saved edits; offers reload', async () => {
  vi.mocked(api.setCardVisibility).mockRejectedValueOnce(new Error('Visibility rejected'))
  render(<CatalogueEditor />)
  fireEvent.click(await screen.findByRole('button', { name: 'Hidden cards' }))
  const unhide = await screen.findByRole('button', { name: /Unhide.*dojang/ })
  fireEvent.click(unhide)
  expect(await screen.findByRole('alert')).toHaveTextContent('Visibility rejected')
  expect(unhide).toBeEnabled()
  fireEvent.click(unhide)
  await waitFor(() => expect(screen.queryByRole('button', { name: /Unhide.*dojang/ })).not.toBeInTheDocument())
  expect(api.setCardVisibility).toHaveBeenLastCalledWith('basic-dojang', false)
  expect(screen.getByText('No hidden cards.')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Reload catalogue' })).toBeInTheDocument()
})
