import { describe, expect, it } from 'vitest'
import { CLIPS } from '../../data/clips'
import { makeRng } from '../learn/exercises'
import { buildVideoRounds } from './videoQuiz'

describe('buildVideoRounds', () => {
  it('returns the requested number of rounds from clips only', () => {
    const rounds = buildVideoRounds(makeRng(1), 8)
    expect(rounds).toHaveLength(8)
    const ids = new Set(CLIPS.map((c) => c.cardId))
    for (const r of rounds) expect(ids.has(r.cardId)).toBe(true)
  })

  it('has 4 unique options containing the answer once', () => {
    for (const r of buildVideoRounds(makeRng(4), 15)) {
      expect(r.options).toHaveLength(4)
      expect(new Set(r.options).size).toBe(4)
      expect(r.options.filter((o) => o === r.cardId)).toHaveLength(1)
    }
  })

  it('does not repeat a technique within a game', () => {
    const rounds = buildVideoRounds(makeRng(2), 15)
    expect(new Set(rounds.map((r) => r.cardId)).size).toBe(rounds.length)
  })
})
