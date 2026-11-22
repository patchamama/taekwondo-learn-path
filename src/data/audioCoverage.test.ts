import { existsSync, statSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { AUDIO_ITEMS, clipsOf } from './audioManifest'

describe('audio coverage', () => {
  it('every Korean word, meaning, Japanese term and description has a real mp3 in public/audio', () => {
    const bad: string[] = []
    for (const item of AUDIO_ITEMS) {
      for (const clip of clipsOf(item)) {
        const path = `public/${clip.file}`
        if (!existsSync(path) || statSync(path).size < 600) bad.push(clip.file)
      }
    }
    expect(bad).toEqual([])
  })
})
