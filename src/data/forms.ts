import type { Loc } from '../shared/i18n/types'
import extra from './curriculum/forms-extra.json'

export interface Form {
  id: string
  /** club spelling (Formen PDF §4.3.1) */
  ko: string
  /** Kukkiwon Revised Romanization */
  kukkiwon: string
  hangul: string
  moves: number
  /** short English-first label of the symbol */
  symbol: Loc
  meaning: Loc
  /** exam level in the club programme: Kup number (7..1) or 0 for 1. Dan */
  examKup?: number
  /** Keup number used by the course video (another school) */
  courseKeup?: number
}

const L = (en: string, de: string, es: string): Loc => ({ en, de, es })

// Source: Formen §4.3.1 (meanings and move counts). Kukkiwon names: Taegeuk N Jang (태극 N장).
const BASE: Form[] = [
  {
    id: 'taeguk-1',
    ko: 'Taeguk Il-Chang',
    kukkiwon: 'Taegeuk Il Jang',
    hangul: '태극 일장',
    moves: 18,
    symbol: L('Heaven and light', 'Himmel und Licht', 'Cielo y luz'),
    meaning: L(
      'The creation: rain and sunlight come from the sky and let everything grow.',
      'Die Schöpfung: Vom Himmel kommen Regen und Sonnenlicht, die alles wachsen lassen.',
      'La creación: del cielo vienen la lluvia y la luz del sol que hacen crecer todo.',
    ),
  },
  {
    id: 'taeguk-2',
    ko: 'Taeguk I-Chang',
    kukkiwon: 'Taegeuk I Jang',
    hangul: '태극 이장',
    moves: 18,
    symbol: L('Still water (lake)', 'Das stillstehende Wasser', 'Agua quieta (lago)'),
    meaning: L(
      'Joy and cheerfulness: a joyful person has inner strength and stays calm.',
      'Frohsinn und Fröhlichkeit: Wer vom Frohsinn durchdrungen ist, hat innere Kraft und wirkt ruhig.',
      'Alegría y buen ánimo: quien tiene alegría posee fuerza interior y se mantiene tranquilo.',
    ),
  },
  {
    id: 'taeguk-3',
    ko: 'Taeguk Sam-Chang',
    kukkiwon: 'Taegeuk Sam Jang',
    hangul: '태극 삼장',
    moves: 20,
    symbol: L('Fire', 'Das Feuer', 'El fuego'),
    meaning: L(
      'Humans tamed fire: it gives warmth, light and hope, but also fear through its destructive power.',
      'Der Mensch zähmte das Feuer: Wärme, Licht und Hoffnung, aber auch Angst durch Zerstörungskraft.',
      'El ser humano domó el fuego: da calor, luz y esperanza, pero también miedo por su poder destructivo.',
    ),
  },
  {
    id: 'taeguk-4',
    ko: 'Taeguk Sa-Chang',
    kukkiwon: 'Taegeuk Sa Jang',
    hangul: '태극 사장',
    moves: 20,
    symbol: L('Thunder / lightning', 'Der Blitz', 'El rayo'),
    meaning: L(
      'Thunder and lightning inspire fear but also power: courage and calm in the face of danger.',
      'Donner und Blitz flößen Angst ein, bedeuten aber auch Kraft: Mut und Ruhe gegenüber Gefahr.',
      'Trueno y rayo inspiran miedo pero también fuerza: valor y calma ante el peligro.',
    ),
  },
  {
    id: 'taeguk-5',
    ko: 'Taeguk Oh-Chang',
    kukkiwon: 'Taegeuk O Jang',
    hangul: '태극 오장',
    moves: 20,
    symbol: L('Wind', 'Der Wind', 'El viento'),
    meaning: L(
      'The wind destroys in storms but also spreads seeds and scatters dark clouds.',
      'Der Wind zerstört im Sturm, verteilt aber auch Samen und zerstreut dunkle Wolken.',
      'El viento destruye en las tormentas, pero también reparte semillas y disipa las nubes oscuras.',
    ),
  },
  {
    id: 'taeguk-6',
    ko: 'Taeguk Yuk-Chang',
    kukkiwon: 'Taegeuk Yuk Jang',
    hangul: '태극 육장',
    moves: 19,
    symbol: L('Flowing water', 'Das fließende Wasser', 'El agua que fluye'),
    meaning: L(
      'Water keeps its nature and goes around obstacles; flowing, yielding and turning movements.',
      'Wasser behält seine Beschaffenheit und umgeht Hindernisse; fließende, ausweichende, drehende Bewegungen.',
      'El agua conserva su naturaleza y rodea los obstáculos; movimientos fluidos, cedentes y giratorios.',
    ),
  },
  {
    id: 'taeguk-7',
    ko: 'Taeguk Sil-Chang',
    kukkiwon: 'Taegeuk Chil Jang',
    hangul: '태극 칠장',
    moves: 25,
    symbol: L('Mountain', 'Das Gebirge', 'La montaña'),
    meaning: L(
      'The solid, resting mountain: firmness; go when you must and stop when it is right.',
      'Der solide, ruhende Berg: Festigkeit; gehen, wenn man muss, anhalten, wenn es geboten ist.',
      'La montaña sólida y en reposo: firmeza; avanzar cuando hay que hacerlo y detenerse cuando corresponde.',
    ),
  },
  {
    id: 'taeguk-8',
    ko: 'Taeguk Pal-Chang',
    kukkiwon: 'Taegeuk Pal Jang',
    hangul: '태극 팔장',
    moves: 27,
    symbol: L('Earth', 'Die Erde', 'La tierra'),
    meaning: L(
      'The earth receives the blessing of heaven and brings forth life: the mother of creation.',
      'Die Erde empfängt den Segen des Himmels und bringt Leben hervor: die Mutter der Schöpfung.',
      'La tierra recibe la bendición del cielo y da vida: la madre de la creación.',
    ),
  },
]

const LEVELS: Record<string, { examKup: number; courseKeup: number }> = Object.fromEntries(
  extra.formLevels.map((l) => [l.id, l]),
)

/** Taegeuk forms with their exam level (club) and course level (video). */
export const FORMS: Form[] = BASE.map((f) => ({ ...f, ...LEVELS[f.id] }))

export interface Hyong {
  id: string
  ko: string
  hangul: string
  moves: number
  /** Kup exam (7..1) when the form belongs to a Kup grade */
  examKup?: number
  /** Dan exam when it belongs to a Dan grade */
  examDan?: number
  symbol: Loc
  meaning: Loc
  source?: string
}

/** Hyong (ITF/Chang-Hon) forms from the club's Formen PDF §4.3.3. Hangul copied from the PDF (unverified). */
export const HYONG: Hyong[] = extra.hyong as Hyong[]

/** Master forms (Yudanja, Koryo → Ilyeo): Dan exam forms of the Poomse system, Formen PDF §4.3.2. */
export const YUDANJA: Hyong[] = (extra as { yudanja: Hyong[] }).yudanja

export const FORM_RULES: Loc[] = extra.rules as Loc[]

/** Belt index (0 = 10 Kup … 9 = 1 Kup, 10 = 1 Dan) at which a form is first required. */
export function formBeltIndex(f: { examKup?: number; examDan?: number }): number {
  if (f.examDan != null) return 10
  if (f.examKup == null) return 10
  return f.examKup === 0 ? 10 : 10 - f.examKup
}
