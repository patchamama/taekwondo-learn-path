import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { PasswordGate, isAccepted } from './PasswordGate'

describe('PasswordGate', () => {
  beforeEach(() => localStorage.clear())

  it('accepts only the two passwords, ignoring case and spaces', async () => {
    expect(await isAccepted('rayuela')).toBe(true)
    expect(await isAccepted(' Ho-Sin-Sul ')).toBe(true)
    expect(await isAccepted('other')).toBe(false)
  })

  it('hides the content until a right password is entered', async () => {
    render(
      <PasswordGate>
        <p>secret content</p>
      </PasswordGate>,
    )
    expect(screen.queryByText('secret content')).toBeNull()
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'nope' } })
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    expect(await screen.findByRole('alert')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText(/Password/), { target: { value: 'rayuela' } })
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))
    await waitFor(() => expect(screen.getByText('secret content')).toBeInTheDocument())
  })
})
