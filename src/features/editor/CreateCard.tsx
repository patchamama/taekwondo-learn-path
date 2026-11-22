import { useEffect, useRef, useState } from 'react'
import type { CustomCard } from '../../data/customCards'
import type { CardImageOverride } from '../../data/overrides'
import type { Loc } from '../../shared/i18n/types'
import { useT } from '../../shared/i18n/useT'
import { addClip, createCard, saveCard, videoIdFromUrl } from './api'
import { ImagePicker } from './ImagePicker'

type Technique = Extract<CustomCard, { kind: 'technique' }>
type Brick = Extract<CustomCard, { kind: 'morpheme' }>
type Term = Extract<CustomCard, { kind: 'term' }>
type Type = Technique['category'] | 'morpheme' | 'term' | 'taegeuk' | 'hyong' | 'yudanja'
const LANGS = ['en', 'de', 'es'] as const
const empty = (): Loc => ({ en: '', de: '', es: '' })
const control = 'min-w-0 rounded border px-3 py-2 font-normal'
const button = 'min-h-11 rounded-lg border px-3 py-2 disabled:opacity-50 focus-visible:outline-sky-600'

/** Record creation and media are separate transactions. Once created, this session never creates again. */
export function CreateCard({ onClose }: { onClose: () => void }) {
  const { t, loc } = useT()
  const text = (en: string, de: string, es: string) => loc({ en, de, es })
  const [type, setType] = useState<Type>('hand')
  const [id, setId] = useState('')
  const [ko, setKo] = useState('')
  const [hangul, setHangul] = useState('')
  const [kup, setKup] = useState(10)
  const [names, setNames] = useState(empty)
  const [meaning, setMeaning] = useState(empty)
  const [info, setInfo] = useState(empty)
  const [symbol, setSymbol] = useState(empty)
  const [parts, setParts] = useState('')
  const [karate, setKarate] = useState('—')
  const [brickGroup, setBrickGroup] = useState<Brick['group']>('action')
  const [family, setFamily] = useState<Brick['family']>('other')
  const [termGroup, setTermGroup] = useState<Term['group']>('basic')
  const [moves, setMoves] = useState('')
  const [kukkiwon, setKukkiwon] = useState('')
  const [courseKeup, setCourseKeup] = useState('')
  const [examDan, setExamDan] = useState('')
  const [source, setSource] = useState('')
  const [url, setUrl] = useState('')
  const [start, setStart] = useState(0)
  const [end, setEnd] = useState(5)
  const [created, setCreated] = useState<CustomCard | null>(null)
  const [videoSaved, setVideoSaved] = useState(false)
  const [imagesSaved, setImagesSaved] = useState(false)
  const [imagesEdited, setImagesEdited] = useState(false)
  const [images, setImages] = useState<CardImageOverride[]>([])
  const [picker, setPicker] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [discard, setDiscard] = useState(false)
  const pending = useRef(false)
  const dialog = useRef<HTMLDialogElement>(null)
  const close = useRef<HTMLButtonElement>(null)
  const technique = ['hand', 'foot', 'stance', 'combo'].includes(type)
  const form = ['taegeuk', 'hyong', 'yudanja'].includes(type)

  useEffect(() => {
    const opener = document.activeElement
    const node = dialog.current!
    node.showModal()
    close.current?.focus()
    return () => {
      node.close()
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [])

  const requestClose = () => {
    if (pending.current) return
    if (picker) { setPicker(false); return }
    if ((!created && (id || ko || hangul)) || imagesEdited) setDiscard(true)
    else onClose()
  }
  const attachVideo = async (cardId: string) => {
    await addClip({ cardId, url, start, end })
    setVideoSaved(true)
  }
  const submit = async () => {
    if (pending.current || created) return
    setError('')
    if (url && (!videoIdFromUrl(url) || !Number.isFinite(start) || !Number.isFinite(end) || start < 0 || end > 100000 || Math.round(end * 10) <= Math.round(start * 10))) {
      setError(text('Invalid video URL or clip range.', 'Ungültige Video-URL oder Clip-Zeiten.', 'URL de vídeo o tiempos de clip no válidos.'))
      return
    }
    const common = { id, ko, hangul, kup }
    let entry: CustomCard
    if (type === 'hand' || type === 'foot' || type === 'stance' || type === 'combo') {
      entry = { ...common, kind: 'technique', category: type, parts: parts.trim() ? parts.trim().split(/\s+/) : [], names, karate, ...(LANGS.some((l) => info[l].trim()) ? { info } : {}) }
    } else if (type === 'morpheme') entry = { ...common, kind: 'morpheme', group: brickGroup, family, meaning }
    else if (type === 'term') entry = { ...common, kind: 'term', group: termGroup, meaning }
    else if (type === 'taegeuk') entry = { ...common, kind: 'form', system: type, moves: Number(moves), kukkiwon, symbol, meaning, ...(courseKeup ? { courseKeup: Number(courseKeup) } : {}) }
    else entry = { ...common, kind: 'form', system: type, moves: Number(moves), symbol, meaning, ...(examDan ? { examDan: Number(examDan) } : {}), ...(source ? { source } : {}) }
    pending.current = true; setBusy(true)
    let saved: CustomCard | null = null
    try {
      const result = await createCard(entry)
      saved = result.entry
      setCreated(saved)
      if (url) await attachVideo(saved.id)
    } catch (e) {
      setError(`${saved ? text('Card saved; video was not saved. ', 'Karte gespeichert; Video nicht gespeichert. ', 'Tarjeta guardada; vídeo no guardado. ') : ''}${(e as Error).message}`)
    } finally { pending.current = false; setBusy(false) }
  }
  const retryVideo = async () => {
    if (!created || pending.current || videoSaved) return
    pending.current = true; setBusy(true); setError('')
    try { await attachVideo(created.id) }
    catch (e) { setError(text('Card saved; video was not saved. ', 'Karte gespeichert; Video nicht gespeichert. ', 'Tarjeta guardada; vídeo no guardado. ') + (e as Error).message) }
    finally { pending.current = false; setBusy(false) }
  }
  const saveImages = async () => {
    if (!created || pending.current) return
    pending.current = true; setBusy(true); setError('')
    try { await saveCard(created.id, { images }); setImagesSaved(true); setImagesEdited(false) }
    catch (e) { setError(text('Card saved; images were not saved. ', 'Karte gespeichert; Bilder nicht gespeichert. ', 'Tarjeta guardada; imágenes no guardadas. ') + (e as Error).message) }
    finally { pending.current = false; setBusy(false) }
  }
  const field = (label: string, value: string, set: (s: string) => void, required = true, maxLength = 200) => (
    <label key={label} className="grid min-w-0 gap-1 text-sm font-medium">{label}<input className={control} value={value} required={required} maxLength={maxLength} onChange={(e) => set(e.target.value)} /></label>
  )
  const localized = (label: string, value: Loc, set: (l: Loc) => void, required = true) => LANGS.map((l) => field(`${label} (${l.toUpperCase()})`, value[l], (v) => set({ ...value, [l]: v }), required, 4000))
  const select = (label: string, value: string, values: readonly string[], set: (v: string) => void) => (
    <label className="grid min-w-0 gap-1 text-sm font-medium">{label}<select className={control} value={value} onChange={(e) => set(e.target.value)}>{values.map((v) => <option key={v}>{v}</option>)}</select></label>
  )
  const number = (label: string, value: string, set: (v: string) => void, min: number, max: number, required = false) => (
    <label className="grid gap-1 text-sm font-medium">{label}<input type="number" className={control} value={value} min={min} max={max} step={1} required={required} onChange={(e) => set(e.target.value)} /></label>
  )
  const title = text('New card', 'Neue Karte', 'Nueva tarjeta')
  return <dialog ref={dialog} aria-modal="true" aria-label={title} onCancel={(e) => { e.preventDefault(); requestClose() }} className="fixed inset-0 m-0 h-[100dvh] max-h-none w-screen max-w-none overflow-hidden bg-white p-0 text-slate-900 backdrop:bg-black/40">
    <form className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)_auto]" onSubmit={(e) => { e.preventDefault(); void submit() }}>
      <header className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6"><h2 className="text-lg font-bold">{title}</h2><button ref={close} type="button" aria-label={t('close')} className={button} disabled={busy} onClick={requestClose}>✕</button></header>
      <div data-editor-body className="grid min-h-0 content-start gap-4 overflow-y-auto overscroll-contain p-4 sm:p-6">
        <p className="text-sm text-slate-600">{text('Local editor only. Create the card first, then save media. Reload to use catalogue changes.', 'Nur lokaler Editor. Erst Karte, dann Medien speichern. Katalogänderungen erfordern Neuladen.', 'Solo editor local. Crea la tarjeta primero y guarda los medios después. Recarga para usar los cambios del catálogo.')}</p>
        <fieldset disabled={busy || !!created} className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium">{text('Type', 'Typ', 'Tipo')}<select className={control} value={type} onChange={(e) => setType(e.target.value as Type)}>
            {(['hand', 'foot', 'stance', 'combo', 'taegeuk', 'hyong', 'yudanja', 'morpheme', 'term'] as const).map((value, i) => <option key={value} value={value}>{[text('Hand technique', 'Handtechnik', 'Técnica de mano'), text('Foot technique', 'Fußtechnik', 'Técnica de pie'), text('Stance', 'Stellung', 'Posición'), text('Combination', 'Kombination', 'Combinación'), 'Taegeuk', 'Hyong', 'Yudanja', text('Word brick', 'Wortbaustein', 'Ladrillo de palabras'), text('Term', 'Begriff', 'Término')][i]}</option>)}
          </select></label>
          {field(text('Stable ID', 'Stabile ID', 'ID estable'), id, setId, true, 80)}
          {field(t('edRomanization'), ko, setKo)}{field('Hangul', hangul, setHangul)}
          <label className="grid gap-1 text-sm font-medium">{text('Exam level', 'Prüfungsgrad', 'Nivel de examen')}<select className={control} value={kup} onChange={(e) => setKup(Number(e.target.value))}>{Array.from({ length: 11 }, (_, i) => 10 - i).map((n) => <option key={n} value={n}>{n ? `${n} Kup` : '1 Dan (0)'}</option>)}</select></label>
          {technique && <>
            {field(text('Word brick IDs (in order, repeats allowed)', 'Wortbaustein-IDs (geordnet, Wiederholungen erlaubt)', 'IDs de ladrillos (en orden, permite repeticiones)'), parts, setParts, false, 2400)}
            <p className="text-sm text-slate-600 sm:col-span-2">{text('Separate IDs with spaces. Referenced bricks must already exist; create new bricks first. Hidden bricks remain valid references.', 'IDs mit Leerzeichen trennen. Bausteine zuerst erstellen. Verborgene Bausteine bleiben gültige Referenzen.', 'Separa IDs con espacios. Los ladrillos deben existir; crea los nuevos primero. Los ocultos siguen siendo referencias válidas.')}</p>
            {field(text('Karate equivalent', 'Karate-Entsprechung', 'Equivalente en karate'), karate, setKarate)}
            {localized(text('Name', 'Name', 'Nombre'), names, setNames)}
            {localized(text('Description (optional; all languages if provided)', 'Beschreibung (optional; dann alle Sprachen)', 'Descripción (opcional; todos los idiomas si se incluye)'), info, setInfo, false)}
          </>}
          {type === 'morpheme' && <>{select(text('Group', 'Gruppe', 'Grupo'), brickGroup, ['action', 'zone', 'direction', 'tool'], (v) => setBrickGroup(v as Brick['group']))}{select(text('Family', 'Familie', 'Familia'), family, ['height', 'direction-axis', 'in-out', 'motion', 'action', 'stance', 'tool', 'target', 'reinforce', 'count', 'other'], (v) => setFamily(v as Brick['family']))}</>}
          {type === 'term' && select(text('Group', 'Gruppe', 'Grupo'), termGroup, ['sino', 'native', 'command', 'basic', 'training', 'body', 'kukkiwon'], (v) => setTermGroup(v as Term['group']))}
          {!technique && localized(t('edMeaning'), meaning, setMeaning)}
          {form && <>{number(text('Moves', 'Bewegungen', 'Movimientos'), moves, setMoves, 1, 1000, true)}{localized(text('Symbol', 'Symbol', 'Símbolo'), symbol, setSymbol)}
            {type === 'taegeuk' ? <>{field(text('Kukkiwon romanization', 'Kukkiwon-Umschrift', 'Romanización Kukkiwon'), kukkiwon, setKukkiwon)}{number(text('Course Keup (optional)', 'Kurs-Keup (optional)', 'Keup del curso (opcional)'), courseKeup, setCourseKeup, 1, 10)}</> : <>
              {number(text('Exam Dan (optional)', 'Prüfungs-Dan (optional)', 'Dan de examen (opcional)'), examDan, setExamDan, 1, 9)}
              <p className="text-sm text-slate-600">{text('Exam Dan requires exam level 0 (Dan).', 'Prüfungs-Dan erfordert Prüfungsgrad 0 (Dan).', 'Dan de examen requiere nivel de examen 0 (Dan).')}</p>
              {field(text('Source (optional)', 'Quelle (optional)', 'Fuente (opcional)'), source, setSource, false, 1000)}
            </>}
          </>}
        </fieldset>
        <fieldset disabled={busy || !!created} className="grid gap-3 rounded-lg border p-3 sm:grid-cols-2"><legend>{text('Video / clip', 'Video / Clip', 'Vídeo / clip')}</legend>
          {field(text('Video URL (optional)', 'Video-URL (optional)', 'URL de vídeo (opcional)'), url, setUrl, false, 2000)}
          <p className="text-sm text-slate-600">{text('HTTPS YouTube only. Seconds, 0–100000; end must follow start after rounding to tenths. No download or frame generation.', 'Nur HTTPS-YouTube. Sekunden, 0–100000; Ende muss nach Rundung nach Start liegen. Kein Download, keine Bilderzeugung.', 'Solo YouTube HTTPS. Segundos, 0–100000; fin posterior al inicio tras redondeo a décimas. Sin descarga ni generación de fotogramas.')}</p>
          {(['start', 'end'] as const).map((edge) => <label key={edge} className="grid gap-1 text-sm">{edge === 'start' ? text('Clip start', 'Clip-Anfang', 'Inicio del clip') : text('Clip end', 'Clip-Ende', 'Fin del clip')}<input type="number" className={control} step={0.1} min={0} max={100000} value={Number.isNaN(edge === 'start' ? start : end) ? '' : edge === 'start' ? start : end} onChange={(e) => (edge === 'start' ? setStart : setEnd)(e.target.valueAsNumber)} /></label>)}
        </fieldset>
        {created && <section className="grid gap-3 rounded-lg border border-emerald-700 p-3">
          <p role="status">{text('Card saved: ', 'Karte gespeichert: ', 'Tarjeta guardada: ')}{created.id}</p>
          <p>{text('Reload the catalogue after media saves. Production requires rebuilding/redeploying the data.', 'Nach dem Medienspeichern den Katalog neu laden. Produktion erfordert einen neuen Build/Deploy.', 'Recarga el catálogo después de guardar los medios. Producción requiere recompilar y desplegar los datos.')}</p>
          {url && !videoSaved && <button type="button" className={button} disabled={busy} onClick={retryVideo}>{text('Retry video only', 'Nur Video erneut speichern', 'Reintentar solo vídeo')}</button>}
          {videoSaved && <p role="status">{text('Video saved.', 'Video gespeichert.', 'Vídeo guardado.')}</p>}
          <button type="button" className={button} disabled={busy} onClick={() => setPicker(true)}>{t('edAddImage')}</button>
          {images.map((image, i) => <div key={`${image.src}-${i}`} className="flex flex-wrap items-center gap-2"><span className="min-w-0 break-all text-sm">{image.source ?? image.src}</span><button type="button" className={button} disabled={busy} onClick={() => { setImages(images.filter((_, n) => i !== n)); setImagesSaved(false); setImagesEdited(true) }}>{t('edRemoveImage')}</button></div>)}
          {imagesEdited && <button type="button" className={button} disabled={busy} onClick={saveImages}>{text('Save images', 'Bilder speichern', 'Guardar imágenes')}</button>}
          {imagesSaved && <p role="status">{text('Images saved.', 'Bilder gespeichert.', 'Imágenes guardadas.')}</p>}
        </section>}
        {error && <p role="alert" className="text-red-700">{error}</p>}
        {discard && <section role="alert" className="grid gap-2 rounded border border-amber-600 p-3"><p>{text('Close and discard unsaved input? Already saved records and media remain.', 'Schließen und ungespeicherte Eingaben verwerfen? Gespeicherte Daten bleiben erhalten.', '¿Cerrar y descartar datos sin guardar? Los registros y medios guardados se conservan.')}</p><button type="button" className={button} onClick={onClose}>{text('Discard unsaved input', 'Ungespeicherte Eingaben verwerfen', 'Descartar datos sin guardar')}</button><button type="button" className={button} onClick={() => setDiscard(false)}>{text('Continue editing', 'Weiter bearbeiten', 'Seguir editando')}</button></section>}
      </div>
      <footer className="flex flex-wrap gap-3 border-t bg-white px-4 py-3 sm:px-6">{!created ? <button type="submit" className={`${button} bg-slate-900 text-white`} disabled={busy}>{busy ? text('Saving…', 'Speichern…', 'Guardando…') : text('Create card', 'Karte erstellen', 'Crear tarjeta')}</button> : <button type="button" className={button} disabled={busy} onClick={() => window.location.reload()}>{text('Reload catalogue', 'Katalog neu laden', 'Recargar catálogo')}</button>}</footer>
    </form>
    {picker && created && <ImagePicker onClose={() => setPicker(false)} onPick={(image) => { setImages((old) => [...old, image]); setImagesSaved(false); setImagesEdited(true); setPicker(false) }} />}
  </dialog>
}
