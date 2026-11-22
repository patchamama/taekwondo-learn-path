import { useState } from 'react'
import { CardMediaActions } from '../../shared/components/CardMediaActions'
import { ClipViewer } from '../videos/ClipViewer'
import { EditButton } from '../editor/EditButton'
import { CardViewToggle } from '../../shared/components/CardViewToggle'
import { CardImages } from '../../shared/components/CardImages'
import { TERMS, type TermGroup } from '../../data/terms'
import { BeltBadge } from '../../shared/components/BeltBadge'
import { SpeakButton } from '../../shared/components/SpeakButton'
import type { StringKey } from '../../shared/i18n/strings'
import { useBeltFilter } from '../../shared/hooks/useBeltFilter'
import { useT } from '../../shared/i18n/useT'

const GROUPS: { id: TermGroup; key: StringKey }[] = [
  { id: 'basic', key: 'grpBasic' },
  { id: 'command', key: 'grpCommand' },
  { id: 'sino', key: 'grpSino' },
  { id: 'native', key: 'grpNative' },
  { id: 'training', key: 'grpTraining' },
  { id: 'body', key: 'grpBody' },
  { id: 'kukkiwon', key: 'grpKukkiwon' },
]

export function TermsPage() {
  const { t, loc } = useT()
  const { visibleCard } = useBeltFilter()
  const [playing, setPlaying] = useState<{ id: string; revision: number } | null>(null)
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-bold">{t('navTerms')}</h1>
      <CardViewToggle />
      {GROUPS.map((g) => (
        <div key={g.id}>
          <h2 className="mb-2 text-lg font-semibold">{t(g.key)}</h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TERMS.filter((x) => x.group === g.id && visibleCard(x.id)).map((x) => (
              <li
                key={x.id}
                className="relative grid gap-1 rounded-lg bg-white px-3 py-2 shadow-sm"
              >
                <div data-card-header className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <SpeakButton text={x.hangul} />
                  <div className="min-w-0">
                    <p className="truncate font-bold">
                      {x.ko}{' '}
                      <span lang="ko" className="font-normal text-slate-500">
                        {x.hangul}
                      </span>
                    </p>
                    <p className="truncate text-sm text-slate-600">{loc(x.meaning)}</p>
                  </div>
                </div>
                <span data-card-media-toolbar className="flex shrink-0 flex-wrap items-center justify-end gap-1">
                  <EditButton cardId={x.id} />
                  <CardMediaActions cardId={x.id} expanded={playing?.id === x.id} onOpen={() => setPlaying((old) => ({ id: x.id, revision: (old?.revision ?? 0) + 1 }))} />
                  <BeltBadge cardId={x.id} />
                </span>
                </div>
                <CardImages cardId={x.id} display="details" expanded={playing?.id === x.id} />
                {playing?.id === x.id && <div className="grid gap-2">
                  <button type="button" className="justify-self-start text-sm underline" onClick={() => setPlaying(null)}>{t('hide')}</button>
                  <ClipViewer key={playing.revision} cardId={x.id} autoplay />
                </div>}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
