import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from './useAppStore'

describe('useAppStore', () => {
  beforeEach(() => useAppStore.getState().reset())

  it('toggles learned techniques', () => {
    useAppStore.getState().toggleLearned('ap-chagi')
    expect(useAppStore.getState().learned).toEqual(['ap-chagi'])
    useAppStore.getState().toggleLearned('ap-chagi')
    expect(useAppStore.getState().learned).toEqual([])
  })

  it('keeps the best star rating and adds xp when a lesson is completed again', () => {
    const s = useAppStore.getState()
    s.completeLesson('u1-dojang', 3, 10, '2026-11-09')
    s.completeLesson('u1-dojang', 1, 10, '2026-11-09')
    const st = useAppStore.getState()
    expect(st.completed['u1-dojang']).toBe(3)
    expect(st.xp).toBe(20)
    expect(st.streak).toEqual({ count: 1, last: '2026-11-09' })
  })

  it('tracks mastery and never goes below 0', () => {
    const s = useAppStore.getState()
    s.recordAnswer('macki', false)
    expect(useAppStore.getState().mastery.macki).toBe(0)
    s.recordAnswer('macki', true)
    s.recordAnswer('macki', true)
    expect(useAppStore.getState().mastery.macki).toBe(2)
  })
})
