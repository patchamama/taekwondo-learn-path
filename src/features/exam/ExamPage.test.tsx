import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { EXAM_RULES } from '../../data/examRules'
import { KOREA_FACTS } from '../../data/koreaFacts'
import { useAppStore } from '../../shared/store/useAppStore'
import { ExamPage } from './ExamPage'

describe('ExamPage', () => {
  beforeEach(() => useAppStore.setState({ lang: 'en' }))

  it('shows the scoring bands and preparation times from the regulations', () => {
    render(<ExamPage />)
    expect(screen.getByRole('heading', { name: 'Scoring' })).toBeInTheDocument()
    expect(screen.getByText('5.6 – 6.0')).toBeInTheDocument()
    expect(screen.getByText('1 Dan (Cho-Dan)')).toBeInTheDocument()
  })

  it('has every text in three languages', () => {
    const all = [...EXAM_RULES, ...KOREA_FACTS]
    for (const s of all) {
      for (const l of [s.title, ...(s.bullets ?? []), ...(s.rows ?? []).map((r) => r.value)]) {
        expect(l.en && l.de && l.es, s.id).toBeTruthy()
      }
    }
  })
})
