import { describe, expect, it } from 'vitest'
import { TECHNIQUES } from './techniques'

const info = (id: string) => TECHNIQUES.find((t) => t.id === id)?.info

describe('block movement direction', () => {
  it('states outside→inside for an-blocks in every language', () => {
    expect(info('momtong-an-macki')?.en).toContain('Movement: from outside to inside.')
    expect(info('momtong-an-macki')?.de).toContain('Bewegung: von außen nach innen.')
    expect(info('momtong-an-macki')?.es).toContain('Movimiento: de afuera hacia adentro.')
  })

  it('states inside→outside for packat-blocks', () => {
    for (const id of ['momtong-packat-macki', 'momtong-hansonnal-packat-macki']) {
      expect(info(id)?.es).toContain('Movimiento: de adentro hacia afuera.')
    }
  })

  it('adds nothing to blocks whose in/out direction is not known', () => {
    expect(info('arae-macki')?.en).not.toMatch(/Movement:/)
    expect(info('olgul-macki')?.en).not.toMatch(/Movement:/)
  })
})
