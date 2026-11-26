import { useEffect, useRef, useState } from 'react'
import { CARD_BY_ID } from '../../data/cards'
import { cardBeltIndex } from '../../data/levels'
import { OVERRIDES, type CardImageOverride, type CardOverride } from '../../data/overrides'
import { useT } from '../../shared/i18n/useT'
import { useBelts } from '../../shared/store/useBelts'
import type { Loc } from '../../shared/i18n/types'
import { health, saveCard, setCardVisibility, translateWithAi, type Lang as AiLang } from './api'
import { ClipsEditor } from './ClipsEditor'
import { ImagePicker } from './ImagePicker'

const LANGS = ['en', 'de', 'es'] as const

const emptyLoc = (l?: Loc): Loc => ({ en: l?.en ?? '', de: l?.de ?? '', es: l?.es ?? '' })
const sameLoc = (a: Loc, b?: Loc) => LANGS.every((k) => a[k] === (b?.[k] ?? ''))
const url = (src: string) =>
  /^(https?:)?\/\//.test(src) || src.startsWith('/') ? src : import.meta.env.BASE_URL + src

/**
 * Edits one card (texts, Kup, images) and stores the changes in cardOverrides.json through the local backend.
 * Only the fields that differ from the card as it is now are written.
 */
export function CardEditor({
  cardId,
  onClose,
  onSaved = () => window.location.reload(),
}: {
  cardId: string
  onClose: () => void
  onSaved?: () => void
}) {
  const { t, loc } = useT()
  const text = (en: string, de: string, es: string) => loc({ en, de, es })
  const [confirmHide, setConfirmHide] = useState(false)
  const belts = useBelts()
  const card = CARD_BY_ID[cardId]
  const existing: CardOverride = OVERRIDES[cardId] ?? {}
  const currentKup = cardBeltIndex(cardId)

  const [ko, setKo] = useState(card.ko)
  const [hangul, setHangul] = useState(card.hangul)
  const [meaning, setMeaning] = useState<Loc>(emptyLoc(card.meaning))
  const [info, setInfo] = useState<Loc>(emptyLoc(card.info))
  const [kup, setKup] = useState(currentKup)
  const [images, setImages] = useState<CardImageOverride[]>(existing.images ?? [])
  const [picker, setPicker] = useState(false)
  const [state, setState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [error, setError] = useState('')
  const [ai, setAi] = useState<{ enabled: boolean; provider?: string; model?: string }>({
    enabled: false,
  })
  const [from, setFrom] = useState<AiLang>('en')
  const [translating, setTranslating] = useState(false)
  const [aiNote, setAiNote] = useState('')
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const opener = document.activeElement
    const dialog = dialogRef.current!
    // The native modal supplies top-layer rendering, background inertness and Tab containment.
    dialog.showModal()
    closeRef.current?.focus()
    return () => {
      dialog.close()
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus()
    }
  }, [])

  useEffect(() => {
    let alive = true
    health().then((h) => alive && setAi(h.ai))
    return () => {
      alive = false
    }
  }, [])

  const run = async (override: CardOverride) => {
    setState('saving')
    setError('')
    try {
      await saveCard(cardId, override)
      setState('saved')
      onSaved()
    } catch (e) {
      setError((e as Error).message)
      setState('idle')
    }
  }

  const hide = async () => {
    setState('saving')
    setError('')
    try {
      await setCardVisibility(cardId, true)
      setState('saved')
      onSaved()
    } catch (e) {
      setError((e as Error).message)
      setState('idle')
    }
  }

  const save = () => {
    const body: CardOverride = { ...existing }
    if (ko !== card.ko) body.ko = ko
    if (hangul !== card.hangul) body.hangul = hangul
    if (!sameLoc(meaning, card.meaning)) body.meaning = meaning
    if (!sameLoc(info, card.info)) body.info = info
    if (kup !== currentKup) body.kup = kup
    if (images.length > 0 || existing.images) body.images = images
    return run(body)
  }

  /** Fills the other languages from the chosen one with the configured model; the user reviews before saving. */
  const suggest = async () => {
    setTranslating(true)
    setError('')
    setAiNote('')
    const targets = LANGS.filter((l) => l !== from)
    const context = { ko, hangul }
    try {
      if (meaning[from].trim()) {
        const r = await translateWithAi({ from, targets, text: meaning[from], context })
        setMeaning((m) => ({ ...m, ...r.translations }))
      }
      if (info[from].trim()) {
        const r = await translateWithAi({ from, targets, text: info[from], context })
        setInfo((m) => ({ ...m, ...r.translations }))
      }
      setAiNote(
        t('aiNote').replace('{provider}', `${ai.provider}${ai.model ? ` (${ai.model})` : ''}`),
      )
    } catch (e) {
      setError((e as Error).message)
    }
    setTranslating(false)
  }

  const field = (label: string, value: string, set: (v: string) => void, multiline = false) => (
    <label className="grid min-w-0 gap-0.5 text-sm font-medium">
      {label}
      {multiline ? (
        <textarea
          className="min-h-16 min-w-0 w-full rounded border px-2 py-1 font-normal"
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      ) : (
        <input
          className="min-w-0 w-full rounded border px-2 py-1 font-normal"
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      )}
    </label>
  )

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-label={`${t('edEdit')}: ${card.ko}`}
      onCancel={(event) => {
        event.preventDefault()
        if (picker) setPicker(false)
        else onClose()
      }}
      className="fixed inset-0 m-auto h-[min(92dvh,52rem)] max-h-[92dvh] w-[min(96vw,66rem)] max-w-[96vw] overflow-hidden rounded-2xl border bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-black/50"
    >
      <div className="grid h-full min-h-0 w-full min-w-0 grid-rows-[auto_minmax(0,1fr)_auto]">
        <div className="flex items-center justify-between gap-3 border-b px-4 py-2 sm:px-5">
          <h2 className="min-w-0 break-words text-lg font-bold">
            {t('edEdit')}: {card.ko}
          </h2>
          <button
            type="button"
            ref={closeRef}
            aria-label={t('close')}
            onClick={onClose}
            className="h-10 w-10 shrink-0 rounded-full border focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600"
          >
            ✕
          </button>
        </div>

        <div
          data-editor-body
          className="grid min-h-0 min-w-0 content-start gap-4 overflow-x-hidden overflow-y-auto overscroll-contain p-4 sm:p-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-6 [&_input]:min-w-0 [&_input]:max-w-full [&_select]:min-w-0 [&_select]:max-w-full [&_textarea]:min-w-0 [&_textarea]:max-w-full"
        >
          <div className="grid min-w-0 content-start gap-4">
            <fieldset className="grid min-w-0 gap-3">
              <legend className="font-semibold text-slate-600">{t('edText')}</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {field(t('edRomanization'), ko, setKo)}
                {field('Hangul', hangul, setHangul)}
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {LANGS.map((l) =>
                  field(`${t('edMeaning')} (${l.toUpperCase()})`, meaning[l], (v) =>
                    setMeaning({ ...meaning, [l]: v }),
                  ),
                )}
              </div>
              {LANGS.map((l) =>
                field(
                  `${t('edDescription')} (${l.toUpperCase()})`,
                  info[l],
                  (v) => setInfo({ ...info, [l]: v }),
                  true,
                ),
              )}
            </fieldset>

            {ai.enabled && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-2 text-sm">
                <label className="flex items-center gap-1">
                  {t('aiFrom')}
                  <select
                    className="rounded border px-1 py-0.5"
                    value={from}
                    onChange={(e) => setFrom(e.target.value as AiLang)}
                  >
                    {LANGS.map((l) => (
                      <option key={l} value={l}>
                        {l.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  disabled={translating}
                  onClick={suggest}
                  className="rounded-lg border px-3 py-1 disabled:opacity-50"
                >
                  {translating ? t('aiWorking') : `✨ ${t('aiSuggest')}`}
                </button>
                {aiNote && <span className="text-xs text-slate-500">{aiNote}</span>}
              </div>
            )}
          </div>

          <div className="grid min-w-0 content-start gap-4">
            <label className="grid gap-0.5 text-sm font-medium">
              {t('edKup')}
              <select
                className="w-fit rounded border px-2 py-1 font-normal"
                value={kup}
                onChange={(e) => setKup(Number(e.target.value))}
              >
                {belts.map((b, i) => (
                  <option key={b.id} value={i}>
                    {b.rank}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="grid min-w-0 gap-2">
              <legend className="font-semibold text-slate-600">{t('edImages')}</legend>
              <div className="flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <figure key={`${img.src}-${i}`} className="grid w-24 gap-1 text-xs sm:w-28">
                    <img
                      src={url(img.src)}
                      alt={img.source ?? card.ko}
                      className="aspect-video max-h-20 w-full rounded border bg-black object-contain"
                    />
                    <figcaption className="truncate text-slate-500" title={img.source}>
                      {img.source}
                    </figcaption>
                    <button
                      type="button"
                      className="rounded border px-1"
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                    >
                      {t('edRemoveImage')}
                    </button>
                  </figure>
                ))}
              </div>
              <button
                type="button"
                className="w-fit rounded-lg border px-3 py-1 text-sm"
                onClick={() => setPicker(true)}
              >
                {t('edAddImage')}
              </button>
            </fieldset>

            <ClipsEditor cardId={cardId} onSaved={onSaved} />
          </div>

          {confirmHide && (
            <section role="alert" className="grid gap-2 rounded-lg border border-amber-600 p-3">
              <p>
                {text(
                  'Hiding is not deletion. Saved edits, media and references remain. Unsaved text changes are not saved. Unhide later using Hidden cards.',
                  'Ausblenden ist kein Löschen. Gespeicherte Änderungen, Medien und Referenzen bleiben. Ungespeicherte Texte werden nicht gespeichert. Unter Verborgene Karten wieder einblenden.',
                  'Ocultar no es eliminar. Ediciones guardadas, medios y referencias se conservan. Los textos sin guardar no se guardan. Puedes mostrarla desde Tarjetas ocultas.',
                )}
              </p>
              <button
                type="button"
                disabled={state !== 'idle'}
                onClick={hide}
                className="min-h-11 rounded border border-amber-700 px-3 py-2"
              >
                {text('Confirm hide', 'Ausblenden bestätigen', 'Confirmar ocultar')}
              </button>
              <button
                type="button"
                disabled={state !== 'idle'}
                onClick={() => setConfirmHide(false)}
                className="min-h-11 rounded border px-3 py-2"
              >
                {text('Keep visible', 'Sichtbar lassen', 'Mantener visible')}
              </button>
            </section>
          )}
          {error && (
            <p role="alert" className="text-sm text-red-700">
              {error}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 border-t bg-white px-4 py-2.5 sm:px-5">
          <button
            type="button"
            disabled={state !== 'idle'}
            onClick={save}
            className="rounded-lg bg-slate-900 px-4 py-2 text-white disabled:opacity-50"
          >
            {t('edSave')}
          </button>
          <button
            type="button"
            disabled={state !== 'idle'}
            onClick={() => run({})}
            className="text-sm underline"
          >
            {t('edReset')}
          </button>
          <button
            type="button"
            disabled={state !== 'idle'}
            onClick={() => setConfirmHide(true)}
            className="min-h-11 rounded border px-3 py-2 text-sm"
          >
            {text('Hide card', 'Karte ausblenden', 'Ocultar tarjeta')}
          </button>
          {state === 'saved' && <span className="text-sm text-emerald-700">{t('edSaved')}</span>}
        </div>
      </div>

      {picker && (
        <ImagePicker
          onClose={() => setPicker(false)}
          onPick={(img) => {
            setImages([...images, { src: img.src, source: img.source }])
            setPicker(false)
          }}
        />
      )}
    </dialog>
  )
}
