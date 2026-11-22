import { useEffect, useRef, useState } from 'react'
import { CARD_BY_ID } from '../../data/cards'
import type { CustomCatalogue } from '../../data/customCards'
import { useT } from '../../shared/i18n/useT'
import { customCatalogue, setCardVisibility } from './api'
import { CreateCard } from './CreateCard'
import { useEditor } from './useEditor'

const button = 'min-h-11 rounded-lg border px-3 py-2 text-sm disabled:opacity-50 focus-visible:outline-sky-600'

/** The full lookup is intentional here: this is explicitly a hidden-record management view. */
function HiddenCards({ onClose }: { onClose: () => void }) {
  const { t, loc } = useT()
  const text = (en: string, de: string, es: string) => loc({ en, de, es })
  const [catalogue, setCatalogue] = useState<CustomCatalogue | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [changed, setChanged] = useState(false)
  const pending = useRef(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  const load = () => {
    setError('')
    return customCatalogue().then(setCatalogue).catch((e: Error) => setError(e.message))
  }
  useEffect(() => {
    const opener = document.activeElement
    const node = dialog.current!
    node.showModal(); close.current?.focus()
    let alive = true
    customCatalogue().then((value) => { if (alive) setCatalogue(value) }).catch((e: Error) => { if (alive) setError(e.message) })
    return () => { alive = false; node.close(); if (opener instanceof HTMLElement && opener.isConnected) opener.focus() }
  }, [])
  const unhide = async (id: string) => {
    if (pending.current) return
    pending.current = true; setBusy(true); setError('')
    try {
      await setCardVisibility(id, false)
      setCatalogue((value) => value && ({ ...value, hiddenIds: value.hiddenIds.filter((hidden) => hidden !== id) }))
      setChanged(true)
    } catch (e) { setError((e as Error).message) }
    finally { pending.current = false; setBusy(false) }
  }
  return <dialog ref={dialog} aria-modal="true" aria-label={text('Hidden cards', 'Verborgene Karten', 'Tarjetas ocultas')} onCancel={(e) => { e.preventDefault(); if (!pending.current) onClose() }} className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-hidden bg-white p-0 text-slate-900 backdrop:bg-black/40">
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]">
      <header className="flex items-center justify-between gap-3 border-b p-4"><h2 className="text-lg font-bold">{text('Hidden cards', 'Verborgene Karten', 'Tarjetas ocultas')}</h2><button ref={close} className={button} disabled={busy} aria-label={t('close')} onClick={onClose}>✕</button></header>
      <div className="grid min-h-0 content-start gap-3 overflow-y-auto p-4 sm:p-6">
        <p>{text('Hiding is not deletion. Records, saved edits, media and references remain. Unhide and reload to show a card again.', 'Ausblenden ist kein Löschen. Daten, Bearbeitungen, Medien und Referenzen bleiben. Wieder einblenden und neu laden.', 'Ocultar no es eliminar. Registros, ediciones, medios y referencias se conservan. Muestra y recarga para ver una tarjeta de nuevo.')}</p>
        {!catalogue && !error && <p role="status">{text('Loading hidden cards…', 'Verborgene Karten laden…', 'Cargando tarjetas ocultas…')}</p>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {!catalogue && error && <button className={button} onClick={load}>{text('Retry', 'Erneut versuchen', 'Reintentar')}</button>}
        {catalogue?.hiddenIds.length === 0 && <p>{text('No hidden cards.', 'Keine verborgenen Karten.', 'No hay tarjetas ocultas.')}</p>}
        {catalogue?.hiddenIds.map((id) => {
          const card = catalogue.entries.find((entry) => entry.id === id) ?? CARD_BY_ID[id]
          return <div key={id} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"><span className="min-w-0 break-words">{card?.ko ?? id} · {id}</span><button className={button} disabled={busy} onClick={() => unhide(id)}>{text('Unhide', 'Einblenden', 'Mostrar')} {card?.ko ?? id}</button></div>
        })}
      </div>
      <footer className="border-t p-4">{changed && <><p role="status">{text('Visibility saved. Reload to update catalogue listings.', 'Sichtbarkeit gespeichert. Kataloglisten neu laden.', 'Visibilidad guardada. Recarga para actualizar las listas.')}</p><button className={button} disabled={busy} onClick={() => window.location.reload()}>{text('Reload catalogue', 'Katalog neu laden', 'Recargar catálogo')}</button></>}</footer>
    </div>
  </dialog>
}

export function CatalogueEditor() {
  const on = useEditor()
  const { loc } = useT()
  const [view, setView] = useState<'create' | 'hidden' | null>(null)
  if (!on) return null
  return <>
    <button type="button" className={button} onClick={() => setView('create')}>{loc({ en: 'New card', de: 'Neue Karte', es: 'Nueva tarjeta' })}</button>
    <button type="button" className={button} onClick={() => setView('hidden')}>{loc({ en: 'Hidden cards', de: 'Verborgene Karten', es: 'Tarjetas ocultas' })}</button>
    {view === 'create' && <CreateCard onClose={() => setView(null)} />}
    {view === 'hidden' && <HiddenCards onClose={() => setView(null)} />}
  </>
}
