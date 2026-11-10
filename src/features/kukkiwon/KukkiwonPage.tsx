import { CARD_BY_ID } from '../../data/cards'
import { KUKKIWON, noteFor } from '../../data/kukkiwon'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { useBeltFilter } from '../../shared/hooks/useBeltFilter'
import { useT } from '../../shared/i18n/useT'
import { CHECKS, CONSONANTS, INTRO, MATCH_LABEL, MATCH_STYLE, READ_NAME, VOWELS } from './content'

function SpellingTable({ rows, title }: { rows: typeof CONSONANTS; title: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white">
      <table className="w-full text-sm">
        <caption className="p-2 text-left font-semibold">{title}</caption>
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="p-2">Hangul</th>
            <th className="p-2">Kukkiwon</th>
            <th className="p-2">Club</th>
            <th className="p-2">Example</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.hangul} className="border-t">
              <td lang="ko" className="p-2 font-bold">
                {r.hangul}
              </td>
              <td className="p-2">{r.kukkiwon}</td>
              <td className="p-2">{r.club}</td>
              <td className="p-2">
                <span lang="ko">{r.example}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function KukkiwonPage() {
  const { t, loc, lang } = useT()
  const { visibleCard } = useBeltFilter()
  const techniques = KUKKIWON.filter(
    (k) => CARD_BY_ID[k.cardId]?.kind === 'technique' && visibleCard(k.cardId),
  )
  return (
    <section className="grid gap-5">
      <h1 className="text-2xl font-bold">{t('kkTitle')}</h1>
      <div className="grid gap-2 rounded-xl border bg-white p-4 text-sm">
        {INTRO.map((p) => (
          <p key={p.en}>{loc(p)}</p>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <SpellingTable rows={CONSONANTS} title={t('kkConsonants')} />
        <SpellingTable rows={VOWELS} title={t('kkVowels')} />
      </div>
      <p className="rounded-xl bg-sky-50 p-3 text-sm">{loc(READ_NAME)}</p>
      <p className="rounded-xl bg-amber-50 p-3 text-sm">{loc(CHECKS)}</p>

      <h2 className="text-xl font-bold">{t('kkTechniques')}</h2>
      <ul className="grid items-start gap-3 md:grid-cols-2">
        {techniques.map((k) => (
          <li key={k.cardId} className="rounded-xl border bg-white p-4 shadow-sm">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">{t('clubName')}</p>
                <p className="font-bold">{k.club}</p>
                <p className="mt-1 text-xs text-slate-500">{t('kukkiwonName')}</p>
                <p className="font-bold">
                  {k.kukkiwon}{' '}
                  <span lang="ko" className="font-normal text-slate-500">
                    {k.kukkiwonHangul}
                  </span>
                </p>
              </div>
              {CARD_BY_ID[k.cardId] && <SpeakButton text={CARD_BY_ID[k.cardId].hangul} />}
            </div>
            <p
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${MATCH_STYLE[k.match]}`}
            >
              {loc(MATCH_LABEL[k.match])}
            </p>
            <p className="mt-2 text-xs text-slate-600">
              {noteFor(k, lang)}
              {k.textbookPage ? ` (Textbook p.${k.textbookPage})` : ''}
            </p>
          </li>
        ))}
      </ul>
      <p className="text-xs text-slate-500">{t('kkSource')}</p>
    </section>
  )
}
