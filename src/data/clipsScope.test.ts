import { describe, expect, it } from 'vitest'
import { CLIPS } from './clips'

describe('self-defence compilation clips', () => {
  it('are only used by the self-defence chapters', () => {
    const wrong = CLIPS.filter((c) => c.source === 'selfdefense' && !c.cardId.startsWith('sd-'))
    expect(wrong).toEqual([])
  })
})
