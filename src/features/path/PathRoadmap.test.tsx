import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { BELTS } from '../../data/belts'
import { lessonsOfUnit } from '../../data/lessons'
import { PathRoadmap, trailPath, trailPoints } from './PathRoadmap'

const lessons = lessonsOfUnit('kup10')
const render1 = (completed: Record<string, number>) =>
  render(
    <MemoryRouter>
      <PathRoadmap
        sections={[{ id: 'kup10', belt: BELTS[0], title: 'Unit 1', lessons }]}
        completed={completed}
        strict={false}
        nextId={lessons[0].id}
      />
    </MemoryRouter>,
  )

describe('trail geometry', () => {
  it('has one point per lesson and a path through all of them', () => {
    const pts = trailPoints(4)
    expect(pts).toHaveLength(4)
    expect(pts[1].y).toBeGreaterThan(pts[0].y)
    expect(trailPath(pts).startsWith('M ')).toBe(true)
    expect(trailPath(pts).match(/C /g)).toHaveLength(3)
    expect(trailPath([])).toBe('')
  })
})

describe('PathRoadmap', () => {
  it('links open lessons and shows no progress trail at the start', () => {
    render1({})
    expect(screen.getAllByRole('link').length).toBe(lessons.length)
    expect(screen.queryByTestId('done-trail')).toBeNull()
  })

  it('draws the progress trail once lessons are done', () => {
    render1({ [lessons[0].id]: 3, [lessons[1].id]: 2 })
    expect(screen.getByTestId('done-trail')).toBeInTheDocument()
  })
})
