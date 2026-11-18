import { CONCEPTS } from '../../data/concepts'
import type { Loc } from '../../shared/i18n/types'
import { useT } from '../../shared/i18n/useT'

const TITLE: Loc = {
  en: 'Understanding Taekwondo practice',
  de: 'Taekwondo-Praxis verstehen',
  es: 'Comprender la práctica de Taekwondo',
}
const INTRO: Loc = {
  en: 'Read a topic, connect its purpose to a familiar movement and bring your questions to class. These general learning examples do not replace instruction or individual health advice. Adapt or skip activities; no quantity is a requirement.',
  de: 'Lies ein Thema, verbinde seinen Zweck mit einer bekannten Bewegung und bring deine Fragen in den Unterricht. Diese allgemeinen Lernbeispiele ersetzen weder Anleitung noch persönliche gesundheitliche Beratung. Passe Aktivitäten an oder lasse sie aus; keine Mengenangabe ist eine Vorgabe.',
  es: 'Lee un tema, relaciona su propósito con un movimiento conocido y lleva tus preguntas a clase. Estos ejemplos generales no sustituyen la enseñanza ni la orientación sanitaria individual. Adapta u omite actividades; ninguna cantidad es obligatoria.',
}
const TOPICS: Loc = { en: 'Reading topics', de: 'Lesethemen', es: 'Temas de lectura' }

/** Named export. Standalone reading surface; routing/navigation integration is separate. */
export function ConceptsPage() {
  const { lang, loc } = useT()
  return (
    <div lang={lang} className="mx-auto grid w-full max-w-3xl gap-5">
      <h1 className="text-2xl font-bold">{loc(TITLE)}</h1>
      <p className="leading-relaxed text-slate-600">{loc(INTRO)}</p>
      <nav aria-label={loc(TOPICS)} className="rounded-xl border bg-white p-4">
        <h2 className="mb-2 font-bold">{loc(TOPICS)}</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {CONCEPTS.map((concept) => (
            <li key={concept.id}>
              <a href={`#${concept.id}`} className="text-sky-800 underline underline-offset-2">
                {loc(concept.title)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {CONCEPTS.map((concept) => (
        <section
          key={concept.id}
          id={concept.id}
          aria-labelledby={`${concept.id}-heading`}
          className="scroll-mt-6 rounded-xl border bg-white p-4 sm:p-6"
        >
          <h2 id={`${concept.id}-heading`} className="mb-3 text-xl font-bold">
            {loc(concept.title)}
          </h2>
          <div className="grid gap-4 leading-relaxed text-slate-700">
            {concept.paragraphs.map((paragraph, index) => <p key={index}>{loc(paragraph)}</p>)}
          </div>
        </section>
      ))}
    </div>
  )
}
