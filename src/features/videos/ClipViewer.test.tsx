import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { ClipViewer } from './ClipViewer'

describe('ClipViewer maximize', () => {
  beforeEach(() => useAppStore.setState({ lang: 'en' }))

  it('opens the clip in a full-window dialog and closes it with Escape', () => {
    render(<ClipViewer cardId="ap-chagi" autoplay={false} />)
    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Maximize/ }))
    const dialog = screen.getByRole('dialog')
    expect(dialog.querySelector('iframe')).not.toBeNull()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(screen.getByRole('button', { name: /Maximize/ })).toBeInTheDocument()
  })

  it('closes with the close button', () => {
    render(<ClipViewer cardId="ap-chagi" autoplay={false} />)
    fireEvent.click(screen.getByRole('button', { name: /Maximize/ }))
    fireEvent.click(screen.getByRole('button', { name: /Close/ }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })
})
