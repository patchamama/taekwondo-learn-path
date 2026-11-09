import type { Loc } from '../shared/i18n/types'

export type TermGroup = 'sino' | 'native' | 'command' | 'basic' | 'training' | 'body'

export interface Term {
  id: string
  ko: string
  hangul: string
  group: TermGroup
  meaning: Loc
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
export const TERMS: Term[] = [
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
]
