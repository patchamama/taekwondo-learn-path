import { describe, expect, it } from 'vitest'
import { encodeMp3 } from './mp3'

describe('encodeMp3', () => {
  it('encodes mono samples into a valid, much smaller MP3 stream', () => {
    const rate = 16000
    const samples = new Float32Array(rate * 2).map(
      (_, i) => Math.sin((2 * Math.PI * 440 * i) / rate) * 0.5,
    )
    const mp3 = encodeMp3(samples, rate)
    expect(mp3.byteLength).toBeGreaterThan(500)
    expect(mp3.byteLength).toBeLessThan(samples.length * 2 * 0.3)
    const bytes = new Uint8Array(mp3)
    const hasSync = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0
    const hasId3 = bytes[0] === 0x49 && bytes[1] === 0x44 && bytes[2] === 0x33
    expect(hasSync || hasId3).toBe(true)
  })

  it('handles silence and clamps loud samples without throwing', () => {
    expect(() => encodeMp3(new Float32Array(16000), 16000)).not.toThrow()
    expect(() => encodeMp3(new Float32Array([5, -5, 5, -5]), 16000)).not.toThrow()
  })
})
