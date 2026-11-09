import type { Loc } from '../../shared/i18n/types'

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })

export const PRAISE: Loc[] = [
  L('Excellent! Like a tiger!', 'Ausgezeichnet! Wie ein Tiger!', '¡Excelente! ¡Como un tigre!'),
  L(
    'Great kick! (That one was a word.)',
    'Starker Tritt! (Das war ein Wort.)',
    '¡Gran patada! (Era una palabra.)',
  ),
  L(
    'Yes! Keep that spirit — kihap!',
    'Ja! Behalte den Geist – Kihap!',
    '¡Sí! Mantén ese espíritu: ¡kihap!',
  ),
  L(
    'Perfect. Your ear is getting used to Korean.',
    'Perfekt. Dein Ohr gewöhnt sich ans Koreanische.',
    'Perfecto. Tu oído se acostumbra al coreano.',
  ),
]

export const COMFORT: Loc[] = [
  L(
    'Not quite — even black belts were white belts once.',
    'Nicht ganz – auch Schwarzgurte waren mal weiß.',
    'Casi — hasta los cinturones negros fueron blancos.',
  ),
  L(
    'Mistakes are how the tiger learns. Look at the answer.',
    'Fehler lehren den Tiger. Sieh dir die Antwort an.',
    'Los errores enseñan al tigre. Mira la respuesta.',
  ),
  L(
    'Close! I will ask you again later.',
    'Fast! Ich frage dich später nochmal.',
    '¡Casi! Te lo preguntaré de nuevo luego.',
  ),
]

export const GREETING = (belt: Loc, streak: number): Loc => ({
  en: `Annyeong! I am Horangi, the tiger. Your belt: ${belt.en}.${streak > 1 ? ` ${streak} days in a row — wow!` : ''}`,
  de: `Annyeong! Ich bin Horangi, der Tiger. Dein Gürtel: ${belt.de}.${streak > 1 ? ` ${streak} Tage in Folge – wow!` : ''}`,
  es: `¡Annyeong! Soy Horangi, el tigre. Tu cinturón: ${belt.es}.${streak > 1 ? ` ¡${streak} días seguidos, guau!` : ''}`,
})

export const pick = <T>(list: T[], n: number): T => list[n % list.length]
