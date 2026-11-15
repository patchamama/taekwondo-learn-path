import { describe, expect, it } from 'vitest'
import { beltPoints, roadPath, VIEW_H } from './geometry'

describe('geometry', () => {
  it('places first point at bottom and last at top', () => {
    const pts = beltPoints(10)
    expect(pts).toHaveLength(10)
    expect(pts[0].y).toBeGreaterThan(pts[9].y)
    expect(pts[0].y).toBeLessThan(VIEW_H)
  })

  it('builds one move and n-1 curves', () => {
    const d = roadPath(beltPoints(10))
    expect(d.startsWith('M ')).toBe(true)
    expect(d.match(/C /g)).toHaveLength(9)
  })
})
