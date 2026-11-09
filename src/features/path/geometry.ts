export interface Pt {
  x: number
  y: number
}

export const VIEW_W = 640
export const VIEW_H = 1560

/** Winding road waypoints from bottom (start) to top (black belt). */
export function beltPoints(count: number): Pt[] {
  const top = 150
  const bottom = VIEW_H - 140
  const step = (bottom - top) / (count - 1)
  return Array.from({ length: count }, (_, i) => ({
    x: VIEW_W / 2 + Math.sin(i * 1.15) * 190,
    y: bottom - i * step,
  }))
}

/** Smooth cubic path through the points (vertical tangents give a winding road). */
export function roadPath(pts: Pt[]): string {
  return pts.reduce((d, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = pts[i - 1]
    const my = (prev.y + p.y) / 2
    return `${d} C ${prev.x} ${my}, ${p.x} ${my}, ${p.x} ${p.y}`
  }, '')
}
