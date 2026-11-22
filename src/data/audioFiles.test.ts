import { describe, expect, it } from 'vitest'
import { audioFile } from './audioFiles'

describe('audioFile', () => {
  it('is deterministic and filesystem-safe', () => {
    expect(audioFile('ko', 'ap-chagi')).toBe(audioFile('ko', 'ap-chagi'))
    expect(audioFile('ko', 'ap-chagi')).toMatch(/^audio\/ko\/ap-chagi-[0-9a-f]{8}\.mp3$/)
    expect(audioFile('es', 'düt-gubi')).toMatch(/^audio\/es\/dut-gubi-[0-9a-f]{8}\.mp3$/)
    expect(audioFile('en', 'basic-kam sa hamnida')).toMatch(/^audio\/en\/basic-kam-sa-hamnida-[0-9a-f]{8}\.mp3$/)
  })

  it('keeps ids that only differ by accents or case apart', () => {
    expect(audioFile('ko', 'dut')).not.toBe(audioFile('ko', 'düt'))
  })

  it('separates tracks', () => {
    expect(audioFile('info-de', 'ap-chagi')).toContain('audio/info-de/')
  })
})
