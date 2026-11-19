import { useId } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import type { Loc } from '../../shared/i18n/types'
import { useT } from '../../shared/i18n/useT'

const TITLE: Loc = {
  en: 'Open this site on another device',
  es: 'Abre este sitio en otro dispositivo',
  de: 'Diese Website auf einem anderen Gerät öffnen',
}
const LABEL: Loc = {
  en: 'QR code for this site',
  es: 'Código QR de este sitio',
  de: 'QR-Code für diese Website',
}
const HINT: Loc = {
  en: 'Scan the code or open the link below.',
  es: 'Escanea el código o abre el enlace de abajo.',
  de: 'Scanne den Code oder öffne den Link unten.',
}

/** Share the deployment entry point, not the current HashRouter route or query. */
export function siteUrl(origin: string, base: string): string {
  const url = new URL(base, `${new URL(origin).origin}/`)
  url.hash = ''
  url.search = ''
  return url.href
}

export function SiteQrCode() {
  const { loc } = useT()
  const titleId = useId()
  const url = siteUrl(window.location.origin, import.meta.env.BASE_URL)
  return (
    <section aria-labelledby={titleId} className="min-w-0 rounded-xl border bg-white p-5">
      <h2 id={titleId} className="text-lg font-bold">{loc(TITLE)}</h2>
      <p className="mt-2 text-sm text-slate-600">{loc(HINT)}</p>
      <QRCodeSVG
        value={url}
        size={192}
        level="M"
        marginSize={4}
        bgColor="#FFFFFF"
        fgColor="#000000"
        role="img"
        aria-label={loc(LABEL)}
        title={loc(LABEL)}
        className="mx-auto my-4 h-auto max-w-full"
      />
      <a className="block break-all text-sm text-sky-800 underline focus-visible:outline-2 focus-visible:outline-offset-2" href={url}>
        {url}
      </a>
    </section>
  )
}
