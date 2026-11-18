import { useState } from 'react'
import diagrams from '../../data/diagrams.json'
import bookImages from '../../data/bookFormImages.json'
import type { Loc } from '../i18n/types'
import { useT } from '../i18n/useT'
import { MaximizeButton, MaximizeOverlay } from './Maximize'

interface Diagram {
  cardId: string
  file: string
  title: string
  author: string
  licence: string
  licenceUrl: string
  page: string
}

const BY_CARD: Record<string, Diagram> = Object.fromEntries(
  (diagrams as Diagram[]).map((d) => [d.cardId, d]),
)

interface BookImage {
  file: string
  title: string
  author: string
  bookTitle: string
  copyright: string
  caption: Loc
  alt: Loc
}

const BOOK_BY_CARD: Readonly<Record<string, BookImage>> = bookImages
const BOOK_LABELS = {
  title: {
    en: 'Supplemental book reference',
    de: 'Ergänzende Buchreferenz',
    es: 'Referencia complementaria del libro',
  },
  permission: {
    en: 'Used with owner-confirmed permission',
    de: 'Mit vom Eigentümer bestätigter Erlaubnis verwendet',
    es: 'Utilizado con permiso confirmado por el propietario',
  },
}

export const hasDiagram = (cardId: string) => cardId in BY_CARD || cardId in BOOK_BY_CARD

/** Existing Commons floor patterns plus separately attributed supplemental book imagery. */
export function FormDiagram({ cardId }: { cardId: string }) {
  const { t, loc } = useT()
  const [big, setBig] = useState(false)
  const d = BY_CARD[cardId]
  const book = BOOK_BY_CARD[cardId]
  if (!d && !book) return null
  const figure = (
    <>
      {d && (
        <>
          <p className="text-sm font-semibold">{t('diagramTitle')}</p>
          <figure className="grid gap-1">
            <img
              src={`${import.meta.env.BASE_URL}${d.file}`}
              alt={`${t('diagramAlt')}: ${d.title}`}
              loading="lazy"
              className="w-full rounded-md border bg-white"
            />
            <figcaption className="text-xs text-slate-600">
              {t('diagramCredit')}:{' '}
              <a className="underline" href={d.page} target="_blank" rel="noreferrer">
                {d.title}
              </a>{' '}
              – {d.author.replace(/\s*\(.*$/, '')},{' '}
              <a className="underline" href={d.licenceUrl} target="_blank" rel="noreferrer">
                {d.licence}
              </a>{' '}
              (Wikimedia Commons)
            </figcaption>
          </figure>
        </>
      )}
      {book && (
        <>
          <p className="text-sm font-semibold">{loc(BOOK_LABELS.title)}</p>
          <figure className="grid gap-1">
            <img
              src={`${import.meta.env.BASE_URL}${book.file}`}
              alt={loc(book.alt)}
              width={624}
              height={832}
              loading="lazy"
              className="h-auto w-full rounded-md border bg-white"
            />
            <figcaption className="text-xs text-slate-600">
              {loc(book.caption)}{' '}
              {book.author} – <cite>{book.bookTitle}</cite>. {book.copyright}{' '}
              {loc(BOOK_LABELS.permission)}.
            </figcaption>
          </figure>
        </>
      )}
    </>
  )
  if (big) return <MaximizeOverlay onClose={() => setBig(false)}>{figure}</MaximizeOverlay>
  return (
    <div className="mt-2 grid gap-1.5">
      {figure}
      <MaximizeButton onClick={() => setBig(true)} />
    </div>
  )
}
