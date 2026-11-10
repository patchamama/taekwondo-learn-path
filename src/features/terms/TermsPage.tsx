import { TERMS, type TermGroup } from '../../data/terms'
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
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-bold">{t('navTerms')}</h1>
      {GROUPS.map((g) => (
        <div key={g.id}>
          <h2 className="mb-2 text-lg font-semibold">{t(g.key)}</h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {TERMS.filter((x) => x.group === g.id && visibleCard(x.id)).map((x) => (
              <li
                key={x.id}
                className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 shadow-sm"
              >
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
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  )
}
