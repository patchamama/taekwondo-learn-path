import { useState } from 'react'
import diagrams from '../../data/diagrams.json'
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

export const hasDiagram = (cardId: string) => cardId in BY_CARD

/** Floor-pattern diagram of a poomse (Wikimedia Commons, CC BY-SA 4.0) with its attribution. */
export function FormDiagram({ cardId }: { cardId: string }) {
  const { t } = useT()
  const [big, setBig] = useState(false)
  const d = BY_CARD[cardId]
  if (!d) return null
  const figure = (
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
  )
  if (big) return <MaximizeOverlay onClose={() => setBig(false)}>{figure}</MaximizeOverlay>
  return (
    <div className="mt-2 grid gap-1.5">
      <p className="text-sm font-semibold">{t('diagramTitle')}</p>
      {figure}
      <MaximizeButton onClick={() => setBig(true)} />
    </div>
  )
}
