import type { RuleSection } from '../../data/examRules'
import { useT } from '../i18n/useT'

/** Titled sections made of bullets and label/value tables (exam rules, Korea facts). */
export function FactSections({ sections }: { sections: RuleSection[] }) {
  const { loc } = useT()
  return (
    <div className="grid gap-4">
      {sections.map((s) => (
        <section
          key={s.id}
          className="rounded-xl border bg-white p-5"
          aria-labelledby={`fs-${s.id}`}
        >
          <h2 id={`fs-${s.id}`} className="mb-2 text-lg font-semibold">
            {loc(s.title)}
          </h2>
          {s.bullets && (
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {s.bullets.map((b) => (
                <li key={b.en}>{loc(b)}</li>
              ))}
            </ul>
          )}
          {s.rows && (
            <dl className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-[max-content_1fr]">
              {s.rows.map((r) => (
                <div key={r.label.en} className="contents">
                  <dt className="font-semibold">{loc(r.label)}</dt>
                  <dd className="text-slate-700">{loc(r.value)}</dd>
                </div>
              ))}
            </dl>
          )}
        </section>
      ))}
    </div>
  )
}
