/**
 * Spelling and German meanings from the photographed glossary "Koreanische Fachausdrücke"
 * (Taekwondo Perfekt 2, pp. 10-12). The ids stay unchanged (progress and clips depend on them);
 * the book form is shown on the technique card as a synonym.
 */
const RESPELL: Record<string, string> = {
  macki: 'makki',
  packat: 'bakkat',
  chirugi: 'jireugi',
  chicki: 'chigi',
  düt: 'dwit',
  narani: 'naranhi',
  pyonsonkut: 'pyonsonkeut',
  jebipum: 'jebipoom',
}

const DE: Record<string, string> = {
  'ap-chagi': 'Vorwärtstritt',
  'yop-chagi': 'Seitwärtstritt',
  'dollyo-chagi': 'Drehtritt, Halbkreistritt',
  'twio-chagi': 'Tritt im Sprung',
  'ap-chigi': 'Schlag nach vorne',
  'sonnal-chigi': 'Handkantenschlag',
  'yop-chigi': 'Seitwärtsschlag',
  'mureup-chigi': 'Tritt mit dem Knie, Knieschlag',
  'momtong-jireugi': 'Fauststoß zum Körper',
  'arae-makki': 'Tiefblock',
  'olgul-makki': 'Gesichtsblock',
  'hechyo-makki': 'Keilblock',
  'sonnal-makki': 'Handkantenblock',
  'hansonnal-makki': 'Einzelhandkantenblock',
  'ap-gubi': 'vorn gebeugt, lange Vorwärtsstellung',
  'ap-sogi': 'Vorwärtsstellung, Schrittstellung',
  'dwit-gubi': 'Rückwärtsstellung',
  'juchum-sogi': 'Sitzstellung',
  'moa-sogi': 'geschlossene Stellung',
  'naranhi-sogi': 'Parallelstellung',
  'bom-sogi': 'Tiger-Stellung',
  'junbi-sogi': 'Vorbereitungsstellung',
}

const title = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export interface BookSynonym {
  spelling: string
  de?: string
}

/** Book spelling (and German meaning when the book gives one) of a technique id, or null if it adds nothing. */
export function bookSynonym(id: string): BookSynonym | null {
  const segments = id.split('-')
  const booked = segments.map((s) => RESPELL[s] ?? s)
  const key = booked.join('-')
  const de = DE[key]
  if (!de && key === id) return null
  const spelling = booked.map(title).join('-')
  return de ? { spelling, de } : { spelling }
}
