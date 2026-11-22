import { fireEvent, render, screen, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ExportBar } from './ExportBar'
import { downloadMarkdown, downloadWord, printPdf } from '../../features/export/download'
import { useAppStore } from '../store/useAppStore'
import { BackgroundPage } from '../../features/background/BackgroundPage'
import { ExamPage } from '../../features/exam/ExamPage'
import { HistoryPage } from '../../features/history/HistoryPage'
import { STRINGS } from '../i18n/strings'

vi.mock('../../features/export/download', () => ({
  downloadMarkdown: vi.fn(), downloadWord: vi.fn(), printPdf: vi.fn(() => true),
}))

beforeEach(() => {
  vi.clearAllMocks()
  useAppStore.setState({ lang: 'en' })
})

const doc = { title: 'Reading', blocks: [] }

describe('ExportBar', () => {
  it.each([
    ['Background', BackgroundPage, STRINGS.bgTitle.en],
    ['Exam', ExamPage, STRINGS.examTitle.en],
    ['History', HistoryPage, STRINGS.koreaTitle.en],
  ] as const)('preserves the %s caller’s text buttons and document downloads', (_name, Page, title) => {
    render(<Page />)
    const group = screen.getByRole('group', { name: 'Export' })
    expect(within(group).queryByRole('combobox')).not.toBeInTheDocument()
    for (const format of ['Markdown', 'Word', 'PDF']) {
      const button = within(group).getByRole('button', { name: format })
      expect(button).toHaveTextContent(format)
      expect(button.querySelector('svg')).toBeNull()
      fireEvent.click(button)
    }
    const markdown = vi.mocked(downloadMarkdown).mock.calls[0][0]
    expect(markdown.title).toBe(title)
    expect(markdown.blocks.length).toBeGreaterThan(0)
    expect(downloadWord).toHaveBeenCalledExactlyOnceWith(markdown)
    expect(printPdf).toHaveBeenCalledExactlyOnceWith(markdown, 'en')
  })

  it('preserves the text buttons, label, document and PDF feedback for existing callers', () => {
    const build = vi.fn(() => doc)
    render(<ExportBar label="Background" build={build} />)
    const group = screen.getByRole('group', { name: 'Export · Background' })
    expect(within(group).queryByRole('combobox')).not.toBeInTheDocument()
    for (const name of ['Markdown', 'Word', 'PDF']) {
      expect(within(group).getByRole('button', { name })).toHaveTextContent(name)
      fireEvent.click(within(group).getByRole('button', { name }))
    }
    expect(build).toHaveBeenCalledTimes(3)
    expect(downloadMarkdown).toHaveBeenCalledExactlyOnceWith(doc)
    expect(downloadWord).toHaveBeenCalledExactlyOnceWith(doc)
    expect(printPdf).toHaveBeenCalledExactlyOnceWith(doc, 'en')
    expect(screen.getByRole('status')).toHaveTextContent(/Save as PDF/)
  })

  it('offers accessible, titled SVG file icons only when compact is requested', () => {
    render(<ExportBar build={() => doc} compact />)
    for (const name of ['Markdown', 'Word', 'PDF']) {
      const button = screen.getByRole('button', { name })
      expect(button).toHaveAttribute('title', name)
      expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
      expect(button).not.toHaveTextContent(name)
      fireEvent.click(button)
    }
    expect(downloadMarkdown).toHaveBeenCalledExactlyOnceWith(doc)
    expect(downloadWord).toHaveBeenCalledExactlyOnceWith(doc)
    expect(printPdf).toHaveBeenCalledExactlyOnceWith(doc, 'en')
  })

  it('keeps the popup-blocked feedback', () => {
    vi.mocked(printPdf).mockReturnValueOnce(false)
    render(<ExportBar build={() => doc} />)
    fireEvent.click(screen.getByRole('button', { name: 'PDF' }))
    expect(screen.getByRole('status')).toHaveTextContent(/pop-up/i)
  })
})
