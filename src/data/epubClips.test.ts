import { createHash } from 'node:crypto'
import { createElement } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { CARD_BY_ID } from './cards'
import { CLIPS, CLIPS_BY_CARD, embedUrl, videoIdFor } from './clips'
import { mockYouTube, teardownYouTube } from '../features/videos/playerTestUtils'
import { ClipViewer } from '../features/videos/ClipViewer'
import { buildVideoRounds } from '../features/videos/videoQuiz'
import { useAppStore } from '../shared/store/useAppStore'

const supplements = [
  ['ap-chagi', 'aKA3TgYmShY', 0, 5, 5],
  ['dollyo-chagi', 'bb7UIJJGcrw', 0, 18, 18],
  ['yop-chagi', 'pFWrNhumO5k', 0, 18, 18],
  ['naeryo-chagi', 'ZwAs2lOPlSE', 0, 3, 3],
  ['düt-chagi', 'kjyvvqcTHh0', 0, 11, 11],
  ['taeguk-1', 'MDrNXuqTeE0', 160, 240, 414],
  ['taeguk-2', 'TkMQSBanLUk', 160, 240, 339],
  ['taeguk-3', 'CxKala6GhsA', 160, 300, 449],
  ['taeguk-4', 'm5VPW-gRvAI', 170, 280, 418],
  ['taeguk-6', 'gzae5gZEgcU', 159, 309, 415],
  ['taeguk-7', 'F-kDzz1_oqQ', 230, 278, 507],
  ['taeguk-8', 'pxZQUm5SYjQ', 200, 248, 476],
  ['taeguk-5', 'qNpQpJLHyUg', 184, 226, 502],
] as const
const ids = new Set<string>(supplements.map(([, videoId]) => videoId))

afterEach(() => { teardownYouTube(); cleanup() })

describe('EPUB supplements through the public clip inventory', () => {
  it.each(supplements)('%s maps to its reviewed individual source and bounded excerpt', (cardId, videoId, start, end, duration) => {
    expect(CARD_BY_ID[cardId]).toBeDefined()
    const matches = CLIPS.filter((c) => c.cardId === cardId && c.videoId === videoId)
    expect(matches).toHaveLength(1)
    const clip = matches[0]
    expect(CLIPS_BY_CARD[cardId]).toContain(clip)
    expect(clip).toMatchObject({ source: 'external', start, end, similarity: 'similar', silentSafe: false })
    expect(clip.label).toMatch(/Korean Academy of Taekwondo.*English/)
    expect(clip.label).toMatch(cardId.startsWith('taeguk-') ? /instruction excerpt/ : /demo/)
    expect(start).toBeGreaterThanOrEqual(0)
    expect(end).toBeGreaterThan(start)
    expect(end).toBeLessThanOrEqual(duration)
    const url = new URL(embedUrl('de', clip))
    expect(url.pathname).toBe(`/embed/${videoId}`)
    expect(url.searchParams.get('start')).toBe(String(start))
    expect(url.searchParams.get('end')).toBe(String(end))
    expect(url.searchParams.has('list')).toBe(false)
  })

  it.each(supplements)('%s keeps its course default and exposes the supplement as a working source tab', (cardId, videoId) => {
    const platform = mockYouTube()
    useAppStore.setState({ lang: 'en', videoLang: 'auto' })
    const clips = CLIPS_BY_CARD[cardId]
    expect(clips[0].source).toBe('course')
    render(createElement(ClipViewer, { cardId, autoplay: false }))
    platform.ready()
    const courseTab = screen.getAllByRole('tab')[0]
    expect(courseTab).toHaveAttribute('aria-selected', 'true')
    const courseHost = document.querySelector(`[data-video-source="${videoIdFor(clips[0], 'es')}"]`)!
    const courseIframe = courseHost.querySelector('iframe')!
    expect(courseHost).not.toHaveAttribute('hidden')
    expect(new URL(courseIframe.src).pathname).toBe(`/embed/${videoIdFor(clips[0], 'es')}`)
    expect(platform.players[0].seekTo).toHaveBeenLastCalledWith(clips[0].start, true)
    expect(platform.players[0].playVideo).not.toHaveBeenCalled()
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', String(clips[0].end - clips[0].start))
    const added = clips.find((c) => c.videoId === videoId)!
    fireEvent.click(screen.getByRole('tab', { name: added.label }))
    platform.ready()
    expect(screen.getByRole('tab', { name: added.label })).toHaveAttribute('aria-selected', 'true')
    expect(courseTab).toHaveAttribute('aria-selected', 'false')
    expect(courseHost).toHaveAttribute('hidden')
    expect(platform.players[0].pauseVideo).toHaveBeenCalled()
    const addedHost = document.querySelector(`[data-video-source="${videoId}"]`)!
    expect(addedHost).not.toHaveAttribute('hidden')
    expect(new URL(addedHost.querySelector('iframe')!.src).pathname).toBe(`/embed/${videoId}`)
    expect(platform.players[1].seekTo).toHaveBeenLastCalledWith(added.start, true)
    expect(platform.players[1].playVideo).not.toHaveBeenCalled()
    expect(screen.getByRole('progressbar')).toHaveAttribute('max', String(added.end - added.start))
    fireEvent.click(courseTab)
    expect(courseTab).toHaveAttribute('aria-selected', 'true')
    expect(courseHost).not.toHaveAttribute('hidden')
    expect(courseHost.querySelector('iframe')).toBe(courseIframe)
    expect(addedHost).toHaveAttribute('hidden')
    expect(platform.players).toHaveLength(2)
  })

  it('appends thirteen reviewed sources while preserving the legacy forty and previously accepted twelve', () => {
    const external = CLIPS.filter((c) => c.source === 'external')
    expect(external).toHaveLength(54)
    const legacy = external.slice(0, 40).map((clip) =>
      Object.fromEntries(Object.entries(clip).filter(([key]) => key !== 'source')),
    )
    // Fixed pre-change inventory fingerprint: no dependency on Git history in tests.
    expect(createHash('sha256').update(JSON.stringify(legacy)).digest('hex'))
      .toBe('74b33300ab0c53e8b360e6539b7bcfaf76b30a9e5354fa139d233f1370fa8f9d')
    expect(external.slice(40, 53).map((c) => c.videoId)).toEqual(supplements.map(([, id]) => id))
    const previouslyAccepted = external.slice(0, 52).map((clip) =>
      Object.fromEntries(Object.entries(clip).filter(([key]) => key !== 'source')),
    )
    expect(createHash('sha256').update(JSON.stringify(previouslyAccepted)).digest('hex'))
      .toBe('1b89ff68374c15057d30d2526ee7c1060b28b7e5d05c67c14934f84e36667a83')
    expect(external[52].videoId).toBe('qNpQpJLHyUg')
    expect(external[53]).toMatchObject({ cardId: 'pyonhi-sogi', videoId: '5KJhsjbGupg' })
  })

  it('never offers a review-only source in the public silent video quiz', () => {
    expect(CLIPS.filter((c) => c.silentSafe).some((c) => ids.has(c.videoId ?? ''))).toBe(false)
    for (const rng of [() => 0, () => 0.5, () => 0.999]) {
      const rounds = buildVideoRounds(rng, CLIPS.length, (id) => supplements.some(([cardId]) => cardId === id))
      // The five kicks have safe course clips; the named form recordings do not.
      expect(rounds.map((round) => round.cardId).sort()).toEqual(
        supplements.slice(0, 5).map(([cardId]) => cardId).sort(),
      )
      for (const round of rounds) {
        expect(round.clip.silentSafe).toBe(true)
        expect(ids.has(round.clip.videoId ?? '')).toBe(false)
        expect(round.clip.source).toBe('course')
      }
    }
  })
})
