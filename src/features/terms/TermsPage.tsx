import { useT } from '../../shared/i18n/useT'

const SINO = ['il', 'i', 'sam', 'sa', 'oh', 'yuk', 'chil', 'pal', 'ku', 'sib']
const NATIVE = ['hana', 'dul', 'set', 'net', 'dasot', 'yosot', 'ilgob', 'yodul', 'ahop', 'yol']
const COMMANDS: [string, string, string, string][] = [
  ['Charyot', 'Attention', 'Achtung', 'Atención'],
  ['Kyungje', 'Bow', 'Grüßen', 'Saludar'],
  ['Chunbi', 'Ready position', 'Ausgangsstellung', 'Posición de preparación'],
  ['Sijak', 'Begin', 'Anfangen', 'Empezar'],
  ['Kallyo', 'Break / separate', 'Trennen', 'Separar'],
  ['Guman', 'Stop', 'Ende', 'Fin'],
  ['Tora', 'Turn around', 'Umdrehen', 'Girar'],
  ['Cuy-oh', 'Rest', 'Pause', 'Descanso'],
]

function NumberRow({ title, words }: { title: string; words: string[] }) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <h2 className="mb-2 font-semibold">{title}</h2>
      <ol className="grid grid-cols-2 gap-1 text-sm sm:grid-cols-5">
        {words.map((w, i) => (
          <li key={w}>
            <span className="text-slate-400">{i + 1}.</span> <b>{w}</b>
          </li>
        ))}
      </ol>
    </div>
  )
}

export function TermsPage() {
  const { t, lang } = useT()
  const idx = { en: 1, de: 2, es: 3 }[lang]
  return (
    <section className="grid gap-4">
      <h1 className="text-2xl font-bold">{t('numbers')}</h1>
      <NumberRow title={t('sinoKorean')} words={SINO} />
      <NumberRow title={t('native')} words={NATIVE} />
      <h2 className="text-xl font-bold">{t('commands')}</h2>
      <ul className="grid gap-2 sm:grid-cols-2">
        {COMMANDS.map((c) => (
          <li key={c[0]} className="rounded bg-white px-3 py-2 text-sm shadow-sm">
            <b>{c[0]}</b> – {c[idx]}
          </li>
        ))}
      </ul>
    </section>
  )
}
