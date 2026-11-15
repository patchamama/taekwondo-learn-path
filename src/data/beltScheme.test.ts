import { describe, expect, it } from 'vitest'
import { BELTS } from './belts'
import { beltLook } from './beltScheme'

describe('belt colour schemes', () => {
  it('club keeps the belt data; traditional gives white, yellow, orange, green ... black', () => {
    for (const b of BELTS) expect(beltLook(b, 'club')).toBe(b)
    const name = (id: string) =>
      beltLook(
        BELTS.find((b) => b.id === id)!,
        'traditional',
      ).name.en
    expect(name('kup10')).toBe('White belt')
    expect(name('kup8')).toBe('Orange belt')
    expect(name('kup5')).toBe('Blue belt')
    expect(name('dan1')).toBe('Black belt')
  })

  it('never changes rank, id or availability', () => {
    for (const b of BELTS) {
      const l = beltLook(b, 'traditional')
      expect([l.id, l.rank, l.filled]).toEqual([b.id, b.rank, b.filled])
    }
  })
})
