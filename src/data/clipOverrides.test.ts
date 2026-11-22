import { afterEach, describe, expect, it, vi } from 'vitest'

async function load(overrides: Record<string, unknown>) {
  vi.resetModules()
  vi.doMock('./clipOverrides.json', () => ({ default: overrides }))
  return import('./clips')
}

afterEach(() => {
  vi.doUnmock('./clipOverrides.json')
  vi.resetModules()
})

describe('clip overrides', () => {
  it('removes built-in videos without deleting their catalogue identity or shifting other retimings', async () => {
    const { CLIPS_BY_CARD } = await load({
      'momtong-packat-macki': [{ index: 0, removed: true }],
      'ap-chagi': [{ index: 0, removed: true }, { index: 1, start: 12, end: 16 }],
    })
    expect(CLIPS_BY_CARD['momtong-packat-macki']).toBeUndefined()
    const remaining = CLIPS_BY_CARD['ap-chagi']
    expect(remaining.length).toBeGreaterThan(0)
    expect(remaining.every((clip) => clip.originalIndex !== 0)).toBe(true)
    expect(remaining[0]).toMatchObject({ originalIndex: 1, start: 12, end: 16 })
    expect(Object.keys(remaining[0])).not.toContain('originalIndex')
    expect(JSON.stringify(remaining[0])).not.toContain('originalIndex')
  })

  it('leave the clips as they are when there are none', async () => {
    const { CLIPS_BY_CARD } = await load({})
    expect(CLIPS_BY_CARD['ap-chagi'][0]).toMatchObject({ source: 'course', start: 1200, end: 1235 })
  })

  it('re-time one clip of a card without touching the others', async () => {
    const base = (await load({})).CLIPS_BY_CARD['ap-chagi']
    const { CLIPS_BY_CARD } = await load({ 'ap-chagi': [{ index: 0, start: 1203.5, end: 1230 }] })
    const edited = CLIPS_BY_CARD['ap-chagi']
    expect(edited[0]).toMatchObject({ start: 1203.5, end: 1230, source: 'course' })
    expect(edited.slice(1)).toEqual(base.slice(1))
    expect(edited).toHaveLength(base.length)
  })

  it('ignores an override of a clip that does not exist or has an invalid range', async () => {
    const base = (await load({})).CLIPS_BY_CARD['ap-chagi']
    const { CLIPS_BY_CARD } = await load({ 'ap-chagi': [{ index: 99, start: 1, end: 2 }, { index: 0, start: 50, end: 40 }] })
    expect(CLIPS_BY_CARD['ap-chagi']).toEqual(base)
  })
})
