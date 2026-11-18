import { describe, expect, it } from 'vitest'
import { THEORY_BY_ID } from './theory'
import { TIMELINE } from '../features/history/timeline'

const languages = ['en', 'de', 'es'] as const

describe('history quiz consistency', () => {
  it('asks about the naming proposal without implying immediate universal adoption', () => {
    expect(THEORY_BY_ID['th-year'].question.en).toContain('proposed')
    expect(THEORY_BY_ID['th-year'].question.de).toContain('vorgeschlagen')
    expect(THEORY_BY_ID['th-year'].question.es).toContain('propuso')
    for (const language of languages) {
      expect(THEORY_BY_ID['th-year'].correct[language]).toBe('1955')
      expect(TIMELINE.find((event) => event.year === '1955')?.text[language]).toContain('Taekwondo')
    }
  })

  it('preserves the history answer sets and concise localized prompts', () => {
    const answers: Record<string, string[]> = {
      'th-founder': ['General Choi Hong Hi', 'Gichin Funakoshi', 'Bruce Lee', 'Jigoro Kano'],
      'th-year': ['1955', '1945', '1966', '1988'],
      'th-itf': ['22 March 1966', '1 June 1955', '17 Sept 1988', '9 Nov 1918'],
      'th-hyong': ['Hyong / Tul', 'Poomse Taeguk', 'Palgwae', 'Yudanja'],
      'th-taeguk': ['8', '5', '9', '24'],
    }
    for (const [id, answerSet] of Object.entries(answers)) {
      const item = THEORY_BY_ID[id]
      expect([item.correct.en, ...item.wrong.map((answer) => answer.en)]).toEqual(answerSet)
      for (const language of languages) {
        expect(item.question[language].length).toBeLessThan(110)
        expect(item.wrong).toHaveLength(3)
      }
    }
    expect(TIMELINE.find((event) => event.year === '22 Mar 1966')?.text.en).toContain('Seoul')
  })
})
