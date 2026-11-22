import { describe, expect, it } from 'vitest'
import type { PlaybackStep } from './audioPlan'
import {
  buildChapters,
  buildTimeline,
  chapterDurations,
  formatAudioTime,
  formatTime,
  stepAt,
} from './timeline'

const STEPS: PlaybackStep[] = [
  { file: 'audio/ko/a.mp3', role: 'ko', id: 'a' },
  { silence: 2 },
  { file: 'audio/es/a.mp3', role: 'meaning', id: 'a' },
  { silence: 1.5 },
  { file: 'audio/ko/b.mp3', role: 'ko', id: 'b' },
  { silence: 2 },
  { file: 'audio/es/b.mp3', role: 'meaning', id: 'b' },
  { silence: 1.5 },
  { file: 'audio/info-es/b.mp3', role: 'info', id: 'b' },
  { silence: 2 },
]

describe('buildTimeline', () => {
  it('uses the real clip durations and the planned silences', () => {
    const t = buildTimeline(STEPS, {
      'audio/ko/a.mp3': 0.5,
      'audio/es/a.mp3': 1,
      'audio/ko/b.mp3': 0.5,
      'audio/es/b.mp3': 1,
      'audio/info-es/b.mp3': 10,
    })
    expect(t.starts).toEqual([0, 0.5, 2.5, 3.5, 5, 5.5, 7.5, 8.5, 10, 20])
    expect(t.total).toBe(22)
  })

  it('falls back to a per-role estimate when a duration is unknown', () => {
    const t = buildTimeline(STEPS, {})
    expect(t.total).toBeGreaterThan(10)
    expect(t.starts[1]).toBeGreaterThan(0)
  })
})

describe('stepAt', () => {
  const t = buildTimeline(STEPS, {
    'audio/ko/a.mp3': 0.5,
    'audio/es/a.mp3': 1,
    'audio/ko/b.mp3': 0.5,
    'audio/es/b.mp3': 1,
    'audio/info-es/b.mp3': 10,
  })
  it('finds the step that contains a position', () => {
    expect(stepAt(t, 0)).toBe(0)
    expect(stepAt(t, 1)).toBe(1)
    expect(stepAt(t, 2.5)).toBe(2)
    expect(stepAt(t, 9)).toBe(7)
    expect(stepAt(t, 10)).toBe(8)
  })
  it('clamps to the ends', () => {
    expect(stepAt(t, -5)).toBe(0)
    expect(stepAt(t, 9999)).toBe(STEPS.length - 1)
  })
})

describe('buildChapters', () => {
  const section = (id: string) => (id === 'a' ? 'stance' : 'hand')
  it('starts a chapter at the first step of each section, and one for the descriptions', () => {
    expect(buildChapters(STEPS, section)).toEqual([
      { key: 'stance', stepIndex: 0 },
      { key: 'hand', stepIndex: 4 },
      { key: 'descriptions', stepIndex: 8 },
    ])
  })
})

describe('formatTime', () => {
  it('prints minutes and seconds', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(65.4)).toBe('1:05')
    expect(formatTime(3725)).toBe('62:05')
    expect(formatAudioTime(3725)).toBe('1:02:05')
    expect(formatAudioTime(3661)).toBe('1:01:01')
    expect(formatAudioTime(65.4)).toBe('1:05')
  })
})

describe('chapterDurations', () => {
  it('aggregates shuffled section visits and trailing pauses separately from descriptions', () => {
    const steps: PlaybackStep[] = [
      { file: 'foot-first', role: 'ko', id: 'foot' },
      { silence: 2 },
      { file: 'hand-meaning', role: 'meaning', id: 'hand' },
      { file: 'foot-next', role: 'ko', id: 'foot' },
      { file: 'hand-description', role: 'info', id: 'hand', pass: 'description' },
    ]
    const timeline = buildTimeline(steps, {
      'foot-first': 1,
      'hand-meaning': 3,
      'foot-next': 5,
      'hand-description': 3600,
    })
    expect(chapterDurations(steps, timeline, (id) => id)).toEqual({
      foot: 8,
      hand: 3,
      descriptions: 3600,
    })
  })
})
