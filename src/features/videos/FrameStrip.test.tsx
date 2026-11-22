import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FRAMES_PER_CLIP, type Clip } from '../../data/clips'
import { FrameStrip, frameSrc } from './FrameStrip'

const clip: Clip = { cardId: 'ap-chagi', source: 'course', start: 1, end: 2 }

describe('FrameStrip', () => {
  it('renders the frames in order', () => {
    render(<FrameStrip clip={clip} />)
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(FRAMES_PER_CLIP)
    expect(imgs[0]).toHaveAttribute('src', frameSrc(clip, 1))
    expect(imgs[FRAMES_PER_CLIP - 1]).toHaveAttribute('src', frameSrc(clip, FRAMES_PER_CLIP))
  })

  it('separates frames by source and encodes ids with special characters', () => {
    expect(frameSrc({ ...clip, cardId: 'düt-gubi' }, 2)).toContain(
      'frames/course/d%C3%BCt-gubi/2.jpg',
    )
    expect(frameSrc({ ...clip, source: 'selfdefense' }, 1)).toContain(
      'frames/selfdefense/ap-chagi/1.jpg',
    )
    expect(frameSrc({ ...clip, source: 'external', videoId: 'xyz' }, 1)).toContain(
      'frames/ext-xyz/ap-chagi/1.jpg',
    )
  })

  it('shows a hint when a frame fails to load', () => {
    render(<FrameStrip clip={clip} />)
    fireEvent.error(screen.getAllByRole('img')[0])
    expect(screen.getByText(/npm run frames/)).toBeInTheDocument()
  })

  it('stays silent in quiet mode', () => {
    const { container } = render(<FrameStrip clip={clip} quiet />)
    fireEvent.error(screen.getAllByRole('img')[0])
    expect(container).toBeEmptyDOMElement()
  })
})

it('maximizes the selected frame rather than another frame', () => {
  render(<FrameStrip clip={clip} />)
  fireEvent.click(screen.getAllByRole('img')[2])
  expect(screen.getByRole('dialog').querySelector('img')).toHaveAttribute('src', frameSrc(clip, 3))
  fireEvent.keyDown(window, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})

it('does not open another dialog for a frame inside an existing maximized view', () => {
  render(<div role="dialog"><FrameStrip clip={clip} maximizable={false} /></div>)
  fireEvent.click(screen.getAllByRole('img')[1])
  expect(screen.getAllByRole('dialog')).toHaveLength(1)
})
