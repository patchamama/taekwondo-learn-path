import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from './useAppStore'

describe('useAppStore', () => {
  beforeEach(() => useAppStore.getState().reset())

  it('clamps reached belt to valid range', () => {
    useAppStore.getState().reachBelt(99)
    expect(useAppStore.getState().currentBeltIndex).toBe(9)
    useAppStore.getState().reachBelt(-3)
    expect(useAppStore.getState().currentBeltIndex).toBe(0)
  })

  it('toggles learned techniques', () => {
    useAppStore.getState().toggleLearned('ap-chagi')
    expect(useAppStore.getState().learned).toEqual(['ap-chagi'])
    useAppStore.getState().toggleLearned('ap-chagi')
    expect(useAppStore.getState().learned).toEqual([])
  })
})
