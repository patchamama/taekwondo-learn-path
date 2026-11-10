import type { Loc } from '../shared/i18n/types'
import { flat, mergeById } from './curriculum'

export type TermGroup = 'sino' | 'native' | 'command' | 'basic' | 'training' | 'body' | 'kukkiwon'

export interface Term {
  id: string
  ko: string
  hangul: string
  group: TermGroup
  meaning: Loc
  /** first belt where it is needed (10..1 Kup, 0 = 1 Dan); omitted = decided from lessons */
  kup?: number
}

const t = (
  group: TermGroup,
  ko: string,
  hangul: string,
  en: string,
  de: string,
  es: string,
): Term => ({ id: `${group}-${ko}`, ko, hangul, group, meaning: { en, de, es } })

const n = (group: TermGroup, ko: string, hangul: string, v: number): Term =>
  t(group, ko, hangul, String(v), String(v), String(v))

// Source: Koreanische Fachbegriffe §6.1–6.11 (hangul added for pronunciation)
const BASE: Term[] = [
  ...[
    ['il', '일'],
    ['i', '이'],
    ['sam', '삼'],
    ['sa', '사'],
    ['oh', '오'],
    ['yuk', '육'],
    ['chil', '칠'],
    ['pal', '팔'],
    ['ku', '구'],
    ['sib', '십'],
  ].map(([ko, h], i) => n('sino', ko, h, i + 1)),
  ...[
    ['hana', '하나'],
    ['dul', '둘'],
    ['set', '셋'],
    ['net', '넷'],
    ['dasot', '다섯'],
    ['yosot', '여섯'],
    ['ilgob', '일곱'],
    ['yodul', '여덟'],
    ['ahop', '아홉'],
    ['yol', '열'],
  ].map(([ko, h], i) => n('native', ko, h, i + 1)),

  t('basic', 'dojang', '도장', 'training hall', 'Übungsraum', 'sala de entrenamiento'),
  t('basic', 'dobok', '도복', 'taekwondo uniform', 'Taekwondo-Anzug', 'uniforme de taekwondo'),
  t('basic', 'ty', '띠', 'belt', 'Gürtel', 'cinturón'),
  t('basic', 'sabom', '사범', 'master / teacher', 'Meister, Lehrer', 'maestro / instructor'),
  t('basic', 'jeja', '제자', 'student', 'Schüler', 'alumno'),
  t('basic', 'kihap', '기합', 'spirit shout', 'Kampfschrei', 'grito de combate'),
  t('basic', 'hogu', '호구', 'chest protector', 'Schutzweste', 'peto protector'),
  t('basic', 'kam sa hamnida', '감사합니다', 'thank you', 'Danke', 'gracias'),

  t('command', 'charyot', '차렷', 'attention!', 'Achtung!', '¡firmes!'),
  t('command', 'kyongi', '경례', 'bow / salute', 'Grüßen', 'saludar'),
  t('command', 'chunbi', '준비', 'ready position', 'Ausgangsstellung', 'posición de preparación'),
  t('command', 'sijak', '시작', 'begin', 'Anfangen', 'empezar'),
  t('command', 'kallyo', '갈려', 'break / separate', 'Trennen', 'separar'),
  t('command', 'guman', '그만', 'stop / end', 'Ende', 'fin / parar'),
  t('command', 'tora', '돌아', 'turn around', 'Umdrehen', 'girar'),
  t('command', 'cuy-oh', '쉬어', 'rest', 'Pause', 'descanso'),

  t('training', 'kwon-sul', '권술', 'hand techniques', 'Handtechniken', 'técnicas de mano'),
  t('training', 'tae-sul', '태술', 'foot techniques', 'Fußtechniken', 'técnicas de pie'),
  t('training', 'tae-sogi', '태서기', 'stances', 'Fußstellungen', 'posiciones'),
  t('training', 'tul', '틀', 'forms (patterns)', 'Formen', 'formas'),
  t('training', 'kyorugi', '겨루기', 'sparring', 'Kampf', 'combate'),
  t('training', 'ho-sin-sul', '호신술', 'self-defence', 'Selbstverteidigung', 'defensa personal'),
  t('training', 'kyekpa', '격파', 'breaking test', 'Bruchtest', 'rotura'),
  t('training', 'ilon', '이론', 'theory', 'Theorie', 'teoría'),
  t('training', 'nak-bop', '낙법', 'breakfall', 'Fallschule', 'caídas'),
  t(
    'training',
    'sambo-taeryon',
    '삼보대련',
    'three-step sparring',
    'Drei-Schritt-Kampf',
    'combate de tres pasos',
  ),

  t('body', 'mori', '머리', 'head', 'Kopf', 'cabeza'),
  t('body', 'nun', '눈', 'eye', 'Auge', 'ojo'),
  t('body', 'ko', '코', 'nose', 'Nase', 'nariz'),
  t('body', 'ip', '입', 'mouth', 'Mund', 'boca'),
  t('body', 'gwi', '귀', 'ear', 'Ohr', 'oreja'),
  t('body', 'eokkae', '어깨', 'shoulder', 'Schulter', 'hombro'),
  t('body', 'gaseum', '가슴', 'chest', 'Brust', 'pecho'),
  t('body', 'pal', '팔', 'arm', 'Arm', 'brazo'),
  t('body', 'palkup', '팔꿈치', 'elbow', 'Ellenbogen', 'codo'),
  t('body', 'son', '손', 'hand', 'Hand', 'mano'),
  t('body', 'jumok', '주먹', 'fist', 'Faust', 'puño'),
  t('body', 'ipsul', '입술', 'lips', 'Lippen', 'labios'),
  t('body', 'dunbu', '둔부', 'hip', 'Hüfte', 'cadera'),
  t('body', 'eongdeongi', '엉덩이', 'buttocks', 'Gesäß', 'glúteos'),

  // Kukkiwon Revised Romanization: the names used by the self-defence course videos and by WT/Kukkiwon poomsae.
  t(
    'kukkiwon',
    'jireugi',
    '지르기',
    'thrust / punch (club: chirugi)',
    'Stoß (Verein: chirugi)',
    'golpe directo (club: chirugi)',
  ),
  t(
    'kukkiwon',
    'chigi',
    '치기',
    'strike (club: chicki)',
    'Schlag (Verein: chicki)',
    'golpe (club: chicki)',
  ),
  t(
    'kukkiwon',
    'chagi',
    '차기',
    'kick (same as club)',
    'Tritt (wie im Verein)',
    'patada (igual que en el club)',
  ),
  t(
    'kukkiwon',
    'makgi',
    '막기',
    'block (club: macki)',
    'Abwehr (Verein: macki)',
    'bloqueo (club: macki)',
  ),
  t(
    'kukkiwon',
    'seogi',
    '서기',
    'stance (club: sogi)',
    'Stellung (Verein: sogi)',
    'posición (club: sogi)',
  ),
  t('kukkiwon', 'ppaegi', '빼기', 'release / escape', 'Befreiung', 'liberación / escape'),
  t('kukkiwon', 'kkeokgi', '꺾기', 'joint lock / bending', 'Hebel / Beugen', 'luxación / torsión'),
  t(
    'kukkiwon',
    'neomgigi',
    '넘기기',
    'throw / take-down',
    'Wurf / Niederwerfen',
    'proyección / derribo',
  ),
  t('kukkiwon', 'joleugi', '조르기', 'choke', 'Würgen', 'estrangulación'),
  t(
    'kukkiwon',
    'poomsae',
    '품새',
    'form (Kukkiwon/WT)',
    'Form (Kukkiwon/WT)',
    'forma (Kukkiwon/WT)',
  ),
  t(
    'kukkiwon',
    'jang',
    '장',
    'chapter / number of a Taegeuk form',
    'Kapitel / Nummer einer Taegeuk-Form',
    'capítulo / número de una forma Taegeuk',
  ),
]

/** Base terms plus the ones introduced by the curriculum slices. */
export const TERMS: Term[] = mergeById(
  BASE,
  flat('terms').map((x): Term => ({
    id: `${x.group}-${x.ko}`,
    ko: x.ko,
    hangul: x.hangul,
    group: x.group,
    meaning: x.meaning,
    kup: x.kup,
  })),
  (x) => x.id,
)
