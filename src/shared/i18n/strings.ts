import type { Lang } from './types'

type Dict = Record<string, Record<Lang, string>>

export const STRINGS = {
  appTitle: {
    en: 'Taekwondo – The Way (Do)',
    de: 'Taekwondo – Der Weg (Do)',
    es: 'Taekwondo – El Camino (Do)',
  },
  navPath: { en: 'Path', de: 'Pfad', es: 'Camino' },
  navTechniques: { en: 'Techniques', de: 'Techniken', es: 'Técnicas' },
  navTerms: { en: 'Korean terms', de: 'Koreanische Begriffe', es: 'Términos coreanos' },
  navForms: { en: 'Forms', de: 'Formen', es: 'Formas' },
  navHistory: { en: 'History', de: 'Geschichte', es: 'Historia' },
  pathTitle: {
    en: 'Your path to the black belt',
    de: 'Dein Weg zum schwarzen Gürtel',
    es: 'Tu camino al cinturón negro',
  },
  pathHint: {
    en: 'Click a belt to see it. Mark it as reached to move your apprentice forward.',
    de: 'Klicke einen Gürtel an. Markiere ihn als erreicht, um den Schüler voranzubringen.',
    es: 'Haz clic en un cinturón. Márcalo como alcanzado para avanzar al aprendiz.',
  },
  youAreHere: { en: 'You are here', de: 'Du bist hier', es: 'Estás aquí' },
  markReached: { en: 'I reached this belt', de: 'Gürtel erreicht', es: 'Alcancé este cinturón' },
  resetProgress: { en: 'Reset progress', de: 'Fortschritt zurücksetzen', es: 'Reiniciar progreso' },
  comingSoon: { en: 'Content coming soon', de: 'Inhalte folgen', es: 'Contenido próximamente' },
  learned: { en: 'learned', de: 'gelernt', es: 'aprendidas' },
  learnedToggle: {
    en: 'Mark as learned',
    de: 'Als gelernt markieren',
    es: 'Marcar como aprendida',
  },
  breakdown: { en: 'Word breakdown', de: 'Wortzerlegung', es: 'Desglose de la palabra' },
  karate: {
    en: 'Karate equivalent (approx.)',
    de: 'Karate-Entsprechung (ca.)',
    es: 'Equivalente en karate (aprox.)',
  },
  all: { en: 'All', de: 'Alle', es: 'Todas' },
  catHand: { en: 'Hand', de: 'Hand', es: 'Mano' },
  catFoot: { en: 'Foot', de: 'Fuß', es: 'Pie' },
  catStance: { en: 'Stances', de: 'Stellungen', es: 'Posiciones' },
  catCombo: { en: 'Combos', de: 'Kombinationen', es: 'Combinaciones' },
  morphemes: { en: 'Word building blocks', de: 'Wortbausteine', es: 'Ladrillos de las palabras' },
  morphemesHint: {
    en: 'Technique name = [zone/direction] + [tool] + [action]',
    de: 'Technikname = [Zone/Richtung] + [Werkzeug] + [Aktion]',
    es: 'Nombre = [zona/dirección] + [herramienta] + [acción]',
  },
  numbers: { en: 'Numbers 1–10', de: 'Zahlen 1–10', es: 'Números 1–10' },
  sinoKorean: {
    en: 'Sino-Korean (forms, ranks)',
    de: 'Sino-koreanisch (Formen, Grade)',
    es: 'Sino-coreanos (formas, grados)',
  },
  native: {
    en: 'Native Korean (repetitions)',
    de: 'Koreanisch (Wiederholungen)',
    es: 'Coreanos nativos (repeticiones)',
  },
  commands: { en: 'Commands', de: 'Kommandos', es: 'Comandos' },
  formsTitle: {
    en: 'Two form systems: Poomse and Hyong',
    de: 'Zwei Formen-Systeme: Poomse und Hyong',
    es: 'Dos sistemas de formas: Poomse y Hyong',
  },
  historyTitle: {
    en: 'History of Taekwondo',
    de: 'Geschichte des Taekwondo',
    es: 'Historia del Taekwondo',
  },
  placeholder: {
    en: 'To be filled in a later phase.',
    de: 'Wird in einer späteren Phase gefüllt.',
    es: 'Se completará en una fase posterior.',
  },
  version: { en: 'Version', de: 'Version', es: 'Versión' },
} satisfies Dict

export type StringKey = keyof typeof STRINGS
