import type { KnowledgeDoc } from '../bot/knowledge'
import type { Lang } from '../../shared/i18n/types'

type SearchCopy = {
  title: string
  query: string
  close: string
  clear: string
  empty: string
  nothing: string
  scope: string
  results: string
  sections: Record<KnowledgeDoc['kind'], string>
}

export const searchCopy: Record<Lang, SearchCopy> = {
  en: {
    title: 'Search the site', query: 'Search query', close: 'Close search', clear: 'Clear search',
    empty: 'Enter a term to search the learning content.',
    nothing: 'No results. Try another term or clear your search.',
    scope: 'Search vocabulary, concepts, history, background and exam theory in English, German, Spanish or Korean. Results are ranked by relevance within each section.',
    results: 'Results',
    sections: { card: 'Vocabulary and techniques', concept: 'Concepts', history: 'History', fact: 'Background', theory: 'Exam theory' },
  },
  de: {
    title: 'Website durchsuchen', query: 'Suchbegriff', close: 'Suche schließen', clear: 'Suche leeren',
    empty: 'Gib einen Begriff ein, um die Lerninhalte zu durchsuchen.',
    nothing: 'Keine Ergebnisse. Versuche einen anderen Begriff oder leere die Suche.',
    scope: 'Durchsuche Wortschatz, Konzepte, Geschichte, Hintergrund und Prüfungstheorie auf Englisch, Deutsch, Spanisch oder Koreanisch. Ergebnisse sind innerhalb jedes Abschnitts nach Relevanz sortiert.',
    results: 'Ergebnisse',
    sections: { card: 'Wortschatz und Techniken', concept: 'Konzepte', history: 'Geschichte', fact: 'Hintergrund', theory: 'Prüfungstheorie' },
  },
  es: {
    title: 'Buscar en el sitio', query: 'Término de búsqueda', close: 'Cerrar búsqueda', clear: 'Borrar búsqueda',
    empty: 'Escribe un término para buscar en los contenidos de aprendizaje.',
    nothing: 'Sin resultados. Prueba otro término o borra la búsqueda.',
    scope: 'Busca vocabulario, conceptos, historia, contexto y teoría del examen en inglés, alemán, español o coreano. Los resultados se ordenan por relevancia dentro de cada apartado.',
    results: 'Resultados',
    sections: { card: 'Vocabulario y técnicas', concept: 'Conceptos', history: 'Historia', fact: 'Contexto', theory: 'Teoría del examen' },
  },
}
