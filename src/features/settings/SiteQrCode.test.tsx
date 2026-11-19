import { act, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { QRCodeSVG } from 'qrcode.react'
import { beforeEach, expect, it, vi } from 'vitest'
import { useAppStore } from '../../shared/store/useAppStore'
import { SiteQrCode, siteUrl } from './SiteQrCode'

beforeEach(() => useAppStore.setState({ lang: 'en' }))

it.each(['/', '/taekwondo-learn-path/'])('constructs the deployment URL for base %s without settings hashes or queries', (base) => {
  expect(siteUrl('https://example.org/settings?debug=1#/settings', base)).toBe(`https://example.org${base}`)
})

it('renders the actual local library QR encoding the visible base-aware URL with a four-module quiet zone', () => {
  vi.stubEnv('BASE_URL', '/taekwondo-learn-path/')
  try {
    render(<SiteQrCode />)
    const url = `${window.location.origin}/taekwondo-learn-path/`
    expect(screen.getByRole('link', { name: url })).toHaveAttribute('href', url)
    const qr = screen.getByRole('img', { name: 'QR code for this site' })
    expect(qr.tagName.toLowerCase()).toBe('svg')
    const expected = new DOMParser().parseFromString(renderToStaticMarkup(
      <QRCodeSVG value={url} size={192} level="M" marginSize={4} bgColor="#FFFFFF" fgColor="#000000" />,
    ), 'image/svg+xml')
    expect(qr.getAttribute('viewBox')).toBe(expected.documentElement.getAttribute('viewBox'))
    expect([...qr.querySelectorAll('path')].map((p) => [p.getAttribute('d'), p.getAttribute('fill')]))
      .toEqual([...expected.querySelectorAll('path')].map((p) => [p.getAttribute('d'), p.getAttribute('fill')]))
    expect(qr.querySelector('image')).toBeNull()
    expect(document.querySelector('canvas')).toBeNull()
  } finally {
    vi.unstubAllEnvs()
  }
})

it('updates all local QR labels live in English, Spanish and German without changing the URL', () => {
  render(<SiteQrCode />)
  const url = screen.getByRole('link').getAttribute('href')
  for (const [lang, heading, label, hint] of [
    ['en', 'Open this site on another device', 'QR code for this site', 'Scan the code or open the link below.'],
    ['es', 'Abre este sitio en otro dispositivo', 'Código QR de este sitio', 'Escanea el código o abre el enlace de abajo.'],
    ['de', 'Diese Website auf einem anderen Gerät öffnen', 'QR-Code für diese Website', 'Scanne den Code oder öffne den Link unten.'],
  ] as const) {
    act(() => useAppStore.getState().setLang(lang))
    expect(screen.getByRole('region', { name: heading })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: label })).toBeInTheDocument()
    expect(screen.getByText(hint)).toBeInTheDocument()
    expect(screen.getByRole('link')).toHaveAttribute('href', url)
  }
})
