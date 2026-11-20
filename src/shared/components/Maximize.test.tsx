import { useState } from 'react'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '../store/useAppStore'
import { MaximizeButton, MaximizeOverlay } from './Maximize'
import { ClipViewer } from '../../features/videos/ClipViewer'
import { FrameStrip } from '../../features/videos/FrameStrip'
import { FormDiagram } from './FormDiagram'

function Example({ controls = false }: { controls?: boolean }) {
  const [open, setOpen] = useState(false)
  const [extra, setExtra] = useState(false)
  return (
    <>
      <button>Turtle speed</button>
      {open ? (
        <MaximizeOverlay onClose={() => setOpen(false)}>
          <img alt="Technique" src="/technique.jpg" />
          <a href="https://example.org">Attribution</a>
          {controls && (
            <>
              <button onClick={() => setExtra(!extra)}>Change source</button>
              <button disabled>Disabled</button>
              <div hidden><button>Hidden</button></div>
              <div style={{ display: 'none' }}><button>Not displayed</button></div>
              <div style={{ visibility: 'hidden' }}><button>Not visible</button></div>
              <div inert><button>Inert</button></div>
              <button tabIndex={-1}>Not tabbable</button>
              {extra && <button>Replay</button>}
            </>
          )}
        </MaximizeOverlay>
      ) : <MaximizeButton onClick={() => setOpen(true)} />}
    </>
  )
}

async function openExample(controls = false) {
  const user = userEvent.setup()
  render(<Example controls={controls} />)
  await user.click(screen.getByRole('button', { name: /Maximize/ }))
  return user
}

describe('Maximize public modal keyboard contract', () => {
  beforeEach(() => useAppStore.setState({ lang: 'en' }))

  it('keeps Shift+Tab from Close inside the modal, not on the background turtle control', async () => {
    const user = await openExample()
    expect(screen.getByRole('button', { name: /Close/ })).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('link', { name: 'Attribution' })).toHaveFocus()
    expect(screen.getByRole('button', { name: 'Turtle speed' })).not.toHaveFocus()
  })

  it('wraps forward Tab from the last enabled visible control to Close', async () => {
    const user = await openExample(true)
    await user.tab()
    expect(screen.getByRole('link')).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Change source' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /Close/ })).toHaveFocus()
  })

  it('recomputes controls after a source changes and preserves attribution', async () => {
    const user = await openExample(true)
    await user.click(screen.getByRole('button', { name: 'Change source' }))
    await user.tab()
    expect(screen.getByRole('button', { name: 'Replay' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /Close/ })).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Replay' })).toHaveFocus()
    expect(screen.getByRole('link')).toHaveAttribute('href', 'https://example.org')
  })

  it('Escape returns focus to the remounted trigger and does not trap Tab when closed', async () => {
    const user = await openExample()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Maximize/ })).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: 'Turtle speed' })).toHaveFocus()
  })

  it('preserves explicit close and the existing non-closing backdrop behavior', async () => {
    const user = await openExample()
    await user.click(screen.getByRole('dialog'))
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true')
    await user.click(screen.getByRole('button', { name: /Close/ }))
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Maximize/ })).toHaveFocus()
  })

  it('contains focus for image-only FrameStrip with just Close', async () => {
    const user = userEvent.setup()
    render(<FrameStrip clip={{ cardId: 'ap-chagi', source: 'course', start: 1200, end: 1235 }} />)
    await user.click(screen.getByRole('button', { name: /Maximize/ }))
    expect(screen.getAllByRole('img')).toHaveLength(6)
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: /Close/ })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /Close/ })).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /Maximize/ })).toHaveFocus()
  })

  it('uses the dialog as fallback when no enabled controls remain', async () => {
    const user = await openExample()
    screen.getByRole('button', { name: /Close/ }).setAttribute('disabled', '')
    screen.getByRole('link').setAttribute('tabindex', '-1')
    await user.tab()
    expect(screen.getByRole('dialog')).toHaveFocus()
    await user.tab({ shift: true })
    expect(screen.getByRole('dialog')).toHaveFocus()
  })

  it('restores a still-mounted opener for direct overlay consumers', async () => {
    const user = userEvent.setup()
    const view = render(<button>Open externally</button>)
    await user.click(screen.getByRole('button'))
    view.rerender(<><button>Open externally</button><MaximizeOverlay onClose={() => {}}>Image</MaximizeOverlay></>)
    expect(screen.getByRole('button', { name: /Close/ })).toHaveFocus()
    view.rerender(<button>Open externally</button>)
    expect(screen.getByRole('button')).toHaveFocus()
  })

  it('keeps FormDiagram image and attribution links in the modal cycle', async () => {
    const user = userEvent.setup()
    render(<FormDiagram cardId="taeguk-1" />)
    await user.click(screen.getByRole('button', { name: /Maximize/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getAllByRole('img').length).toBeGreaterThan(0)
    const links = within(dialog).getAllByRole('link')
    await user.tab({ shift: true })
    expect(links.at(-1)).toHaveFocus()
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /Maximize/ })).toHaveFocus()
  })

  it('keeps ClipViewer source tabs, iframe and replay within the host modal cycle', async () => {
    const user = userEvent.setup()
    render(<ClipViewer cardId="ap-chagi" autoplay={false} />)
    await user.click(screen.getByRole('button', { name: /Maximize/ }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getAllByRole('tab').length).toBeGreaterThan(1)
    expect(dialog.querySelector('iframe')).not.toBeNull()
    await user.tab({ shift: true })
    expect(screen.getByRole('button', { name: /Replay/ })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: /Close/ })).toHaveFocus()
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.getByRole('button', { name: /Maximize/ })).toHaveFocus()
  })
})
