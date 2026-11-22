import type { Loc } from '../shared/i18n/types'
import { flat, mergeById } from './curriculum'
import type { MorphemeFamily } from './curriculum/types'
import { overrideOf } from './overrides'
import { CUSTOM } from './customCards'

export interface Morpheme {
  id: string
  ko: string
  hangul: string
  group: 'action' | 'zone' | 'direction' | 'tool'
  family: MorphemeFamily
  meaning: Loc
}

type BaseMorpheme = Omit<Morpheme, 'family'>

const m = (
  id: string,
  hangul: string,
  group: Morpheme['group'],
  en: string,
  de: string,
  es: string,
): BaseMorpheme => ({ id, ko: id, hangul, group, meaning: { en, de, es } })

const BASE: BaseMorpheme[] = [
  m('macki', '막기', 'action', 'block', 'Abwehr, Block', 'bloqueo'),
  m('chirugi', '지르기', 'action', 'thrust / punch', 'Stoß', 'golpe directo'),
  m('chicki', '치기', 'action', 'strike', 'Schlag', 'golpe de corte'),
  m('chagi', '차기', 'action', 'kick', 'Tritt', 'patada'),
  m('sogi', '서기', 'action', 'stance', 'Stellung', 'posición'),
  m('gubi', '굽이', 'action', 'bent (bow)', 'Beugestellung', 'arco'),
  m('olgul', '얼굴', 'zone', 'face / high', 'oben', 'cara / arriba'),
  m('momtong', '몸통', 'zone', 'trunk / middle', 'Mitte', 'tronco / medio'),
  m('arae', '아래', 'zone', 'low', 'unten', 'abajo'),
  m('mok', '목', 'zone', 'neck', 'Hals', 'cuello'),
  m('ap', '앞', 'direction', 'front', 'vorn', 'delante'),
  m('yop', '옆', 'direction', 'side', 'Seite', 'lado'),
  m('düt', '뒷', 'direction', 'back', 'hinten', 'atrás'),
  m('an', '안', 'direction', 'inside (outside→in)', 'von außen nach innen', 'hacia dentro'),
  m('packat', '바깥', 'direction', 'outside (inside→out)', 'von innen nach außen', 'hacia fuera'),
  m('naeryo', '내려', 'direction', 'downward (axe)', 'abwärts', 'hacia abajo (hacha)'),
  m('dollyo', '돌려', 'direction', 'turning / semicircular', 'halbkreisförmig', 'semicircular'),
  m('twio', '뛰어', 'direction', 'jumping', 'gesprungen', 'saltado'),
  m(
    'kotoro',
    '거들어',
    'direction',
    'reinforced (assisted)',
    'verstärkt (unterstützt)',
    'reforzado (asistido)',
  ),
  m(
    'goduro',
    '거들어',
    'direction',
    'reinforced (assisted)',
    'verstärkt (unterstützt)',
    'reforzado (asistido)',
  ),
  m('sonnal', '손날', 'tool', 'knife-hand edge', 'Handkante', 'canto de la mano'),
  m('palmok', '팔목', 'tool', 'forearm', 'Unterarm', 'antebrazo'),
  m('batangson', '바탕손', 'tool', 'palm heel', 'Handballen', 'talón de la mano'),
]

const FAMILY: Record<string, MorphemeFamily> = {
  macki: 'action',
  chirugi: 'action',
  chicki: 'action',
  chagi: 'action',
  sogi: 'stance',
  gubi: 'stance',
  olgul: 'height',
  momtong: 'height',
  arae: 'height',
  mok: 'target',
  ap: 'direction-axis',
  yop: 'direction-axis',
  düt: 'direction-axis',
  an: 'in-out',
  packat: 'in-out',
  naeryo: 'motion',
  dollyo: 'motion',
  twio: 'motion',
  kotoro: 'reinforce',
  goduro: 'reinforce',
  sonnal: 'tool',
  palmok: 'tool',
  batangson: 'tool',
}

/** Base morphemes plus the ones introduced by the curriculum slices (7 Kup → 1 Dan). */
export const MORPHEMES: Morpheme[] = mergeById(
  [...BASE.map((x) => ({ ...x, family: FAMILY[x.id] ?? 'other' })), ...CUSTOM.morphemes],
  flat('morphemes').map((x) => ({
    id: x.id,
    ko: x.id,
    hangul: x.hangul,
    group: x.group,
    family: x.family ?? 'other',
    meaning: x.meaning,
  })),
  (x) => x.id,
).map((m) => {
  const o = overrideOf(m.id)
  return {
    ...m,
    ...(o.ko && { ko: o.ko }),
    ...(o.hangul && { hangul: o.hangul }),
    ...(o.meaning && { meaning: o.meaning }),
  }
})

export const MORPHEME_BY_ID = Object.fromEntries(MORPHEMES.map((x) => [x.id, x]))
