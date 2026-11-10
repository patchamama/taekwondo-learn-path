import { CARD_BY_ID } from '../../data/cards'
import { FAMILIES, examplesFor, morphemesOfFamily } from '../../data/morphemeFamilies'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { useBeltFilter } from '../../shared/hooks/useBeltFilter'
import { useT } from '../../shared/i18n/useT'

/** Word building blocks grouped by what they do; hovering (or focusing) a word lists techniques that use it. */
export function MorphemeGroups() {
  const { t, loc } = useT()
  const { visibleCard } = useBeltFilter()
  return (
    <div className="grid gap-4">
      {FAMILIES.map((fam) => {
        const items = morphemesOfFamily(fam.id).filter((m) => visibleCard(m.id))
        if (items.length === 0) return null
        return (
          <section key={fam.id} aria-label={loc(fam.title)}>
            <h3 className="text-sm font-semibold">{loc(fam.title)}</h3>
            <p className="mb-1 text-xs text-slate-500">{loc(fam.hint)}</p>
            <ul className="flex flex-wrap gap-2">
              {items.map((m) => {
                const ex = examplesFor(m.id).filter((x) => visibleCard(x.id))
                return (
                  <li key={m.id} className="group relative">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-lg border bg-white px-3 py-1.5 text-sm shadow-sm hover:bg-amber-50 focus:bg-amber-50"
                      aria-describedby={`tip-${m.id}`}
                    >
                      <b>{m.ko}</b>
                      <span lang="ko" className="text-slate-500">
                        {m.hangul}
                      </span>
                      <span className="text-slate-600">= {loc(m.meaning)}</span>
                    </button>
                    <div
                      id={`tip-${m.id}`}
                      role="tooltip"
                      className="invisible absolute left-0 top-full z-20 mt-1 w-72 rounded-lg border bg-slate-900 p-3 text-xs text-white opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
                    >
                      <div className="mb-1 flex items-center gap-2 font-semibold">
                        {m.ko} <span lang="ko">{m.hangul}</span>
                        <SpeakButton text={m.hangul} className="!h-6 !w-6 !text-xs" />
                      </div>
                      {ex.length === 0 ? (
                        <p className="text-slate-300">—</p>
                      ) : (
                        <ul className="grid gap-0.5">
                          {ex.map((x) => (
                            <li key={x.id}>
                              <b>{x.ko}</b> <span className="text-slate-300">· {loc(x.names)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-1 text-slate-400">
                        {CARD_BY_ID[m.id] ? t('examplesHint') : ''}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
