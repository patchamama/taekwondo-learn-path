import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { FRAMES_PER_CLIP } from '../../data/clips'
import { FrameStrip, frameSrc } from './FrameStrip'

describe('FrameStrip', () => {
  it('renders the frames in order', () => {
    render(<FrameStrip cardId="ap-chagi" />)
    const imgs = screen.getAllByRole('img')
    expect(imgs).toHaveLength(FRAMES_PER_CLIP)
    expect(imgs[0]).toHaveAttribute('src', frameSrc('ap-chagi', 1))
    expect(imgs[FRAMES_PER_CLIP - 1]).toHaveAttribute('src', frameSrc('ap-chagi', FRAMES_PER_CLIP))
  })

  it('encodes ids with special characters', () => {
    expect(frameSrc('düt-gubi', 2)).toContain('d%C3%BCt-gubi/2.jpg')
  })

  it('shows a hint when a frame fails to load', () => {
    render(<FrameStrip cardId="x" />)
    fireEvent.error(screen.getAllByRole('img')[0])
    expect(screen.getByText(/npm run frames/)).toBeInTheDocument()
  })

  it('stays silent in quiet mode', () => {
    const { container } = render(<FrameStrip cardId="x" quiet />)
    fireEvent.error(screen.getAllByRole('img')[0])
    expect(container).toBeEmptyDOMElement()
  })
})
