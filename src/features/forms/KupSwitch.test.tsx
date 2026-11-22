import { act, fireEvent, render, screen, within } from '@testing-library/react'
import { it, expect } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { FormsPage } from './FormsPage'

it('retains the forms page through all belt filter changes', () => {
  useAppStore.setState({ lang: 'en', cardView: 'details', maxBelt: 10, onlyBelt: null })
  render(<FormsPage />)
  for (let index = 0; index <= 10; index++) {
    act(() => { useAppStore.setState({ onlyBelt: index }) })
    expect(screen.getByRole('heading', { name: /Taegeuk/i })).toBeInTheDocument()
  }
})

it('retains the page when a visible video is unmounted by a belt change', () => {
  useAppStore.setState({ lang: 'en', cardView: 'details', maxBelt: 10, onlyBelt: null })
  render(<FormsPage />)
  const card = screen.getByText('Taeguk Il-Chang').closest('li')!
  fireEvent.click(within(card).getByRole('tab', { name: 'Course video' }))
  expect(within(card).getByLabelText('Clip: taeguk-1')).toBeInTheDocument()
  act(() => { useAppStore.setState({ onlyBelt: 0 }) })
  expect(screen.queryByText('Taeguk Il-Chang')).not.toBeInTheDocument()
  expect(screen.getByRole('heading', { name: /Taegeuk/i })).toBeInTheDocument()
})

it('shows preparatory drills with their videos in the correct Kup', () => {
  useAppStore.setState({ lang: 'en', cardView: 'details', maxBelt: 10, onlyBelt: 1 })
  render(<FormsPage />)
  const first = screen.getByText('saju-macki').closest('li')!
  expect(within(first).getByLabelText('Clip: saju-macki')).toBeInTheDocument()
  expect(screen.queryByText('saju-chirugi')).not.toBeInTheDocument()
  act(() => { useAppStore.setState({ onlyBelt: 2 }) })
  const second = screen.getByText('saju-chirugi').closest('li')!
  expect(within(second).getByLabelText('Clip: saju-chirugi')).toBeInTheDocument()
  expect(screen.queryByText('saju-macki')).not.toBeInTheDocument()
})
