import type { Loc } from '../../shared/i18n/types'

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })

// Condensed from docs/kukkiwon-terminology.md §0-1 (see that file for sources and page numbers).
export const INTRO: Loc[] = [
  L(
    'Videos from the Kukkiwon world (e.g. the self-defence course) spell the same Korean words differently from your club. The movements are the same: only the Latin spelling changes.',
    'Videos aus der Kukkiwon-Welt (z. B. der Selbstverteidigungskurs) schreiben dieselben koreanischen Wörter anders als euer Verein. Die Bewegungen sind gleich: nur die lateinische Schreibweise ändert sich.',
    'Los vídeos del mundo Kukkiwon (p. ej. el curso de defensa personal) escriben las mismas palabras coreanas de otra forma que tu club. Los movimientos son los mismos: solo cambia la escritura latina.',
  ),
  L(
    'Three traditions are mixed: Kukkiwon/WT (Poomsae Taegeuk), ITF/Chang-Hon (Tul, "sine wave") and your club, which teaches both.',
    'Drei Traditionen mischen sich: Kukkiwon/WT (Poomsae Taegeuk), ITF/Chang-Hon (Tul, „Sinuswelle“) und euer Verein, der beides lehrt.',
    'Se mezclan tres tradiciones: Kukkiwon/WT (Poomsae Taegeuk), ITF/Chang-Hon (Tul, «onda sinusoidal») y tu club, que enseña ambas.',
  ),
  L(
    'Hangul is the only unambiguous reference: in the club spelling "ch" can be ㅈ or ㅊ, "k" can be ㄱ or ㅋ, "p" can be ㅂ or ㅍ. That is why the app always shows hangul.',
    'Hangul ist die einzige eindeutige Referenz: In der Vereinsschreibweise kann „ch“ ㅈ oder ㅊ sein, „k“ ㄱ oder ㅋ, „p“ ㅂ oder ㅍ. Deshalb zeigt die App immer Hangul.',
    'El hangul es la única referencia sin ambigüedad: en la escritura del club «ch» puede ser ㅈ o ㅊ, «k» ㄱ o ㅋ, «p» ㅂ o ㅍ. Por eso la app siempre muestra hangul.',
  ),
]

export const CONSONANTS: { hangul: string; kukkiwon: string; club: string; example: string }[] = [
  { hangul: 'ㄱ', kukkiwon: 'g (k at the end)', club: 'k, g, ck', example: '막기 makgi ~ macki' },
  { hangul: 'ㅈ', kukkiwon: 'j', club: 'ch, j', example: '지르기 jireugi ~ chirugi' },
  { hangul: 'ㅊ', kukkiwon: 'ch', club: 'ch', example: '차기 chagi = chagi' },
  { hangul: 'ㅂ / ㅃ', kukkiwon: 'b / pp', club: 'p, b', example: '바깥 bakkat ~ packat' },
  { hangul: 'ㄷ', kukkiwon: 'd', club: 't, d', example: '대련 daeryeon ~ taeryon' },
  { hangul: 'ㄸ', kukkiwon: 'tt', club: 't', example: '뛰어 ttwieo ~ twio' },
]

export const VOWELS: { hangul: string; kukkiwon: string; club: string; example: string }[] = [
  { hangul: 'ㅓ', kukkiwon: 'eo', club: 'o', example: '서기 seogi ~ sogi' },
  { hangul: 'ㅡ', kukkiwon: 'eu', club: 'u, o', example: '지르기 jireugi ~ chirugi' },
  { hangul: 'ㅕ', kukkiwon: 'yeo', club: 'yo', example: '옆 yeop ~ yop' },
  { hangul: 'ㅟ', kukkiwon: 'wi', club: 'wi, ü', example: '뒷 dwit ~ düt' },
]

export const READ_NAME: Loc = L(
  'Reading a Kukkiwon name: body part + target (+ direction) + technique type. Example: 한손날 몸통 안막기 hansonnal momtong an-makgi = one hand-blade + trunk + inward + block.',
  'Einen Kukkiwon-Namen lesen: Körperteil + Ziel (+ Richtung) + Technikart. Beispiel: 한손날 몸통 안막기 hansonnal momtong an-makgi = eine Handkante + Rumpf + nach innen + Block.',
  'Cómo leer un nombre Kukkiwon: parte del cuerpo + objetivo (+ dirección) + tipo de técnica. Ejemplo: 한손날 몸통 안막기 hansonnal momtong an-makgi = un canto de mano + tronco + hacia dentro + bloqueo.',
)

export const CHECKS: Loc = L(
  'Are two names the same technique? Check: 1) same last word (makgi/jireugi/chigi/chagi/seogi), 2) same body part, 3) same zone and direction, 4) same number of hands. If all agree once spelling is undone, treat them as the same.',
  'Sind zwei Namen dieselbe Technik? Prüfe: 1) gleiches Schlusswort (makgi/jireugi/chigi/chagi/seogi), 2) gleicher Körperteil, 3) gleiche Zone und Richtung, 4) gleiche Handzahl. Stimmt alles überein, wenn man die Schreibweise abzieht, gelten sie als gleich.',
  '¿Dos nombres son la misma técnica? Comprueba: 1) misma última palabra (makgi/jireugi/chigi/chagi/seogi), 2) misma parte del cuerpo, 3) misma zona y dirección, 4) mismo número de manos. Si todo coincide quitando la ortografía, es la misma.',
)

export const MATCH_LABEL: Record<string, Loc> = {
  same: L(
    'same: only spelling differs',
    'gleich: nur die Schreibweise unterscheidet sich',
    'igual: solo cambia la ortografía',
  ),
  similar: L(
    'similar: small detail differs',
    'ähnlich: kleines Detail anders',
    'parecida: cambia un pequeño detalle',
  ),
  different: L('different: false friend!', 'anders: falscher Freund!', 'distinta: ¡falso amigo!'),
  none: L(
    'not in Kukkiwon (ITF/club drill)',
    'nicht im Kukkiwon (ITF-/Vereinsübung)',
    'no está en Kukkiwon (ejercicio ITF/club)',
  ),
  unverified: L('unverified', 'nicht verifiziert', 'sin verificar'),
}

export const MATCH_STYLE: Record<string, string> = {
  same: 'bg-emerald-100 text-emerald-800',
  similar: 'bg-amber-100 text-amber-800',
  different: 'bg-rose-100 text-rose-800',
  none: 'bg-slate-200 text-slate-700',
  unverified: 'bg-slate-100 text-slate-600',
}
