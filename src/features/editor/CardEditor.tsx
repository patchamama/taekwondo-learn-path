import { useState } from 'react'
import { CARD_BY_ID } from '../../data/cards'
import { cardBeltIndex } from '../../data/levels'
import { OVERRIDES, type CardImageOverride, type CardOverride } from '../../data/overrides'
import { useT } from '../../shared/i18n/useT'
import { useBelts } from '../../shared/store/useBelts'
import type { Loc } from '../../shared/i18n/types'
import { saveCard } from './api'
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
  const { t } = useT()
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

  const field = (label: string, value: string, set: (v: string) => void, multiline = false) => (
    <label className="grid gap-0.5 text-sm font-medium">
      {label}
      {multiline ? (
        <textarea
          className="min-h-20 rounded border px-2 py-1 font-normal"
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      ) : (
        <input
          className="rounded border px-2 py-1 font-normal"
          value={value}
          onChange={(e) => set(e.target.value)}
        />
      )}
    </label>
  )

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-black/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${t('edEdit')}: ${card.ko}`}
        className="grid w-full max-w-2xl gap-4 rounded-2xl bg-white p-5 shadow-xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">
            {t('edEdit')}: {card.ko}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full border px-2"
          >
            ✕
          </button>
        </div>

        <fieldset className="grid gap-3">
          <legend className="font-semibold text-slate-600">{t('edText')}</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {field(t('edRomanization'), ko, setKo)}
            {field('Hangul', hangul, setHangul)}
          </div>
          {LANGS.map((l) =>
            field(`${t('edMeaning')} (${l.toUpperCase()})`, meaning[l], (v) =>
              setMeaning({ ...meaning, [l]: v }),
            ),
          )}
          {LANGS.map((l) =>
            field(
              `${t('edDescription')} (${l.toUpperCase()})`,
              info[l],
              (v) => setInfo({ ...info, [l]: v }),
              true,
            ),
          )}
        </fieldset>

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

        <fieldset className="grid gap-2">
          <legend className="font-semibold text-slate-600">{t('edImages')}</legend>
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <figure key={`${img.src}-${i}`} className="grid w-32 gap-1 text-xs">
                <img
                  src={url(img.src)}
                  alt={img.source ?? card.ko}
                  className="aspect-video w-full rounded border bg-black object-contain"
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

        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
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
    </div>
  )
}
