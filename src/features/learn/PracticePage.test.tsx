import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CARD_BY_ID } from '../../data/cards'
import { CUSTOM_CARDS } from '../../data/customCards'
import { SECTION_BY_ID } from '../../data/audioManifest'
import { isVisible } from '../../data/visibility'

vi.mock('../../data/customCards.json', () => ({ default: {
  entries: [
    { id: 'custom-practice', kind: 'term', kup: 8, group: 'basic', ko: 'Custom', hangul: '도장', meaning: { en: 'Custom meaning', de: 'Eigener Begriff', es: 'Término propio' } },
    { id: 'hidden-practice', kind: 'term', kup: 8, group: 'basic', ko: 'Hidden', hangul: '도장', meaning: { en: 'Hidden', de: 'Versteckt', es: 'Oculto' } },
  ], hiddenIds: ['hidden-practice'],
} }))
import { LESSONS } from '../../data/lessons'
import { cardBeltIndex } from '../../data/levels'
import { useAppStore } from '../../shared/store/useAppStore'
import { BeltRangeSlider } from '../../shared/components/BeltRangeSlider'
import * as exercises from './exercises'
import { learnedCardIds } from './progress'
import { PracticePage } from './LessonPage'

const build = vi.spyOn(exercises, 'buildPractice')
const curriculum = [...new Set([...LESSONS.flatMap((lesson) => lesson.cardIds), ...CUSTOM_CARDS.map((c) => c.id)])].filter((id) => isVisible(id))
const open = () => render(<MemoryRouter><BeltRangeSlider /><PracticePage /></MemoryRouter>)

beforeEach(() => {
  build.mockClear()
  useAppStore.getState().reset()
  useAppStore.setState({ lang: 'en', maxBelt: 2, onlyBelt: null, listening: false, strictOrder: true, quizAutoCheck: false,
    quizMaxQuestions: 14,
    practiceSections: ['words', 'hand', 'foot', 'stance', 'combo', 'terms', 'forms'],
    practiceFormats: ['meaning', 'recall', 'listen', 'listenmeaning', 'frames', 'video', 'pickclip', 'build'],
  })
})

describe('Public free practice', () => {
  it('starts real questions without completed lessons while keeping progress helpers unchanged', () => {
    open()
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument()
    expect(build).toHaveBeenCalled()
    expect(build.mock.calls[0][0]).toEqual(curriculum.filter((id) => cardBeltIndex(id) <= 2))
    expect(build.mock.results[0].value.length).toBeGreaterThan(0)
    expect(learnedCardIds({})).toEqual([])
    expect(useAppStore.getState().completed).toEqual({})
  })

  it('updates the practice questions for single Kup and cumulative ranges, without navigation', () => {
    open()
    fireEvent.click(screen.getByRole('button', { name: '8 Kup' }))
    expect(screen.getByRole('slider')).toHaveValue('0')
    expect(build.mock.lastCall![0]).toEqual(curriculum.filter((id) => cardBeltIndex(id) === 2))
    expect(build.mock.results.at(-1)!.value.every((ex: exercises.Exercise) => 'cardId' in ex && cardBeltIndex(ex.cardId) === 2)).toBe(true)
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } })
    expect(build.mock.lastCall![0]).toEqual(curriculum.filter((id) => cardBeltIndex(id) <= 1))
    expect(build.mock.results.at(-1)!.value.every((ex: exercises.Exercise) => 'cardId' in ex && cardBeltIndex(ex.cardId) <= 1)).toBe(true)
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument()
    expect(useAppStore.getState().completed).toEqual({})
  })

  it('retains both belts in the cumulative pool while honoring build-only questions', () => {
    useAppStore.setState({ practiceFormats: ['build'], maxBelt: 10, onlyBelt: null, quizMaxQuestions: 40 })
    open()
    fireEvent.click(screen.getByRole('button', { name: '9 Kup' }))
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } })
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument()
    const questions = build.mock.results.at(-1)!.value as exercises.Exercise[]
    expect(new Set((build.mock.lastCall![0] as string[]).map(cardBeltIndex))).toEqual(new Set([0, 1]))
    // 10 Kup has vocabulary, but no compound technique names to assemble.
    expect(questions.length).toBeGreaterThan(0)
    expect(questions.every((ex) => 'cardId' in ex && cardBeltIndex(ex.cardId) <= 1)).toBe(true)
    expect(questions.every((ex) => ex.type === 'build')).toBe(true)
    expect(useAppStore.getState().practiceFormats).toEqual(['build'])
    expect(useAppStore.getState().completed).toEqual({})
    expect(useAppStore.getState().xp).toBe(0)
  })

  it('does not lose eligible 9 Kup questions behind 10 Kup vocabulary at the normal question limit', () => {
    useAppStore.setState({ practiceFormats: ['video'], maxBelt: 10, onlyBelt: null })
    open()
    fireEvent.click(screen.getByRole('button', { name: '9 Kup' }))
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument()
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } })
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument()
    const questions = build.mock.results.at(-1)!.value as exercises.Exercise[]
    expect(questions.length).toBeGreaterThan(0)
    expect(questions.every((ex) => ex.type === 'video' && cardBeltIndex(ex.cardId) <= 1)).toBe(true)
    expect(useAppStore.getState().practiceFormats).toEqual(['video'])
    expect(useAppStore.getState().completed).toEqual({})
    expect(useAppStore.getState().xp).toBe(0)
  })

  it('keeps the current session when mastery, completion or unrelated settings change', () => {
    useAppStore.setState({ mastery: { arae: 5 } })
    open()
    expect(build.mock.calls[0][1]).toEqual({ arae: 5 })
    const calls = build.mock.calls.length
    const question = screen.getByRole('button', { name: 'Check' })
    act(() => {
      useAppStore.getState().recordAnswer('arae', true)
      useAppStore.setState({ completed: { 'u1-actions': 3 }, strictOrder: false })
    })
    expect(build).toHaveBeenCalledTimes(calls)
    expect(screen.getByRole('button', { name: 'Check' })).toBe(question)
  })
})

describe('Unique actionable practice totals', () => {
  const selected = (sections: string[], max = 2) => curriculum.filter((id) => cardBeltIndex(id) <= max && sections.includes(SECTION_BY_ID[id]))
  const totals = (practiced: number, pending: number) => {
    expect(screen.getByRole('status')).toHaveTextContent(`Practised: ${practiced}`)
    expect(screen.getByRole('status')).toHaveTextContent(`Pending: ${pending}`)
  }

  it('counts unique eligible terms, including custom cards but not hidden cards, and follows sections and Kup', () => {
    const ids = selected(['words', 'terms'])
    useAppStore.setState({ practiceSections: ['words', 'terms'], practiceFormats: ['meaning', 'recall'], mastery: { [ids[0]]: 2, 'custom-practice': 1 } })
    open()
    totals(2, ids.length - 2)
    expect(build.mock.lastCall![0]).toContain('custom-practice')
    expect(build.mock.lastCall![0]).not.toContain('hidden-practice')
    fireEvent.click(screen.getByRole('button', { name: /Choose what to practise/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Word blocks' }))
    const terms = selected(['terms'])
    totals(terms.includes(ids[0]) ? 2 : 1, terms.length - (terms.includes(ids[0]) ? 2 : 1))
    fireEvent.click(screen.getByRole('button', { name: '8 Kup' }))
    const single = terms.filter((id) => cardBeltIndex(id) === 2)
    totals(1, single.length - 1)
  })

  it('covers every pending ID beyond the normal maximum without changing the setting or progress', () => {
    const ids = selected(['words'], 0)
    useAppStore.setState({ maxBelt: 0, practiceSections: ['words'], practiceFormats: ['meaning', 'recall'], quizMaxQuestions: 3, mastery: { [ids[0]]: 0, [ids[1]]: -2 } })
    open()
    expect(build.mock.results.at(-1)!.value).toHaveLength(3)
    expect(screen.getByRole('status')).toHaveTextContent(`Pending: ${ids.length - 2}`)
    totals(2, ids.length - 2)
    fireEvent.click(screen.getByRole('button', { name: 'Practise all pending' }))
    const questions = build.mock.results.at(-1)!.value as exercises.Exercise[]
    expect(new Set(questions.flatMap((ex) => 'cardId' in ex ? [ex.cardId] : []))).toEqual(new Set(ids.slice(2)))
    expect(questions.length).toBeGreaterThan(3)
    expect(useAppStore.getState().quizMaxQuestions).toBe(3)
    expect(useAppStore.getState().mastery).toEqual({ [ids[0]]: 0, [ids[1]]: -2 })
    expect(useAppStore.getState().xp).toBe(0)
    expect(useAppStore.getState().completed).toEqual({})
    const calls = build.mock.calls.length
    act(() => useAppStore.getState().recordAnswer(ids[2], false))
    totals(3, ids.length - 3)
    expect(build).toHaveBeenCalledTimes(calls)
  })

  it('disables bulk when every eligible term has been practised, even with zero mastery', () => {
    const ids = selected(['terms'])
    useAppStore.setState({ practiceSections: ['terms'], practiceFormats: ['meaning'], mastery: Object.fromEntries(ids.map((id) => [id, 0])) })
    open()
    totals(ids.length, 0)
    expect(screen.getByRole('button', { name: 'Practise all pending' })).toBeDisabled()
    expect(screen.getByText(/regardless of correctness, not mastered/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Check' })).toBeInTheDocument()
  })

  it('retains retry, answered counters and completion-time progress in a bulk session', () => {
    const ids = selected(['terms'])
    const mastery = Object.fromEntries(ids.filter((id) => id !== 'custom-practice').map((id) => [id, 1]))
    useAppStore.setState({ practiceSections: ['terms'], practiceFormats: ['meaning'], mastery, quizAutoCheck: false, quizResultMode: 'button', quizAutoContinue: false })
    open()
    totals(ids.length - 1, 1)
    fireEvent.click(screen.getByRole('button', { name: 'Practise all pending' }))
    const questions = build.mock.results.at(-1)!.value as exercises.Exercise[]
    expect(questions).toHaveLength(1)
    const ex = questions[0]
    if (ex.type !== 'meaning') throw new Error('Expected meaning question')
    const wrong = ex.options.find((id) => id !== ex.cardId)!
    fireEvent.click(screen.getByRole('button', { name: CARD_BY_ID[wrong].meaning.en }))
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    expect(screen.getByLabelText('question-counter')).toHaveTextContent('1/2')
    expect(useAppStore.getState().mastery).toEqual(mastery)
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(screen.getByLabelText('question-counter')).toHaveTextContent('2/2')
    fireEvent.click(screen.getByRole('button', { name: 'Custom meaning' }))
    fireEvent.click(screen.getByRole('button', { name: 'Check' }))
    fireEvent.click(screen.getByRole('button', { name: 'Continue' }))
    expect(useAppStore.getState().mastery).toEqual({ ...mastery, 'custom-practice': 1 })
    expect(useAppStore.getState().completed).toEqual({})
    expect(useAppStore.getState().xp).toBe(5)
    totals(ids.length, 0)
    expect(screen.getByRole('button', { name: 'Practise all pending' })).toBeDisabled()
  })

  it.each([
    ['de', 'Alles Ausstehende üben', 'Geübt', 'Ausstehend'],
    ['es', 'Practicar todo lo pendiente', 'Practicados', 'Pendientes'],
  ] as const)('localizes the totals and bulk action in %s', (lang, button, practiced, pending) => {
    useAppStore.setState({ lang })
    open()
    expect(screen.getByRole('button', { name: button })).toBeEnabled()
    expect(screen.getByRole('status')).toHaveTextContent(practiced)
    expect(screen.getByRole('status')).toHaveTextContent(pending)
  })

  it('excludes unsupported formats and explains why no pending practice can start', () => {
    useAppStore.setState({ practiceSections: ['terms'], practiceFormats: ['build'] })
    open()
    totals(0, 0)
    expect(screen.getByRole('button', { name: 'Practise all pending' })).toBeDisabled()
    expect(screen.getByText(/No terms support the selected formats/)).toBeInTheDocument()
  })
})

describe('Practice options panel', () => {
  const everySection = ['words', 'hand', 'foot', 'stance', 'combo', 'terms', 'forms']
  const everyFormat = ['meaning', 'recall', 'listen', 'listenmeaning', 'frames', 'video', 'pickclip', 'build']

  beforeEach(() => {
    useAppStore.setState({ practiceSections: everySection, practiceFormats: everyFormat, hangulOnly: false, clipLayout: 'row' })
  })

  const openPanel = () => fireEvent.click(screen.getByRole('button', { name: /Choose what to practise/ }))

  it('lists sections and formats as checkboxes, all on by default', () => {
    open()
    openPanel()
    for (const name of ['Word blocks', 'Hand', 'Foot', 'Stances', 'Combos', 'Korean terms', 'Forms']) {
      expect(screen.getByRole('checkbox', { name })).toBeChecked()
    }
    for (const name of [/Silent clip/, /choose the clip/, /Listen → meaning/, /Stills/]) {
      expect(screen.getByRole('checkbox', { name })).toBeChecked()
    }
  })

  it('restricts the questions to the chosen section and rebuilds the session', () => {
    open()
    openPanel()
    for (const name of ['Word blocks', 'Foot', 'Stances', 'Combos', 'Korean terms', 'Forms']) {
      fireEvent.click(screen.getByRole('checkbox', { name }))
    }
    expect(useAppStore.getState().practiceSections).toEqual(['hand'])
    const ids = build.mock.lastCall![0] as string[]
    expect(ids.length).toBeGreaterThan(0)
    expect(ids.every((id) => CARD_BY_ID[id].group.includes('hand'))).toBe(true)
  })

  it('passes the chosen formats to the question builder', () => {
    // Keep this options-wiring test independent of the size of the question pool.
    useAppStore.setState({ maxBelt: 0 })
    open()
    openPanel()
    const formats = within(screen.getByRole('group', { name: 'Question formats' }))
    for (const f of everyFormat) if (!['video', 'pickclip'].includes(f)) {
      const label = { meaning: /Korean → meaning/, recall: /Meaning → Korean/, listen: /Listen → Korean/, listenmeaning: /Listen → meaning/, frames: /Stills/, build: /word blocks/ }[f as 'meaning']
      fireEvent.click(formats.getByRole('checkbox', { name: label }))
    }
    expect(useAppStore.getState().practiceFormats.sort()).toEqual(['pickclip', 'video'])
    expect((build.mock.lastCall as unknown[])[5]).toEqual(expect.arrayContaining(['video', 'pickclip']))
  })

  it('has the hangul-only and clip-layout options', () => {
    open()
    openPanel()
    fireEvent.click(screen.getByRole('checkbox', { name: /hangul only/i }))
    expect(useAppStore.getState().hangulOnly).toBe(true)
    fireEvent.click(screen.getByRole('radio', { name: /several rows/i }))
    expect(useAppStore.getState().clipLayout).toBe('grid')
  })
})
