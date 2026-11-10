import type { Loc } from '../shared/i18n/types'
import type { MorphemeFamily } from './curriculum/types'
import { MORPHEMES } from './morphemes'
import { TECHNIQUES } from './techniques'

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })

export interface FamilyInfo {
  id: MorphemeFamily
  title: Loc
  hint: Loc
}

/** Display order = reading order of a technique name: zone, direction, motion, tool, action. */
export const FAMILIES: FamilyInfo[] = [
  {
    id: 'height',
    title: L('Heights (zones)', 'Höhen (Zonen)', 'Alturas (zonas)'),
    hint: L(
      'Where the technique goes: high, middle, low.',
      'Wohin die Technik zielt: oben, Mitte, unten.',
      'A dónde va la técnica: alto, medio, bajo.',
    ),
  },
  {
    id: 'target',
    title: L('Targets', 'Ziele', 'Objetivos'),
    hint: L(
      'A specific part of the body.',
      'Ein bestimmter Körperteil.',
      'Una parte concreta del cuerpo.',
    ),
  },
  {
    id: 'direction-axis',
    title: L('Front · side · back', 'Vorn · Seite · hinten', 'Delante · lado · atrás'),
    hint: L(
      'Which way the technique faces or travels.',
      'In welche Richtung die Technik zeigt oder läuft.',
      'Hacia dónde mira o se mueve la técnica.',
    ),
  },
  {
    id: 'in-out',
    title: L('Inside · outside', 'Innen · außen', 'Dentro · fuera'),
    hint: L(
      'The path of the arm or leg across the body.',
      'Der Weg von Arm oder Bein vor dem Körper.',
      'El recorrido del brazo o la pierna ante el cuerpo.',
    ),
  },
  {
    id: 'motion',
    title: L('Movement', 'Bewegung', 'Movimiento'),
    hint: L(
      'How it moves: down, turning, jumping.',
      'Wie es sich bewegt: abwärts, drehend, gesprungen.',
      'Cómo se mueve: hacia abajo, giratorio, saltado.',
    ),
  },
  {
    id: 'reinforce',
    title: L('Reinforced', 'Verstärkt', 'Reforzado'),
    hint: L(
      'The second arm helps the first.',
      'Der zweite Arm unterstützt den ersten.',
      'El segundo brazo ayuda al primero.',
    ),
  },
  {
    id: 'tool',
    title: L(
      'Body tools (hand and foot zones)',
      'Werkzeuge (Hand- und Fußzonen)',
      'Herramientas (zonas de mano y pie)',
    ),
    hint: L(
      'The part of the body that hits or blocks.',
      'Der Körperteil, der trifft oder abwehrt.',
      'La parte del cuerpo que golpea o bloquea.',
    ),
  },
  {
    id: 'action',
    title: L(
      'Actions (the last word)',
      'Aktionen (das letzte Wort)',
      'Acciones (la última palabra)',
    ),
    hint: L(
      'What you do: block, punch, strike, kick.',
      'Was du tust: abwehren, stoßen, schlagen, treten.',
      'Lo que haces: bloquear, golpear, cortar, patear.',
    ),
  },
  {
    id: 'stance',
    title: L('Stances', 'Stellungen', 'Posiciones'),
    hint: L('How you stand.', 'Wie du stehst.', 'Cómo te colocas.'),
  },
  {
    id: 'count',
    title: L('Numbers and counts', 'Zahlen und Zählung', 'Números y recuento'),
    hint: L(
      'How many hands or repetitions.',
      'Wie viele Hände oder Wiederholungen.',
      'Cuántas manos o repeticiones.',
    ),
  },
  {
    id: 'other',
    title: L('Other words', 'Weitere Wörter', 'Otras palabras'),
    hint: L('More building blocks.', 'Weitere Bausteine.', 'Más ladrillos.'),
  },
]

/** Techniques whose name contains the morpheme (lowest belt first), for the hover hint. */
export function examplesFor(morphemeId: string, limit = 5) {
  // simple techniques first (not combos), then the shortest names, so the hint stays readable
  return TECHNIQUES.filter((t) => t.parts.includes(morphemeId))
    .sort(
      (a, b) =>
        Number(a.category === 'combo') - Number(b.category === 'combo') ||
        a.id.length - b.id.length,
    )
    .slice(0, limit)
}

export const morphemesOfFamily = (family: MorphemeFamily) =>
  MORPHEMES.filter((m) => m.family === family)
