import type { Loc } from '../shared/i18n/types'

export interface TheoryItem {
  id: string
  question: Loc
  correct: Loc
  wrong: Loc[]
  /** pdf = stated in the club PDFs; general = common knowledge, confirm with your club */
  source: 'pdf' | 'general'
}

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })
const same = (v: string): Loc => L(v, v, v)

export const THEORY: TheoryItem[] = [
  {
    id: 'th-origin',
    source: 'pdf',
    question: L(
      'Which country does Taekwondo come from?',
      'Woher stammt Taekwondo?',
      '¿De qué país viene el Taekwondo?',
    ),
    correct: L('Korea', 'Korea', 'Corea'),
    wrong: [L('Japan', 'Japan', 'Japón'), same('China'), same('Vietnam')],
  },
  {
    id: 'th-founder',
    source: 'pdf',
    question: L(
      'Who developed Taekwondo (ITF)?',
      'Wer entwickelte das Taekwondo (ITF)?',
      '¿Quién desarrolló el Taekwondo (ITF)?',
    ),
    correct: same('General Choi Hong Hi'),
    wrong: [same('Gichin Funakoshi'), same('Bruce Lee'), same('Jigoro Kano')],
  },
  {
    id: 'th-year',
    source: 'general',
    question: L(
      'In which year was the name "Taekwondo" adopted?',
      'In welchem Jahr wurde der Name „Taekwondo“ angenommen?',
      '¿En qué año se adoptó el nombre «Taekwondo»?',
    ),
    correct: same('1955'),
    wrong: [same('1945'), same('1966'), same('1988')],
  },
  {
    id: 'th-itf',
    source: 'pdf',
    question: L(
      'When was the ITF founded in Seoul?',
      'Wann wurde die ITF in Seoul gegründet?',
      '¿Cuándo se fundó la ITF en Seúl?',
    ),
    correct: L('22 March 1966', '22. März 1966', '22 de marzo de 1966'),
    wrong: [
      L('1 June 1955', '1. Juni 1955', '1 de junio de 1955'),
      L('17 Sept 1988', '17. Sept. 1988', '17 sept. 1988'),
      L('9 Nov 1918', '9. Nov. 1918', '9 nov. 1918'),
    ],
  },
  {
    id: 'th-club',
    source: 'pdf',
    question: L(
      'The Ho-Sin-Sul Berlin e.V. celebrated its 30th anniversary with the 2024 exam rules. When was it founded?',
      'Der Ho-Sin-Sul Berlin e.V. feierte mit der Prüfungsordnung 2024 sein 30-jähriges Jubiläum. Wann wurde er gegründet?',
      'El Ho-Sin-Sul Berlin e.V. celebró su 30.º aniversario con el reglamento 2024. ¿Cuándo se fundó?',
    ),
    correct: same('1994'),
    wrong: [same('1984'), same('2004'), same('1974')],
  },
  {
    id: 'th-white',
    source: 'general',
    question: L(
      'Traditionally, what does the white belt symbolise?',
      'Was symbolisiert der weiße Gürtel traditionell?',
      '¿Qué simboliza tradicionalmente el cinturón blanco?',
    ),
    correct: L(
      'A beginner: purity, no prior knowledge',
      'Anfänger: Reinheit, kein Vorwissen',
      'Principiante: pureza, sin conocimientos previos',
    ),
    wrong: [
      L('Mastery of all forms', 'Beherrschung aller Formen', 'Dominio de todas las formas'),
      L('A fighter of the red team', 'Kämpfer des roten Teams', 'Combatiente del equipo rojo'),
      L('A teacher', 'Ein Lehrer', 'Un profesor'),
    ],
  },
  {
    id: 'th-yellow',
    source: 'general',
    question: L(
      'Traditionally, what does the yellow belt symbolise?',
      'Was symbolisiert der gelbe Gürtel traditionell?',
      '¿Qué simboliza tradicionalmente el cinturón amarillo?',
    ),
    correct: L(
      'Earth: the seed that starts to grow',
      'Erde: der Samen beginnt zu wachsen',
      'Tierra: la semilla empieza a crecer',
    ),
    wrong: [
      L('Sky and freedom', 'Himmel und Freiheit', 'Cielo y libertad'),
      L('Danger', 'Gefahr', 'Peligro'),
      L('Water', 'Wasser', 'Agua'),
    ],
  },
  {
    id: 'th-belt9',
    source: 'pdf',
    question: L(
      'What colour is the 9th Kup belt?',
      'Welche Farbe hat der 9. Kup?',
      '¿De qué color es el 9.º Kup?',
    ),
    correct: L(
      'White with a yellow stripe',
      'Weiß mit gelbem Streifen',
      'Blanco con raya amarilla',
    ),
    wrong: [
      L('Plain yellow', 'Gelb', 'Amarillo liso'),
      L('Yellow with green stripe', 'Gelb mit grünem Streifen', 'Amarillo con raya verde'),
      L('Plain white', 'Weiß', 'Blanco liso'),
    ],
  },
  {
    id: 'th-belt8',
    source: 'pdf',
    question: L(
      'What is the Korean name of the yellow belt (8th Kup)?',
      'Wie heißt der gelbe Gürtel (8. Kup) auf Koreanisch?',
      '¿Cómo se llama el cinturón amarillo (8.º Kup) en coreano?',
    ),
    correct: same('Narangsäk'),
    wrong: [same('Tschoroksäk'), same('Parangsäk'), same('Palgansäk')],
  },
  {
    id: 'th-sabom',
    source: 'pdf',
    question: L(
      'Which title is used for masters of the 5th–9th Dan?',
      'Welcher Titel gilt für Meister des 5.–9. Dan?',
      '¿Qué título se usa para maestros del 5.º al 9.º Dan?',
    ),
    correct: same('Sabom-nim-ke'),
    wrong: [same('Sabom'), same('Sabom-nim'), same('Jeja')],
  },
  {
    id: 'th-sabom2',
    source: 'pdf',
    question: L(
      'Which title is used for masters of the 1st–2nd Dan?',
      'Welcher Titel gilt für Meister des 1.–2. Dan?',
      '¿Qué título se usa para maestros del 1.º al 2.º Dan?',
    ),
    correct: same('Sabom'),
    wrong: [same('Sabom-nim-ke'), same('Sabom-nim'), same('Jeja')],
  },
  {
    id: 'th-saju',
    source: 'pdf',
    question: L(
      'Are saju-macki and saju-chirugi real forms?',
      'Sind saju-macki und saju-chirugi echte Formen?',
      '¿Son saju-macki y saju-chirugi formas reales?',
    ),
    correct: L(
      'No, they are preparatory drills',
      'Nein, es sind Vorübungen',
      'No, son ejercicios preparatorios',
    ),
    wrong: [
      L('Yes, both are Hyong', 'Ja, beide sind Hyong', 'Sí, ambas son Hyong'),
      L('Yes, both are Taeguk', 'Ja, beide sind Taeguk', 'Sí, ambas son Taeguk'),
      L('Only for black belts', 'Nur für Schwarzgurte', 'Solo para cinturones negros'),
    ],
  },
  {
    id: 'th-taeguk',
    source: 'pdf',
    question: L(
      'How many Taeguk forms are there?',
      'Wie viele Taeguk-Formen gibt es?',
      '¿Cuántas formas Taeguk hay?',
    ),
    correct: same('8'),
    wrong: [same('5'), same('9'), same('24')],
  },
  {
    id: 'th-hyong',
    source: 'pdf',
    question: L(
      'Which system was created by General Choi Hong Hi?',
      'Welches System schuf General Choi Hong Hi?',
      '¿Qué sistema creó el general Choi Hong Hi?',
    ),
    correct: same('Hyong / Tul'),
    wrong: [same('Poomse Taeguk'), same('Palgwae'), same('Yudanja')],
  },
  {
    id: 'th-seoul',
    source: 'pdf',
    question: L(
      'What is the capital of South Korea?',
      'Wie heißt die Hauptstadt Südkoreas?',
      '¿Cuál es la capital de Corea del Sur?',
    ),
    correct: L('Seoul', 'Seoul', 'Seúl'),
    wrong: [same('Pyeongyang'), same('Busan'), same('Tokyo')],
  },
  {
    id: 'th-flag',
    source: 'pdf',
    question: L(
      'What does the white background of the South Korean flag mean?',
      'Was bedeutet der weiße Hintergrund der südkoreanischen Flagge?',
      '¿Qué significa el fondo blanco de la bandera de Corea del Sur?',
    ),
    correct: L('Peace', 'Frieden', 'Paz'),
    wrong: [
      L('Winter', 'Winter', 'Invierno'),
      L('Purity of the army', 'Reinheit der Armee', 'Pureza del ejército'),
      L('The sky', 'Der Himmel', 'El cielo'),
    ],
  },
  {
    id: 'th-olympics',
    source: 'pdf',
    question: L(
      'Which city hosted the 1988 Olympic Games?',
      'Welche Stadt war 1988 Gastgeber der Olympischen Spiele?',
      '¿Qué ciudad acogió los Juegos Olímpicos de 1988?',
    ),
    correct: L('Seoul', 'Seoul', 'Seúl'),
    wrong: [same('Tokyo'), same('Beijing'), same('Berlin')],
  },
]

export const THEORY_BY_ID: Record<string, TheoryItem> = Object.fromEntries(
  THEORY.map((x) => [x.id, x]),
)
