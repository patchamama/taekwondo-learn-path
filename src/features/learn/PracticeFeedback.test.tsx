import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CARD_BY_ID } from '../../data/cards'
import { MORPHEME_BY_ID } from '../../data/morphemes'
import { clipFor } from '../../shared/lib/speech'
import { useAppStore } from '../../shared/store/useAppStore'
import type { Lang } from '../../shared/i18n/types'
import { LessonPlayer } from './LessonPlayer'
import type { Exercise } from './exercises'
import { mockYouTube, teardownYouTube } from '../videos/playerTestUtils'

const options = ['macki', 'chagi', 'sogi', 'gubi']
const show = (exercises: Exercise[], onFinish = vi.fn()) =>
  render(<LessonPlayer exercises={exercises} beltColor="#fff" onFinish={onFinish} onExit={() => {}} />)

beforeEach(() => {
  useAppStore.setState({ lang: 'en', quizAutoCheck: true, quizResultMode: 'button', quizAutoContinue: false, hangulOnly: false })
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined)
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {})
})
afterEach(() => { teardownYouTube(); vi.restoreAllMocks() })

describe('listening result teaching', () => {
  for (const lang of ['en', 'de', 'es'] as Lang[]) {
    for (const type of ['listen', 'listenmeaning'] as const) {
      for (const ok of [true, false]) {
        it(`${lang} ${type} shows the correct Korean name and meaning after a ${ok ? 'right' : 'wrong'} answer`, () => {
          useAppStore.setState({ lang })
          show([{ type, cardId: 'macki', options }])
          const selected = CARD_BY_ID[ok ? 'macki' : 'chagi']
          fireEvent.click(screen.getByRole('button', { name: type === 'listen' ? selected.ko : selected.meaning[lang] }))
          const dialog = screen.getByRole('dialog')
          expect(within(dialog).getByText(CARD_BY_ID.macki.meaning[lang], { exact: false })).toBeInTheDocument()
          expect(dialog).toHaveTextContent(CARD_BY_ID.macki.ko)
          expect(dialog).toHaveTextContent(CARD_BY_ID.macki.hangul)
        })
      }
    }
  }

  it('keeps recorded mp3 autoplay, replay and skip without scoring a skipped question', () => {
    const onFinish = vi.fn()
    show([{ type: 'listen', cardId: 'macki', options }], onFinish)
    const play = vi.mocked(HTMLMediaElement.prototype.play)
    expect(play).toHaveBeenCalledTimes(1)
    expect((play.mock.instances[0] as HTMLAudioElement).src).toContain(clipFor(CARD_BY_ID.macki.hangul))
    fireEvent.click(screen.getAllByRole('button', { name: `Listen: ${CARD_BY_ID.macki.hangul}` })[0])
    expect(play).toHaveBeenCalledTimes(2)
    fireEvent.click(screen.getByRole('button', { name: /can't listen/i }))
    expect(onFinish).toHaveBeenCalledWith({ correct: 0, total: 1, answers: [] })
  })
})

describe('word building hints', () => {
  const build: Exercise = { type: 'build', cardId: 'olgul-macki', chips: ['olgul', 'macki', 'chagi'] }
  it('conceals token meanings and Japanese equivalents until an explicit, keyboard-accessible hint is opened', () => {
    show([build])
    expect(screen.queryByText(MORPHEME_BY_ID.olgul.meaning.en)).not.toBeInTheDocument()
    expect(screen.queryByText(/JP /)).not.toBeInTheDocument()
    const hint = screen.getByRole('button', { name: 'Hint: olgul' })
    expect(hint).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(hint)
    expect(hint).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(MORPHEME_BY_ID.olgul.meaning.en)).toBeInTheDocument()
    expect(screen.queryByText(MORPHEME_BY_ID.chagi.meaning.en)).not.toBeInTheDocument()
    expect(screen.getByTestId('build-answer')).toBeEmptyDOMElement()
    fireEvent.click(hint)
    expect(screen.queryByText(MORPHEME_BY_ID.olgul.meaning.en)).not.toBeInTheDocument()
  })

  it('resets hints between questions and keeps token selection, removal and scoring', () => {
    const onFinish = vi.fn()
    show([build, build], onFinish)
    fireEvent.click(screen.getByRole('button', { name: 'Hint: olgul' }))
    for (const part of ['olgul', 'macki']) fireEvent.click(screen.getByRole('button', { name: part }))
    fireEvent.click(within(screen.getByTestId('build-answer')).getByRole('button', { name: 'macki' }))
    expect(screen.getByRole('button', { name: 'Check' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'macki' }))
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByRole('button', { name: 'Hint: olgul' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getByTestId('build-answer')).toBeEmptyDOMElement()
    expect(onFinish).not.toHaveBeenCalled()
  })
})

describe('frame question video', () => {
  it('opens an explicitly muted video without submitting an answer and closes it before the next question', () => {
    const frames: Exercise = { type: 'frames', cardId: 'ap-chagi', options: ['ap-chagi', 'yop-chagi'] }
    const platform = mockYouTube()
    show([frames, { type: 'meaning', cardId: 'macki', options }])
    expect(document.querySelector('[data-video-source]:not([hidden])')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Watch muted video' }))
    platform.ready()
    const host = document.querySelector('[data-video-source]:not([hidden])')
    expect(host?.querySelector('iframe')?.src).toContain('mute=1')
    const player = platform.players[0]
    expect(player.mute).toHaveBeenCalled()
    expect(player.playVideo).toHaveBeenCalled()
    player.pauseVideo.mockClear()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /ap chagi|ap-chagi/i, pressed: false })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: /ap chagi|ap-chagi/i, pressed: false }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(host).toHaveAttribute('hidden')
    expect(player.pauseVideo).toHaveBeenCalled()
    expect(document.querySelector('[data-video-source]:not([hidden])')).toBeNull()
  })
})

describe('tiger feedback', () => {
  it('varies localized praise and animation between right answers and uses a supportive wrong variant', () => {
    show([{ type: 'meaning', cardId: 'macki', options }, { type: 'meaning', cardId: 'macki', options }, { type: 'meaning', cardId: 'macki', options }])
    fireEvent.click(screen.getByRole('button', { name: CARD_BY_ID.macki.meaning.en }))
    const first = screen.getByRole('dialog').textContent
    const tiger = screen.getByTestId('feedback-tiger')
    expect(tiger.className).toContain('motion-safe:animate-bounce')
    expect(tiger.style.animationIterationCount).toBe('2')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: CARD_BY_ID.macki.meaning.en }))
    expect(screen.getByRole('dialog').textContent).not.toBe(first)
    expect(screen.getByTestId('feedback-tiger').className).toContain('motion-safe:animate-pulse')
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    fireEvent.click(screen.getByRole('button', { name: CARD_BY_ID.chagi.meaning.en }))
    expect(within(screen.getByRole('dialog')).getByRole('img')).toHaveAttribute('aria-label', 'Horangi the tiger (oops)')
    expect(screen.getByTestId('feedback-tiger').className).toContain('motion-safe:animate-pulse')
  })
})
