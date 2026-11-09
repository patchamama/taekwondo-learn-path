import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { App } from './App'
import pkg from '../package.json'

describe('App', () => {
  it('shows the version from package.json in the banner', () => {
    render(<App />)
    expect(screen.getByTestId('version-banner')).toHaveTextContent(`v${pkg.version}`)
  })
})
